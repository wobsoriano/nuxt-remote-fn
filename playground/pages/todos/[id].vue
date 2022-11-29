<script setup lang="ts">
import { getTodo } from '~~/lib/todo.server'
import { useRoute } from '#imports'

const route = useRoute()
const todo = await getTodo(Number(route.params.id))
</script>

<template>
  <div>
    Todo: {{ todo }}
  </div>
</template>
