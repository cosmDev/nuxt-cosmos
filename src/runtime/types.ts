import type { useCosmosClient } from './composables/useCosmosClient'

declare module '#app' {
  interface NuxtApp {
    $cosmosClient: ReturnType<typeof useCosmosClient>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $cosmosClient: ReturnType<typeof useCosmosClient>
  }
}

export {}
