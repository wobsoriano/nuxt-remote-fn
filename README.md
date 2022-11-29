# nuxt-remote-functions

Remote Functions. Instead of Event Handlers (API).

## Install

```bash
pnpm add nuxt-remote-fn
```

```
export default defineNuxtConfig({
  modules: [
    'nuxt-remote-fn',
  ],
})
```

## Usage

Create and export your remote functions in `*.server.ts` files:

```ts
// todo.server.ts
// Environment: Server

import { prisma } from './prisma'

export async function getTodos () {
  const todos = await prisma.todo.findMany()
  return todos
}
```

```vue
<script setup lang="ts">
import { getTodos } from '~~/lib/todo.server'

const todos = await getTodos()
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <NuxtLink :to="`/todos/${todo.id}`">
        {{ todo.title }}
      </NuxtLink>
    </li>
  </ul>
</template>
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
