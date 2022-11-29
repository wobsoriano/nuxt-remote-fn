import { $fetch } from 'ofetch'

function createRemoteFunctions (route: string) {
  const callable = () => {}
  return new Proxy(callable, {
    get (_, name) {
      return (...args: any[]) => {
        return $fetch(route, {
          method: 'POST',
          body: {
            name,
            args
          }
        })
      }
    }
  })
}

const remoteClient = createRemoteFunctions('/api/__remote_fn__')

export function useRemoteFunctions () {
  return remoteClient
}
