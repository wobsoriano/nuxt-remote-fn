<script setup lang="ts">
import { ref } from 'vue'
import { getTodos, addTodo, removeTodo } from '~/lib/todo.remote'

const todos = ref(await getTodos())
const newTodo = ref('')

async function handleAdd() {
  if (!newTodo.value.trim()) return
  const todo = await addTodo(newTodo.value)
  todos.value.push(todo)
  newTodo.value = ''
}

async function handleRemove(id: number) {
  await removeTodo(id)
  todos.value = todos.value.filter(todo => todo.id !== id)
}
</script>

<template>
  <div>
    <h1>Todo list</h1>
    <form @submit.prevent="handleAdd">
      <input
        v-model="newTodo"
        placeholder="Add todo"
      >
      <button type="submit">
        Add
      </button>
    </form>
    <ul>
      <li
        v-for="todo in todos"
        :key="todo.id"
      >
        {{ todo.title }}
        <button @click="handleRemove(todo.id)">
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
