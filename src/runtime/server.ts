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
    const body = await readBody(event)
    const { moduleId, functionName } = event.context.params as {
      moduleId: M
      functionName: keyof F[M]
    }

    if (!(moduleId in functions)) {
      throw createError({
        statusCode: 400,
        statusMessage: `[nuxt-remote-fn]: Module ${moduleId as string} does not exist. Are you sure the file exists?`
      })
    }

    if (typeof functions[moduleId][functionName] !== 'function') {
      throw createError({
        statusCode: 400,
        statusMessage: `[nuxt-remote-fn]: ${functionName as string} is not a function.`
      })
    }

    return ctx.call(event, () => {
      const result = functions[moduleId][functionName].apply(event, body.args)
      return result
    })
  })
}
