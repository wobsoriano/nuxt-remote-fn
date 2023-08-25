import { eventHandler, createError, readBody } from 'h3'
import { AsyncLocalStorage } from 'node:async_hooks';
import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'

const DEFAULT_CONTEXT = {} as H3Event;

const asyncLocalStorage = new AsyncLocalStorage<H3Event>();

export function useEvent(): H3Event {
  return asyncLocalStorage.getStore() || DEFAULT_CONTEXT;
}

type ModuleFunctionsMap = Record<string, Record<string, (...args: any[]) => any>>;

export function createRemoteFnHandler<
  FunctionMap extends ModuleFunctionsMap,
  ModuleName extends keyof FunctionMap
> (functions: FunctionMap): EventHandler<EventHandlerRequest, Promise<any>> {
  const handler = eventHandler<{
    body: {
      args: Parameters<FunctionMap[ModuleName][keyof FunctionMap[ModuleName]]>
    }
  }>(async (event) => {
    const body = await readBody(event)
    const { moduleId, functionName } = event.context.params as {
      moduleId: ModuleName
      functionName: keyof FunctionMap[ModuleName]
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

    if ('createContext' in functions[moduleId]) {
      await functions[moduleId]['createContext'].apply(event)
    }
  
    const result = functions[moduleId][functionName].apply(event, body.args)
    return result
  })

  return eventHandler((event) => {
    return asyncLocalStorage.run(event, () => handler(event))
  })
}
