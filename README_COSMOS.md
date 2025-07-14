# Nuxt Cosmos Module

A Nuxt module to easily interact with Cosmos blockchains using CosmJS.

## Features

- 🔌 **Easy connection** to Cosmos RPC
- 📊 **Real-time blockchain information**
- 🔍 **Block search** by height
- 💰 **Balance verification** for any address
- 🧩 **Ready-to-use Vue component**
- ⚡ **Reusable composable**
- 🎨 **Modern user interface**

## Installation

```bash
npm install nuxt-cosmos
```

## Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-cosmos'],
  cosmos: {
    defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
    prefix: 'Cosmos' // Prefix for components
  }
})
```

## Usage

### Ready-to-use Component

The module provides a `CosmosBlockchainInfo` component that includes all features:

```vue
<template>
  <div>
    <CosmosBlockchainInfo 
      :default-endpoint="'https://cosmos-api.cosmdev.com/rpc/atom'"
      :auto-connect="false"
    />
  </div>
</template>
```

### useCosmosClient Composable

For finer control, use the composable directly:

```vue
<script setup>
const { 
  connect, 
  disconnect, 
  getBlockchainInfo, 
  getBlock, 
  getBalance,
  isConnected,
  isLoading,
  error 
} = useCosmosClient()

// Connect to an RPC
await connect('https://cosmos-api.cosmdev.com/rpc/atom')

// Get blockchain information
const info = await getBlockchainInfo()

// Get a specific block
const block = await getBlock(1000000)

// Check address balance
const balance = await getBalance('cosmos1...', 'uatom')

// Disconnect
disconnect()
</script>
```

## Composable API

### useCosmosClient()

Returns an object with the following properties and methods:

#### Reactive Properties
- `client` - CosmJS client instance
- `isConnected` - Connection status
- `isLoading` - Loading indicator
- `error` - Last encountered error

#### Methods
- `connect(endpoint: string)` - Connect to an RPC
- `disconnect()` - Disconnect
- `getBlockchainInfo()` - Get blockchain information
- `getBlock(height?: number)` - Get a block
- `getBalance(address: string, denom?: string)` - Check a balance
- `searchTx(query: string)` - Search transactions

## CosmosBlockchainInfo Component

### Props

- `defaultEndpoint` (string) - Default RPC endpoint
- `autoConnect` (boolean) - Auto-connect on mount

### Component Features

1. **RPC Connection** - Interface to connect to any endpoint
2. **Blockchain Information** - Display chain ID, block height, etc.
3. **Block Search** - Retrieve and display block details
4. **Balance Verification** - Check balance of any address

## Development

```bash
# Install dependencies
npm install

# Development with playground
npm run dev

# Build
npm run prepack

# Tests
npm run test
```

## Dependencies

- `@cosmjs/stargate` - Client for Cosmos blockchains
- `@cosmjs/proto-signing` - Protobuf signatures and types

## License

MIT
