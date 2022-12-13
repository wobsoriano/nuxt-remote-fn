import { $fetch } from 'ofetch'

export function callRemoteFunction <T> (moduleId: string, functionName: string, args: any[]) {
  return $fetch<T>(`/api/__remote/${moduleId}/${functionName}`, {
    method: 'POST',
    body: {
      args
    }
  })
}
