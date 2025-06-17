# nuxt-remote-fn

`nuxt-remote-fn` allows you to call your backend-functions from the frontend, as if they were local. No need for an extra language or DSL to learn and maintain.

## Install

```bash
npm install nuxt-remote-fn
```

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-remote-fn',
  ],
})
```

## Usage

Export your remote functions in `*.remote.{ts,js,mjs}` files:

```ts
// lib/todo.remote.ts

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
import { getTodos } from '~/lib/todo.remote'

const todos = await getTodos()
</script>

<template>
  <TodoList :todos="todos" />
</template>
```

The `.remote` part of the filename informs the module that this code should never end up in the browser and to convert it to an API call instead (`POST /api/__remote/todo/getTodos`).

Checkout [the playground example](/playground).

## H3 Event

The `useH3Event` hook provides the `event` object of the current request. You can use it to check headers, log requests, or extend the event's request object.

```ts
import { useH3Event } from 'nuxt-remote-fn/server'
import { getRequestHeader, createError } from 'h3'
import { decodeAndVerifyJwtToken } from '~/somewhere/in/utils'

export async function addTodo(todo: Todo) {
  const event = useH3Event()

  async function getUserFromHeader() {
    const authorization = getRequestHeader(event, 'authorization')
    if (authorization) {
      const user = await decodeAndVerifyJwtToken(authorization.split(' ')[1])
      return user
    }
    return null
  }

  const user = await getUserFromHeader()

  if (!user) {
    throw createError({ statusCode: 401 })
  }

  const result = await prisma.todo.create({
    data: {
      ...todo,
      userId: user.id
    }
  })

  return result
}
```

You can use all built-in [h3 utilities](https://github.com/unjs/h3#utilities) inside your exported functions.

## createContext

Each `.remote.` file can also export a `createContext` function that is called for each incoming request:

```ts
export function createContext() {
  const event = useH3Event()

  async function getUserFromHeader() {
    const authorization = getRequestHeader(event, 'authorization')
    if (authorization) {
      const user = await decodeAndVerifyJwtToken(authorization.split(' ')[1])
      return user
    }
    return null
  }

  event.context.user = await getUserFromHeader()
}

export async function addTodo(todo: Todo) {
  const event = useH3Event()

  if (!event.context.user) {
    throw createError({ statusCode: 401 })
  }

  // addTodo logic
}
```

## useAsyncData

`nuxt-remote-fn` can work seamlessly with [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data/):

```vue
<script setup lang="ts">
import { getTodos } from '~/lib/todo.remote'

const { data: todos } = useAsyncData('todos', () => getTodos())
</script>
```

## Fetch options:

Since `nuxt.config.ts` file doesn't accept functions as values, you can use the client directly to add `$fetch` options:

```ts
import type { RemoteFunction } from '#build/remote-handler'
import { createClient } from 'nuxt-remote-fn/client'

const client = createClient<RemoteFunction>({
  fetchOptions: {
    onRequest({ request }) {
      // do something
    }
  }
})

const todo = await client.todo.getTodo(1)
```

## Why this module

Sharing data from server to client involves a lot of ceremony. i.e. an `eventHandler` needs to be set up and `useFetch` needs to be used in the browser.

Wouldn't it be nice if all of that was automatically handled and all you'd need to do is import `getTodos` on the client, just like you do in `eventHandler`'s? That's where `nuxt-remote-fn` comes in. With `nuxt-remote-fn`, all exported functions from `.server.` files automatically become available to the browser as well.

## Development

- Run `cp playground/.env.example playground/.env`
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

## Credits

This project is inspired by [tRPC](http://trpc.io/), [Telefunc](https://telefunc.com) and [nuxt-server-fn](https://github.com/antfu/nuxt-server-fn).

## License

MIT
