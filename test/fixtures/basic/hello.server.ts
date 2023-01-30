export function hello({ name }: { name: string }) {
  return Promise.resolve({ message: `Hello ${name}` })
}
