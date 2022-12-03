import { createContext } from 'unctx'
import { eventHandler, readBody } from 'h3'
import type { EventHandler, H3Event } from 'h3'

const ctx = createContext<H3Event>()

export const useEvent = ctx.use

export function wrapEventHandler (handler: EventHandler): EventHandler {
  return eventHandler(async (event) => {
    const body = await readBody(event)
    event.context.__body = body

    return ctx.call(event, () => handler(event))
  })
}
