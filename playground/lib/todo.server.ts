import { useH3Event } from '../../src/runtime/server'
import { prisma } from './prisma'

export async function getTodos () {
  const todos = await prisma.todo.findMany()
  return todos
}

export function getTodo (id: number) {
  return prisma.todo.findFirstOrThrow({
    where: {
      id
    }
  })
}

export async function toggleTodo (id: number) {
  const todo = await getTodo(id)
  return prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed }
  })
}

export function deleteTodo (id: number) {
  return prisma.todo.delete({ where: { id } })
}

export function addTodo ({ title, content }: { title: string; content: string }) {
  return prisma.todo.create({
    data: {
      title,
      content,
      completed: false
    }
  })
}

export function createContext() {
  const event = useH3Event()
  // console.log('event.context.params', event.context.params)
}
