import { eventHandler, isMethod, createError, readBody } from 'h3'
import { createContext } from 'unctx'
import type { EventHandler, H3Event } from 'h3'

const ctx = createContext<H3Event>()

export const useEvent = ctx.use

export function createRemoteFnHandler<
  F extends Record<string, Record<string, () => any>>,
  M extends keyof F,
> (functions: F): EventHandler<any> {
  return eventHandler(async (event) => {
    if (!isMethod(event, 'POST')) {
      throw createError({
        statusCode: 405,
        statusMessage: `[nuxt-remote-fn]: method "${event.node.req.method}" is not allowed.`
      })
    }

    const body = await readBody(event)
    const { moduleId, functionName } = event.context.params as {
      moduleId: M
      functionName: keyof F[M]
    }

    if (!(moduleId in functions)) {
      throw createError({
        statusCode: 404,
        statusMessage: '[nuxt-remote-fn]: Unknown module received.'
      })
    }

    return ctx.call(event, () => {
      const result = functions[moduleId][functionName].apply(event, body.args)
      return result
    })
  })
}
