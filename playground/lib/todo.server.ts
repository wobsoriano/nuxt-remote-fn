import { H3Event } from 'h3'
import { prisma } from './prisma'

export async function getTodos () {
  const todos = await prisma.todo.findMany()
  return todos
}

export async function getTodo (id: number) {
  const todo = await prisma.todo.findFirstOrThrow({
    where: {
      id
    }
  })
  return todo
}
