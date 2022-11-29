import { $fetch } from 'ofetch'

export function useRemoteFunction (params: string, args: any[]) {
  return $fetch(`/api/__remote/${params}`, {
    method: 'POST',
    body: {
      input: args
    },
    onResponse ({ response }) {
      if (!response.ok && response.status === 404) {
        const fn = params.split('.')[1]
        // eslint-disable-next-line no-console
        console.error(`[nuxt-remote-fn]: Make sure ${fn} returns any data.`)
      }
    }
  })
}
