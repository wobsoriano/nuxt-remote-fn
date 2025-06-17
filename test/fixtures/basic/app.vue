<script setup lang="ts">
import { hello } from './hello.server'
import { useAsyncData } from '#app'

const { data } = await useAsyncData('ping', () => hello({ name: 'Evan' }))
</script>

<template>
  <div>{{ data?.message }}</div>
</template>
