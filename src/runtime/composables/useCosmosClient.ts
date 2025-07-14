import { ref, computed } from 'vue'
import { StargateClient } from '@cosmjs/stargate'
import type { Block } from '@cosmjs/stargate'

export interface NodeInfo {
  validators?: unknown
  status?: unknown
  nodeInfo?: {
    version?: string
    moniker?: string
    network?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface CosmosBlockchainInfo {
  chainId: string
  latestBlockHeight: number
  latestBlockTime: string
  latestBlockHash: string
  nodeInfo?: NodeInfo
}

export const useCosmosClient = () => {
  const client = ref<StargateClient | null>(null)
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const connect = async (endpoint: string) => {
    try {
      isLoading.value = true
      error.value = null

      client.value = await StargateClient.connect(endpoint)
      isConnected.value = true
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection error'
      console.error('Error during connection:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  const disconnect = () => {
    if (client.value) {
      client.value.disconnect()
      client.value = null
      isConnected.value = false
    }
  }

  const getBlockchainInfo = async (): Promise<CosmosBlockchainInfo | null> => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      const [chainId, height, block] = await Promise.all([
        client.value.getChainId(),
        client.value.getHeight(),
        client.value.getBlock(),
      ])

      // Try to retrieve node info safely
      let nodeInfo: NodeInfo | null = null
      try {
        // Access Tendermint client via internal property
        const tmClient = (client.value as { tmClient?: unknown, cometClient?: unknown }).tmClient
          || (client.value as { tmClient?: unknown, cometClient?: unknown }).cometClient
        if (tmClient && typeof (tmClient as { status?: () => Promise<unknown> }).status === 'function') {
          nodeInfo = await (tmClient as { status: () => Promise<NodeInfo> }).status()
        }
      }
      catch (nodeErr) {
        console.warn('Unable to retrieve node info:', nodeErr)
      }

      return {
        chainId,
        latestBlockHeight: height,
        latestBlockTime: block.header.time,
        latestBlockHash: block.id,
        nodeInfo: nodeInfo || undefined,
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Error retrieving information'
      throw err
    }
  }

  const getBlock = async (height?: number): Promise<Block | null> => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      return await client.value.getBlock(height)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Error retrieving block'
      throw err
    }
  }

  const getBalance = async (address: string, denom?: string) => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      if (denom) {
        return await client.value.getBalance(address, denom)
      }
      else {
        return await client.value.getAllBalances(address)
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Error retrieving balance'
      throw err
    }
  }

  const searchTx = async (query: string) => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      return await client.value.searchTx(query)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Error searching transactions'
      throw err
    }
  }

  const getNodeInfo = async () => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      // Try different approaches to retrieve node info
      const tmClient = (client.value as { tmClient?: unknown, cometClient?: unknown }).tmClient
        || (client.value as { tmClient?: unknown, cometClient?: unknown }).cometClient

      if (tmClient) {
        if (typeof (tmClient as { status?: () => Promise<unknown> }).status === 'function') {
          return await (tmClient as { status: () => Promise<NodeInfo> }).status()
        }
        if (typeof (tmClient as { validators?: () => Promise<unknown> }).validators === 'function') {
          const validators = await (tmClient as { validators: () => Promise<unknown> }).validators()
          return { validators }
        }
      }

      return null
    }
    catch (err) {
      console.warn('Unable to retrieve node information:', err)
      return null
    }
  }

  return {
    client: computed(() => client.value),
    isConnected: computed(() => isConnected.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    connect,
    disconnect,
    getBlockchainInfo,
    getBlock,
    getBalance,
    searchTx,
    getNodeInfo,
  }
}
