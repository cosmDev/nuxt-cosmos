import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module'],
  cosmos: {
    defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
    prefix: 'Cosmos'
  },
  devtools: { enabled: true },
})
