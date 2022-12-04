import { eventHandler, isMethod, createError } from 'h3'
import { useEvent, wrapEventHandler } from './context'

export function createRemoteFnHandler<T> (functions: T): any {
  return wrapEventHandler(eventHandler((event) => {
    if (!isMethod(event, 'POST')) {
      throw createError({
        statusCode: 405,
        statusMessage: `[nuxt-remote-fn]: method "${event.node.req.method}" is not allowed.`
      })
    }

    const { args } = event.context.__body // arguments
    const { moduleId, functionName } = event.context.params // todo, getTodos

    if (!(moduleId in functions)) {
      throw createError({
        statusCode: 404,
        statusMessage: '[nuxt-remote-fn]: Unknown module received.'
      })
    }

    // @ts-ignore
    const result = functions[moduleId][functionName].apply(event, args)
    return result
  }))
}

export {
  useEvent
}
