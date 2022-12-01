import type { EventHandler } from 'h3'
import { eventHandler, isMethod, readBody, createError } from 'h3'

export function createRemoteFnHandler<T> (functions: T): EventHandler<T> {
  return eventHandler(async (event) => {
    if (!isMethod(event, 'POST')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Only POST requests are allowed.'
      })
    }

    const { input } = await readBody(event) // arguments
    const { path } = event.context.params // 'todo.getTodos'
    const [moduleId, functionName] = path.split('.') // ['todo', 'getTodos']

    if (!(moduleId in functions)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Unknown module received.'
      })
    }

    // @ts-ignore
    const result = await functions[moduleId][functionName].apply(event, input)
    return result
  })
}
