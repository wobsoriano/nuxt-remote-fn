import { describe, it, expect } from 'vitest'
import { getModuleId } from '../src/runtime/transformer'

describe('transformer', () => {
  it('receives a valid variable name for the module id', async () => {
    expect(getModuleId('todo.server.ts')).toBe('todo')
    expect(getModuleId('todo.prisma.server.ts')).toBe('todo_prisma')
    expect(getModuleId('todo-todo.server.ts')).toBe('todo_todo')
    expect(getModuleId('1-todo.server.ts')).toBe('_1_todo')
  })
})
