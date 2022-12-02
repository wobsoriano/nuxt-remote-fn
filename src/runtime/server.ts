import { eventHandler, isMethod, readBody, createError } from 'h3'
import type { ModuleOptions } from '../module'
import { getEvent, wrapEventHandler } from './experimental'

export function createRemoteFnHandler<T> (functions: T, options: ModuleOptions): any {
  const handler = eventHandler(async (event) => {
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
    const result = await functions[moduleId][functionName].apply(event, input)
    return result
  })

  if (options.experimentalEvent) { return wrapEventHandler(handler) }

  return handler
}

export {
  getEvent
}
