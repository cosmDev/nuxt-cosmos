# Quick Start Guide - Nuxt Cosmos Module

## Installation in 3 steps

### 1. Install dependencies

```bash
npm install @cosmjs/stargate @cosmjs/proto-signing
```

### 2. Configure the module

In your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['./src/module'], // or 'nuxt-cosmos' if published
  cosmos: {
    defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom'
  }
})
```

### 3. Use the component

In your Vue page or component:

```vue
<template>
  <div>
    <h1>Explore Cosmos Blockchain</h1>
    <CosmosBlockchainInfo />
  </div>
</template>
```

## Results obtained

Your application will now have:

✅ **RPC connection interface** - Connect to any Cosmos endpoint
✅ **Real-time blockchain information** - Chain ID, block height, timestamps
✅ **Block explorer** - Search blocks by height
✅ **Balance checker** - Check balances of any address
✅ **Responsive interface** - Works on desktop and mobile
✅ **Error handling** - Clear and informative error messages

## Available composables

### `useCosmosClient()`
- RPC connection/disconnection
- Blockchain information retrieval
- Block and balance queries

### `useCosmosTransactions()`
- Transaction search
- Transaction analysis
- Display formatting

## Customization

The `CosmosBlockchainInfo` component accepts several props:

```vue
<CosmosBlockchainInfo 
  :default-endpoint="'https://rpc.osmosis.zone:443'"
  :auto-connect="true"
/>
```

## Next steps

1. **Test** connection with different Cosmos endpoints
2. **Explore** blocks and transactions
3. **Integrate** into your existing application
4. **Customize** the interface according to your needs

For more advanced examples, check `EXAMPLES.md`.
