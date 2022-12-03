import { $fetch } from 'ofetch'

export function callRemoteFunction <T> (path: string, args: any[]) {
  return $fetch<T>(`/api/__remote/${path}`, {
    method: 'POST',
    body: {
      args
    },
    onResponse ({ response }) {
      if (response.status === 404) {
        const functionName = path.split('.')[1]
        // eslint-disable-next-line no-console
        console.error(`[nuxt-remote-fn]: Make sure ${functionName} returns something.`)
      }
    }
  })
}
