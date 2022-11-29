<script setup lang="ts">
import { getTodo } from '~~/lib/todo.server'
import { useAsyncData, useRoute } from '#imports'

const route = useRoute()
const { data: todo } = await useAsyncData(`todo-${route.fullPath}`, () => getTodo(Number(route.params.id)))
</script>

<template>
  <div>
    Todo: {{ todo }}
  </div>
</template>
