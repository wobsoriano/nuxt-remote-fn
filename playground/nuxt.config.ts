import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    'nuxt-remote-fn'
  ],
  remoteFn: {
    experimentalEvent: true
  }
})
