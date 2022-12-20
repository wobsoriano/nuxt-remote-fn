export function callRemoteFunction <T> (moduleId: string, functionName: string, args: any[]) {
  return globalThis.$fetch<T>(`/api/__remote/${moduleId}/${functionName}`, {
    method: 'POST',
    body: {
      args
    }
  })
}
