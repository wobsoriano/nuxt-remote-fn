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
import { getTodos } from '@/lib/todo.server'

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

The `useEvent` hook provides the `event` context:

```ts
import { useEvent } from 'nuxt-remote-fn/server'

export async function getTodo(id: number) {
  const { event, node, path } = useEvent()
  // ...
}
```

## useAsyncData

`nuxt-remote-fn` can work seamlessly with [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data/):

```vue
<script setup lang="ts">
import { getTodos } from '@/lib/todo.server'

const { data: todos } = await useAsyncData('todos', () => getTodos())
</script>
```

## Why this module

Sharing data from server to client involves a lot of ceremony. i.e. an `eventHandler` needs to be set up and `useFetch` needs to be used in the browser.

Wouldn't it be nice if all of that was automatically handled and all you'd need to do is import `getTodos` on the client, just like you do in `eventHandler`'s? That's where `nuxt-remote-fn` comes in. With `nuxt-remote-fn`, all exported functions from `.server.` files automatically become available to the browser as well.

## Development

- Run `cp playground/.env.example playground/.env`
- Use `pnpm dev` to start [playground](./playground) in development mode.

## Credits

This project is inspired by [Telefunc](https://telefunc.com) and [nuxt-server-fn](https://github.com/antfu/nuxt-server-fn).

## License

MIT
