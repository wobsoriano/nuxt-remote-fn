import { eventHandler, isMethod, getQuery, createError } from 'h3'
import { useEvent, wrapEventHandler } from './experimental'

export function createRemoteFnHandler<T> (functions: T): any {
  return wrapEventHandler(eventHandler((event) => {
    if (!isMethod(event, 'POST')) {
      throw createError({
        statusCode: 405,
        statusMessage: `[nuxt-remote-fn]: method "${event.node.req.method}" is not allowed.`
      })
    }

    const { input } = getQuery(event) // arguments
    const { path } = event.context.params // 'todo.getTodos'
    const [moduleId, functionName] = path.split('.') // ['todo', 'getTodos']

    if (!(moduleId in functions)) {
      throw createError({
        statusCode: 404,
        statusMessage: '[nuxt-remote-fn]: Unknown module received.'
      })
    }

    // @ts-ignore
    const result = functions[moduleId][functionName].apply(event, JSON.parse(input))
    return result
  }))
}

export {
  useEvent
}
