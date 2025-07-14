import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  cosmos: {
    defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
    prefix: 'Cosmos',
  },
})
