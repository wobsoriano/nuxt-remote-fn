import { $fetch } from 'ofetch'

export function useRemoteFunction (moduleId: string, args: any[]) {
  return $fetch(`/api/_remote_fn/${moduleId}`, {
    method: 'POST',
    body: {
      input: args
    }
  })
}
