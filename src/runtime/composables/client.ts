import { $fetch } from 'ofetch'

export function useRemoteFunction (params: string, args: any[]) {
  return $fetch(`/api/__remote/${params}`, {
    method: 'POST',
    body: {
      input: args
    }
  })
}
