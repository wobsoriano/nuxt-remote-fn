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

Export your remote functions in `*.server.{ts,js,mjs}` files:

```ts
// lib/todo.server.ts

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

The `.server` part of the filename informs the module that this code should never end up in the browser and to convert it to an API call instead (`POST /api/__remote/todo.getTodos`).

Checkout [the playground example](/playground).

## H3 Event

The h3 event is available as `this` for functions:

```ts
import type { H3Event } from 'h3'

export function getTodos(this: H3Event, otherArg: any) {
  const body = useBody(this)
  // ...
}
```

## Credits

This project is inspired by [Telefunc](https://telefunc.com) and [nuxt-server-fn](https://github.com/antfu/nuxt-server-fn).

## License

MIT
