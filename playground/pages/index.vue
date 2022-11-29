<script setup lang="ts">
import { getTodos } from '~~/lib/todo.server'

const todos = await getTodos()
</script>

<template>
  <div>
    <ul>
      <li>
        <NuxtLink v-for="todo in todos" :key="todo.id" :to="`/todos/${todo.id}`">
          {{ todo.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
