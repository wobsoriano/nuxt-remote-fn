import { $fetch } from 'ofetch'

export function useRemoteFunction (moduleId: string, args: any[]) {
  return $fetch(`/api/__remote/${moduleId}`, {
    method: 'POST',
    body: {
      input: args
    }
  })
}
