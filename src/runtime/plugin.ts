import { defineNuxtPlugin } from '#app'
import { useCosmosClient } from './composables/useCosmosClient'

export default defineNuxtPlugin((nuxtApp) => {
  // Provide the cosmos client composable globally
  nuxtApp.provide('cosmosClient', useCosmosClient)
  
  console.log('Nuxt Cosmos module initialized!')
})
