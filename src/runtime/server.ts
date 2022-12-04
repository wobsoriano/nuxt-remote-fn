import { eventHandler, isMethod, createError, readBody } from 'h3'
import { createContext } from 'unctx'
import type { EventHandler, H3Event } from 'h3'

const ctx = createContext<H3Event>()

export const useEvent = ctx.use

export function createRemoteFnHandler<T> (functions: T): EventHandler<T> {
  return eventHandler(async (event) => {
    if (!isMethod(event, 'POST')) {
      throw createError({
        statusCode: 405,
        statusMessage: `[nuxt-remote-fn]: method "${event.node.req.method}" is not allowed.`
      })
    }

    const body = await readBody(event)
    const { moduleId, functionName } = event.context.params

    return ctx.call(event, () => {
      if (!(moduleId in functions)) {
        throw createError({
          statusCode: 404,
          statusMessage: '[nuxt-remote-fn]: Unknown module received.'
        })
      }

      // @ts-ignore
      const result = functions[moduleId][functionName].apply(event, body.args)
      return result
    })
  })
}
