# nuxt-remote-fn

Remote Functions. Instead of [Event Handlers](https://nitro.unjs.io/guide/introduction/routing).

## Install

```bash
pnpm add nuxt-remote-fn
```

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-remote-fn',
  ],
})
```

## Usage

Export your remote functions in `*.server.ts` files:

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTodos () {
  const todos = await prisma.todo.findMany()
  return todos
}
```

Directly use any SQL/ORM query to retrieve & mutate data on client.

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

## Credits

This project is based on [Telefunc](https://telefunc.com) and [nuxt-server-fn](https://github.com/antfu/nuxt-server-fn)

## License

MIT
