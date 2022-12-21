export function createClient<T>() {
  function generateAPI(baseUrl = '/api/__remote'): T {
    const noop = () => {}
    noop.url = baseUrl

    return new Proxy(noop, {
      get({ url }, path: string) {
        return generateAPI(`${url}/${path}`)
      },
      apply({ url }, _thisArg, args) {
        return globalThis.$fetch(url, {
          method: 'POST',
          body: {
            args
          }
        })
      },
    }) as unknown as T
  }

  return generateAPI()
}
