interface Options {
  fetchOptions: Parameters<typeof globalThis.$fetch>[1]
}

export function createClient<T>(options?: Options) {
  function generateAPI(baseUrl = '/api/__remote'): T {
    const noop = () => {}
    noop.url = baseUrl

    return new Proxy(noop, {
      get({ url }, path: string) {
        return generateAPI(`${url}/${path}`)
      },
      apply({ url }, _thisArg, args) {
        return globalThis.$fetch(url, {
          ...options?.fetchOptions,
          method: 'POST',
          body: {
            args
          },
        })
      },
    }) as unknown as T
  }

  return generateAPI()
}
