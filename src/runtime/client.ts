import { $fetch } from 'ofetch'

export function callRemoteFunction <T> (moduleId: string, functionName: string, args: any[]) {
  return $fetch<T>(`/api/__remote/${moduleId}/${functionName}`, {
    method: 'POST',
    body: {
      args
    },
    onResponse ({ response }) {
      if (response.status === 404) {
        // eslint-disable-next-line no-console
        console.error(`[nuxt-remote-fn]: Make sure ${functionName} returns something.`)
      }
    }
  })
}
