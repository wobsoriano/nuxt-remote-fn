type Todo = {
  id: number
  title: string
  completed: boolean
}

let todos: Todo[] = [
  { id: 1, title: 'Learn Nuxt', completed: false },
  { id: 2, title: 'Build something cool', completed: false },
]

export async function getTodos() {
  return todos
}

export async function addTodo(title: string) {
  const newTodo: Todo = {
    id: Date.now(),
    title,
    completed: false,
  }
  todos.push(newTodo)
  return newTodo
}

export async function removeTodo(id: number) {
  todos = todos.filter(todo => todo.id !== id)
  return { success: true }
}
