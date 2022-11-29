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
    const { moduleId } = event.context.params // 'todo.getTodos'
    const [id, name] = moduleId.split('.') // ['todo', 'getTodos']

    if (!(id in functions)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Unknown module received.'
      })
    }

    // @ts-ignore
    const result = await functions[id][name].apply(event, input)
    return result
  })
}

export function Abort () {
  return createError({
    statusCode: 403
  })
}
