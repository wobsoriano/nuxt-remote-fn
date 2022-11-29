import { $fetch } from 'ofetch'

export function useRemoteFunction (path: string, args: any[]) {
  return $fetch(`/api/__remote/${path}`, {
    method: 'POST',
    body: {
      input: args
    }
  })
}
