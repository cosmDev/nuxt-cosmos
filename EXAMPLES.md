# Usage Examples for Nuxt Cosmos Module

## Example 1: Basic component

```vue
<template>
  <div>
    <h1>Explore Cosmos Blockchain</h1>
    <CosmosBlockchainInfo />
  </div>
</template>
```

## Example 2: Component with custom configuration

```vue
<template>
  <div>
    <CosmosBlockchainInfo 
      :default-endpoint="'https://rpc.osmosis.zone:443'"
      :auto-connect="true"
    />
  </div>
</template>
```

## Example 3: Using composable for custom queries

```vue
<template>
  <div>
    <div v-if="isConnected">
      <h2>Chain: {{ chainInfo?.chainId }}</h2>
      <p>Current height: {{ chainInfo?.latestBlockHeight }}</p>
      
      <input v-model="address" placeholder="Address to check" />
      <button @click="checkWalletBalance" :disabled="!address">
        Check balance
      </button>
      
      <div v-if="walletBalance">
        <h3>Balances:</h3>
        <div v-for="coin in walletBalance" :key="coin.denom">
          {{ coin.amount }} {{ coin.denom }}
        </div>
      </div>
    </div>
    
    <div v-else>
      <button @click="connectToBlockchain">Connect</button>
    </div>
  </div>
</template>

<script setup>
const {
  connect,
  getBlockchainInfo,
  getBalance,
  isConnected,
  isLoading,
  error
} = useCosmosClient()

const chainInfo = ref(null)
const address = ref('')
const walletBalance = ref(null)

const connectToBlockchain = async () => {
  try {
    await connect('https://cosmos-api.cosmdev.com/rpc/atom')
    chainInfo.value = await getBlockchainInfo()
  } catch (err) {
    console.error('Connection error:', err)
  }
}

const checkWalletBalance = async () => {
  if (!address.value) return
  
  try {
    walletBalance.value = await getBalance(address.value)
  } catch (err) {
    console.error('Error checking balance:', err)
  }
}
</script>
```

## Example 4: Real-time block watcher

```vue
<template>
  <div>
    <h2>Real-time Block Monitor</h2>
    <div v-if="isConnected">
      <p>Latest block: {{ latestHeight }}</p>
      <button @click="toggleWatcher">
        {{ isWatching ? 'Stop' : 'Start' }} monitoring
      </button>
      
      <div v-if="recentBlocks.length">
        <h3>Recent blocks:</h3>
        <div v-for="block in recentBlocks" :key="block.header.height">
          Block {{ block.header.height }} - {{ block.txs.length }} transactions
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const {
  connect,
  getBlock,
  getBlockchainInfo,
  isConnected
} = useCosmosClient()

const latestHeight = ref(0)
const recentBlocks = ref([])
const isWatching = ref(false)
let watcherInterval = null

const connectAndStart = async () => {
  await connect('https://cosmos-api.cosmdev.com/rpc/atom')
  const info = await getBlockchainInfo()
  latestHeight.value = info.latestBlockHeight
}

const toggleWatcher = () => {
  if (isWatching.value) {
    clearInterval(watcherInterval)
    isWatching.value = false
  } else {
    startWatching()
    isWatching.value = true
  }
}

const startWatching = () => {
  watcherInterval = setInterval(async () => {
    try {
      const info = await getBlockchainInfo()
      if (info.latestBlockHeight > latestHeight.value) {
        // New block detected
        const newBlock = await getBlock(info.latestBlockHeight)
        recentBlocks.value.unshift(newBlock)
        if (recentBlocks.value.length > 10) {
          recentBlocks.value.pop()
        }
        latestHeight.value = info.latestBlockHeight
      }
    } catch (err) {
      console.error('Error during monitoring:', err)
    }
  }, 5000) // Check every 5 seconds
}

onMounted(() => {
  connectAndStart()
})

onUnmounted(() => {
  if (watcherInterval) {
    clearInterval(watcherInterval)
  }
})
</script>
```

## Example 5: Configuration in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-cosmos'],
  cosmos: {
    // Default endpoint for the entire application
    defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
    
    // Component prefix (optional)
    prefix: 'Cosmos'
  },
  
  // Public runtime configuration
  runtimeConfig: {
    public: {
      cosmos: {
        // Alternative endpoints
        endpoints: {
          cosmos: 'https://cosmos-api.cosmdev.com/rpc/atom',
          osmosis: 'https://rpc.osmosis.zone:443',
          juno: 'https://rpc.juno.strange.love:443'
        }
      }
    }
  }
})
```
