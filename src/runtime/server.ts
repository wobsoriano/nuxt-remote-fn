import { AsyncLocalStorage } from 'async_hooks'
import type { EventHandler, H3Event } from 'h3'
import { eventHandler, isMethod, readBody, createError } from 'h3'

const DEFAULT_CONTEXT = {}

const asyncLocalStorage = new AsyncLocalStorage<H3Event>()

export function getEvent (): H3Event {
  return asyncLocalStorage.getStore() || DEFAULT_CONTEXT as H3Event
}

function wrapEventHandler (handler: EventHandler): EventHandler {
  return eventHandler((event) => {
    const context = {
      node: event.node,
      context: event.context,
      path: event.path
    }
    return asyncLocalStorage.run(context as H3Event, () => handler(event))
  })
}

export function createRemoteFnHandler<T> (functions: T): any {
  return wrapEventHandler(eventHandler(async (event) => {
    if (!isMethod(event, 'POST')) {
      throw createError({
        statusCode: 405,
        statusMessage: `[nuxt-remote-fn]: method "${event.node.req.method}" is not allowed.`
      })
    }

    const { input } = await readBody(event) // arguments
    const { path } = event.context.params // 'todo.getTodos'
    const [moduleId, functionName] = path.split('.') // ['todo', 'getTodos']

    if (!(moduleId in functions)) {
      throw createError({
        statusCode: 404,
        statusMessage: '[nuxt-remote-fn]: Unknown module received.'
      })
    }

    // @ts-ignore
    const result = await functions[moduleId][functionName](...input)
    return result
  }))
}
