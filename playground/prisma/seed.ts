import consola from 'consola'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const todoData: Prisma.TodoCreateInput[] = [
  { title: 'Milk', content: 'Buy milk', completed: false },
  { title: 'Bananas', content: 'Buy bananas', completed: false }
]

async function main() {
  consola.start('Seeding todo data ...')
  for (const t of todoData) {
    const todo = await prisma.todo.create({
      data: t
    })
    consola.info(`Created todo with id: ${todo.id}`)
  }
  consola.success('Seeding finished')
}

main()
  .catch((e) => {
    consola.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
