import { defineNuxtModule, addPlugin, createResolver, addComponent, addImports } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Default RPC endpoint for Cosmos blockchain
   */
  defaultEndpoint?: string
  /**
   * Prefix for component names
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-cosmos',
    configKey: 'cosmos',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
    prefix: 'Cosmos',
  },
  setup(options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add the plugin
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Add the main components
    addComponent({
      name: `${options.prefix}BlockchainInfo`,
      filePath: resolver.resolve('./runtime/components/CosmosBlockchainInfo.vue'),
    })

    addComponent({
      name: `${options.prefix}BasicInfo`,
      filePath: resolver.resolve('./runtime/components/CosmosBasicInfo.vue'),
    })

    // Add composables as auto-imports
    addImports({
      name: 'useCosmosClient',
      from: resolver.resolve('./runtime/composables/useCosmosClient'),
    })

    addImports({
      name: 'useCosmosBasic',
      from: resolver.resolve('./runtime/composables/useCosmosBasic'),
    })

    addImports({
      name: 'useCosmosTransactions',
      from: resolver.resolve('./runtime/composables/useCosmosTransactions'),
    })

    // Make default endpoint available in runtime config
    _nuxt.options.runtimeConfig.public.cosmos = {
      defaultEndpoint: options.defaultEndpoint || 'https://cosmos-api.cosmdev.com/rpc/atom',
    }

    // Transpile CosmJS packages for client-side compatibility
    _nuxt.options.build = _nuxt.options.build || {}
    _nuxt.options.build.transpile = _nuxt.options.build.transpile || []
    _nuxt.options.build.transpile.push('@cosmjs/stargate', '@cosmjs/proto-signing')

    // Add vite optimizeDeps configuration for CosmJS packages
    _nuxt.options.vite = _nuxt.options.vite || {}
    _nuxt.options.vite.optimizeDeps = _nuxt.options.vite.optimizeDeps || {}
    _nuxt.options.vite.optimizeDeps.include = _nuxt.options.vite.optimizeDeps.include || []
    _nuxt.options.vite.optimizeDeps.include.push('@cosmjs/stargate', '@cosmjs/proto-signing')

    // Define Node.js polyfills for browser compatibility with CosmJS
    _nuxt.options.vite.define = _nuxt.options.vite.define || {}
    _nuxt.options.vite.define.global = 'globalThis'
  },
})
