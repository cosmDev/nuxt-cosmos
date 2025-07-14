import { ref, computed } from 'vue'
import type { StargateClient, IndexedTx } from '@cosmjs/stargate'

export interface TransactionQuery {
  hash?: string
  sender?: string
  recipient?: string
  height?: number
  minHeight?: number
  maxHeight?: number
}

export interface TransactionMessage {
  type: string
  content: Array<{ key: string, value: string }>
}

export interface TransactionFee {
  amount: string
  denom: string
}

export const useCosmosTransactions = () => {
  const client = ref<StargateClient | null>(null)
  const transactions = ref<IndexedTx[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const setClient = (cosmosClient: StargateClient | null) => {
    client.value = cosmosClient
  }

  const searchTransactions = async (query: TransactionQuery): Promise<IndexedTx[]> => {
    if (!client.value) {
      throw new Error('Client not connected')
    }

    try {
      isLoading.value = true
      error.value = null

      let searchQuery = ''
      const queryParts: string[] = []

      if (query.hash) {
        const tx = await client.value.getTx(query.hash)
        return tx ? [tx] : []
      }

      if (query.sender) {
        queryParts.push(`message.sender='${query.sender}'`)
      }

      if (query.recipient) {
        queryParts.push(`transfer.recipient='${query.recipient}'`)
      }

      if (query.height) {
        queryParts.push(`tx.height=${query.height}`)
      }
      else {
        if (query.minHeight) {
          queryParts.push(`tx.height>=${query.minHeight}`)
        }
        if (query.maxHeight) {
          queryParts.push(`tx.height<=${query.maxHeight}`)
        }
      }

      searchQuery = queryParts.join(' AND ')

      if (!searchQuery) {
        throw new Error('At least one search criteria must be specified')
      }

      const results = await client.value.searchTx(searchQuery)
      transactions.value = results
      return results
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Error during search'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getTransactionsByAddress = async (address: string, _limit = 50): Promise<IndexedTx[]> => {
    return await searchTransactions({ sender: address })
  }

  const getTransactionsByHeight = async (height: number): Promise<IndexedTx[]> => {
    return await searchTransactions({ height })
  }

  const getTransactionsByHashOrHeight = async (identifier: string): Promise<IndexedTx[]> => {
    // Try to determine if it's a hash or height
    if (/^\d+$/.test(identifier)) {
      // It's probably a block height
      return await getTransactionsByHeight(Number.parseInt(identifier))
    }
    else {
      // It's probably a hash
      return await searchTransactions({ hash: identifier })
    }
  }

  const analyzeTransaction = (tx: IndexedTx) => {
    const analysis = {
      hash: tx.hash,
      height: tx.height,
      gasUsed: tx.gasUsed,
      gasWanted: tx.gasWanted,
      events: tx.events,
      messages: [] as TransactionMessage[],
      transfers: [] as { recipient: string, sender: string, amount: string }[],
      fees: [] as TransactionFee[],
    }

    // Analyze messages from events
    tx.events.forEach((event) => {
      if (event.type === 'message') {
        const message = {
          type: '',
          content: event.attributes.map(attr => ({ key: attr.key, value: attr.value })),
        }

        event.attributes.forEach((attr) => {
          if (attr.key === 'action') {
            message.type = attr.value
          }
        })

        analysis.messages.push(message)
      }
    })

    // Analyze transfer events
    tx.events.forEach((event) => {
      if (event.type === 'transfer') {
        const transfer = {
          recipient: '',
          sender: '',
          amount: '',
        }

        event.attributes.forEach((attr) => {
          if (attr.key === 'recipient') transfer.recipient = attr.value
          if (attr.key === 'sender') transfer.sender = attr.value
          if (attr.key === 'amount') transfer.amount = attr.value
        })

        if (transfer.recipient && transfer.sender) {
          analysis.transfers.push(transfer)
        }
      }
    })

    return analysis
  }

  const formatTransactionForDisplay = (tx: IndexedTx) => {
    const analysis = analyzeTransaction(tx)

    return {
      hash: analysis.hash,
      height: analysis.height,
      status: tx.code === 0 ? 'Success' : 'Failed',
      gasUsed: `${analysis.gasUsed}/${analysis.gasWanted}`,
      messageCount: analysis.messages.length,
      transferCount: analysis.transfers.length,
      timestamp: 'N/A', // Timestamp not available in IndexedTx
      fee: null, // Fee information not available from IndexedTx
    }
  }

  return {
    client: computed(() => client.value),
    transactions: computed(() => transactions.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    setClient,
    searchTransactions,
    getTransactionsByAddress,
    getTransactionsByHeight,
    getTransactionsByHashOrHeight,
    analyzeTransaction,
    formatTransactionForDisplay,
  }
}
