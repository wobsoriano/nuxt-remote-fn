<script setup lang="ts">
import { useAsyncData } from '#app'
import { hello } from './hello.server'

const { data } = await useAsyncData('ping', () => hello({ name: 'Evan' }))
</script>

<template>
  <div>{{ data?.message }}</div>
</template>
