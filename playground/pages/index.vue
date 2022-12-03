<script setup lang="ts">
import { useAsyncData } from '#app'
import { deleteTodo, toggleTodo, getTodos } from '~~/lib/todo.server'

const { data: todos, refresh } = await useAsyncData('todos', () => getTodos())

async function handleChange (id: number) {
  await toggleTodo(id)
  await refresh()
}

async function handleDelete (id: number) {
  await deleteTodo(id)
  await refresh()
}
</script>

<template>
  <div>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <h2>
          <span>{{ todo.title }}</span>
          <input type="checkbox" :checked="todo.completed" @change="handleChange(todo.id)">
          <button @click="handleDelete(todo.id)">
            remove
          </button>
        </h2>
        <p>
          <span :style="{textDecoration: todo.completed ? 'line-through' : undefined}">{{ todo.content }}</span>
          {{ todo.completed ? ' ✅ done' : '' }}
        </p>
      </li>
    </ul>
    <hr>
    <Form @create="refresh" />
  </div>
</template>

<style>
input[type="checkbox"] {
  cursor: pointer;
  margin: 13;
}
</style>
