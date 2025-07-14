import { ref, computed } from 'vue'
import { StargateClient } from '@cosmjs/stargate'

export interface BasicBlockchainInfo {
  chainId: string
  latestBlockHeight: number
  latestBlockTime: string
  latestBlockHash: string
}

export const useCosmosBasic = () => {
  const client = ref<StargateClient | null>(null)
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const connect = async (endpoint: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Connecting to:', endpoint)
      client.value = await StargateClient.connect(endpoint)
      isConnected.value = true
      console.log('Successfully connected!')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection error'
      console.error('Error during connection:', err)
      isConnected.value = false
    } finally {
      isLoading.value = false
    }
  }

  const disconnect = () => {
    if (client.value) {
      client.value.disconnect()
      client.value = null
      isConnected.value = false
      console.log('Disconnected')
    }
  }

  const getBasicInfo = async (): Promise<BasicBlockchainInfo> => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      console.log('Retrieving basic information...')
      
      const chainId = await client.value.getChainId()
      console.log('Chain ID:', chainId)
      
      const height = await client.value.getHeight()
      console.log('Height:', height)
      
      const block = await client.value.getBlock()
      console.log('Block retrieved:', block.header.height)

      return {
        chainId,
        latestBlockHeight: height,
        latestBlockTime: block.header.time,
        latestBlockHash: block.id
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error retrieving information'
      error.value = message
      console.error('getBasicInfo error:', err)
      throw new Error(message)
    }
  }

  const testConnection = async (endpoint: string) => {
    try {
      console.log('Testing connection to:', endpoint)
      const testClient = await StargateClient.connect(endpoint)
      const chainId = await testClient.getChainId()
      testClient.disconnect()
      return { success: true, chainId }
    } catch (err) {
      console.error('Connection test failed:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Test error'
      }
    }
  }

  return {
    client: computed(() => client.value),
    isConnected: computed(() => isConnected.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    connect,
    disconnect,
    getBasicInfo,
    testConnection
  }
}
