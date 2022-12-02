import { AsyncLocalStorage } from 'async_hooks'
import { eventHandler } from 'h3'
import type { EventHandler, H3Event } from 'h3'

const DEFAULT_CONTEXT = {}

const asyncLocalStorage = new AsyncLocalStorage<H3Event>()

/**
 * Access the event object. Uses the experimental async_hooks.
 * @experimental
 * @see [source](https://github.com/nodejs/node/blob/v18.0.0/lib/async_hooks.js)
 */
export function getEvent (): H3Event {
  return asyncLocalStorage.getStore() || DEFAULT_CONTEXT as H3Event
}

export function wrapEventHandler (handler: EventHandler): EventHandler {
  return eventHandler((event) => {
    const context = {
      node: event.node,
      context: event.context,
      path: event.path
    }
    return asyncLocalStorage.run(context as H3Event, () => handler(event))
  })
}
