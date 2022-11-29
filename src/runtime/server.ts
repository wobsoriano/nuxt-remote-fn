import type { EventHandler } from 'h3'
import { eventHandler, readBody, isMethod } from 'h3'
import { getQuery } from 'ufo'

export function createServerFnAPI<T> (functions: T): EventHandler<T> {
  return eventHandler(async (event) => {
    let name: string | undefined
    let args: any[] = []

    if (isMethod(event, 'POST')) {
      const body = await readBody(event)
      name = body.name
      args = body.args || []
    } else {
      const query = getQuery(event.path as string) as Record<string, string>
      name = query.name
      args = JSON.parse(query.args || '[]') || []
    }

    if (!name || !(name in functions)) {
      event.node.res.statusCode = 404
      return
    }

    // @ts-ignore
    const result = await functions[name].apply(event, args)
    return result
  })
}
