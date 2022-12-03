import { createContext } from 'unctx'
import { eventHandler } from 'h3'
import type { EventHandler, H3Event } from 'h3'

const ctx = createContext<H3Event>()

export const useEvent = ctx.use

export function wrapEventHandler (handler: EventHandler): EventHandler {
  return eventHandler((event) => {
    return ctx.call(event, () => handler(event))
  })
}
