<template>
  <div class="cosmos-blockchain-info">
    <div class="connection-section">
      <h3>RPC Connection</h3>
      <div class="input-group">
        <input
          v-model="rpcEndpoint"
          type="text"
          placeholder="https://cosmos-api.cosmdev.com/rpc/atom"
          class="rpc-input"
          :disabled="isLoading || isConnected"
        >
        <button
          v-if="!isConnected"
          @click="handleConnect"
          :disabled="isLoading || !rpcEndpoint"
          class="connect-btn"
        >
          {{ isLoading ? 'Connecting...' : 'Connect' }}
        </button>
        <button
          v-else
          @click="handleDisconnect"
          class="disconnect-btn"
        >
          Disconnect
        </button>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <div v-if="isConnected" class="blockchain-data">
      <div class="actions-section">
        <button
          @click="refreshInfo"
          :disabled="loadingInfo"
          class="refresh-btn"
        >
          {{ loadingInfo ? 'Refreshing...' : 'Refresh info' }}
        </button>
      </div>

      <div v-if="blockchainInfo" class="info-grid">
        <div class="info-card">
          <h4>Blockchain Information</h4>
          <div class="info-item">
            <label>Chain ID:</label>
            <span class="value">{{ blockchainInfo.chainId }}</span>
          </div>
          <div class="info-item">
            <label>Latest block height:</label>
            <span class="value">{{ blockchainInfo.latestBlockHeight.toLocaleString() }}</span>
          </div>
          <div class="info-item">
            <label>Latest block hash:</label>
            <span class="value hash">{{ blockchainInfo.latestBlockHash }}</span>
          </div>
          <div class="info-item">
            <label>Latest block time:</label>
            <span class="value">{{ formatDate(blockchainInfo.latestBlockTime) }}</span>
          </div>
        </div>

        <div v-if="blockchainInfo.nodeInfo" class="info-card">
          <h4>Node Information</h4>
          <div class="info-item">
            <label>Version:</label>
            <span class="value">{{ blockchainInfo.nodeInfo.nodeInfo?.version || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Moniker:</label>
            <span class="value">{{ blockchainInfo.nodeInfo.nodeInfo?.moniker || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Network:</label>
            <span class="value">{{ blockchainInfo.nodeInfo.nodeInfo?.network || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="tools-section">
        <div class="tool-card">
          <h4>Search for a block</h4>
          <div class="input-group">
            <input
              v-model="blockHeight"
              type="number"
              placeholder="Block height (optional)"
              class="block-input"
            >
            <button
              @click="fetchBlock"
              :disabled="loadingBlock"
              class="fetch-btn"
            >
              {{ loadingBlock ? 'Loading...' : 'Fetch' }}
            </button>
          </div>
          <div v-if="selectedBlock" class="block-info">
            <h5>Block {{ selectedBlock.header.height }}</h5>
            <div class="info-item">
              <label>Hash:</label>
              <span class="value hash">{{ selectedBlock.id }}</span>
            </div>
            <div class="info-item">
              <label>Timestamp:</label>
              <span class="value">{{ formatDate(selectedBlock.header.time) }}</span>
            </div>
            <div class="info-item">
              <label>Transactions:</label>
              <span class="value">{{ selectedBlock.txs.length }}</span>
            </div>
          </div>
        </div>

        <div class="tool-card">
          <h4>Check balance</h4>
          <div class="input-group">
            <input
              v-model="walletAddress"
              type="text"
              placeholder="Wallet address"
              class="address-input"
            >
            <input
              v-model="denom"
              type="text"
              placeholder="Denom (optional)"
              class="denom-input"
            >
            <button
              @click="checkBalance"
              :disabled="loadingBalance || !walletAddress"
              class="fetch-btn"
            >
              {{ loadingBalance ? 'Loading...' : 'Check' }}
            </button>
          </div>
          <div v-if="balance" class="balance-info">
            <h5>Balance</h5>
            <div v-if="Array.isArray(balance)">
              <div v-for="coin in balance" :key="coin.denom" class="info-item">
                <label>{{ coin.denom }}:</label>
                <span class="value">{{ coin.amount }}</span>
              </div>
            </div>
            <div v-else class="info-item">
              <label>{{ balance.denom }}:</label>
              <span class="value">{{ balance.amount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCosmosClient } from '../composables/useCosmosClient'
import type { Block } from '@cosmjs/stargate'

interface Props {
  defaultEndpoint?: string
  autoConnect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
  autoConnect: false
})

const {
  isConnected,
  isLoading,
  error,
  connect,
  disconnect,
  getBlockchainInfo,
  getBlock,
  getBalance
} = useCosmosClient()

const rpcEndpoint = ref(props.defaultEndpoint)
const blockchainInfo = ref<any>(null)
const loadingInfo = ref(false)

// Block search
const blockHeight = ref<number | undefined>()
const selectedBlock = ref<Block | null>(null)
const loadingBlock = ref(false)

// Balance check
const walletAddress = ref('')
const denom = ref('')
const balance = ref<any>(null)
const loadingBalance = ref(false)

const handleConnect = async () => {
  await connect(rpcEndpoint.value)
  if (isConnected.value) {
    await refreshInfo()
  }
}

const handleDisconnect = () => {
  disconnect()
  blockchainInfo.value = null
  selectedBlock.value = null
  balance.value = null
}

const refreshInfo = async () => {
  if (!isConnected.value) return
  
  try {
    loadingInfo.value = true
    blockchainInfo.value = await getBlockchainInfo()
  } catch (err) {
    console.error('Error during refresh:', err)
  } finally {
    loadingInfo.value = false
  }
}

const fetchBlock = async () => {
  if (!isConnected.value) return
  
  try {
    loadingBlock.value = true
    selectedBlock.value = await getBlock(blockHeight.value)
  } catch (err) {
    console.error('Error fetching block:', err)
  } finally {
    loadingBlock.value = false
  }
}

const checkBalance = async () => {
  if (!isConnected.value || !walletAddress.value) return
  
  try {
    loadingBalance.value = true
    balance.value = await getBalance(walletAddress.value, denom.value || undefined)
  } catch (err) {
    console.error('Error checking balance:', err)
  } finally {
    loadingBalance.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  if (props.autoConnect && props.defaultEndpoint) {
    handleConnect()
  }
})
</script>

<style scoped>
.cosmos-blockchain-info {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.connection-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.connection-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.rpc-input {
  flex: 1;
  min-width: 300px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.connect-btn, .disconnect-btn, .refresh-btn, .fetch-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.connect-btn, .fetch-btn {
  background: #007bff;
  color: white;
}

.connect-btn:hover, .fetch-btn:hover {
  background: #0056b3;
}

.connect-btn:disabled, .fetch-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.disconnect-btn {
  background: #dc3545;
  color: white;
}

.disconnect-btn:hover {
  background: #c82333;
}

.refresh-btn {
  background: #28a745;
  color: white;
  margin-bottom: 20px;
}

.refresh-btn:hover {
  background: #218838;
}

.refresh-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.blockchain-data {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-card, .tool-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.info-card h4, .tool-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: flex-start;
}

.info-item label {
  font-weight: 500;
  color: #495057;
  margin-right: 10px;
  flex-shrink: 0;
}

.info-item .value {
  color: #2c3e50;
  word-break: break-all;
  text-align: right;
}

.info-item .value.hash {
  font-family: monospace;
  font-size: 12px;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.tools-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.block-input, .address-input, .denom-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.block-input {
  width: 150px;
}

.address-input {
  flex: 1;
  min-width: 200px;
}

.denom-input {
  width: 100px;
}

.block-info, .balance-info {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.block-info h5, .balance-info h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
  
  .rpc-input {
    min-width: auto;
  }
  
  .info-grid, .tools-section {
    grid-template-columns: 1fr;
  }
  
  .tool-card .input-group {
    flex-direction: column;
  }
  
  .address-input, .block-input, .denom-input {
    width: 100%;
  }
}
</style>
