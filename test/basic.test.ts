import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('receives result from server function', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<div>Hello Evan</div>')
  })
})
