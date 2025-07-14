<template>
  <div class="cosmos-basic-info">
    <div class="connection-section">
      <h3>Cosmos RPC Connection</h3>
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
          :disabled="isLoading || !rpcEndpoint"
          class="connect-btn"
          @click="handleConnect"
        >
          {{ isLoading ? 'Connecting...' : 'Connect' }}
        </button>
        <button
          v-else
          class="disconnect-btn"
          @click="handleDisconnect"
        >
          Disconnect
        </button>
      </div>

      <div
        v-if="error"
        class="error-message"
      >
        ❌ {{ error }}
      </div>

      <div
        v-if="isConnected"
        class="success-message"
      >
        ✅ Successfully connected!
      </div>
    </div>

    <div
      v-if="isConnected"
      class="info-section"
    >
      <div class="actions">
        <button
          :disabled="loadingInfo"
          class="refresh-btn"
          @click="refreshInfo"
        >
          {{ loadingInfo ? 'Refreshing...' : '🔄 Refresh' }}
        </button>
      </div>

      <div
        v-if="blockchainInfo"
        class="info-grid"
      >
        <div class="info-card">
          <h4>📊 Blockchain Information</h4>
          <div class="info-item">
            <label>🔗 Chain ID:</label>
            <span class="value">{{ blockchainInfo.chainId }}</span>
          </div>
          <div class="info-item">
            <label>📏 Current height:</label>
            <span class="value">{{ (blockchainInfo.latestBlockHeight as number)?.toLocaleString() || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>🔒 Latest block hash:</label>
            <span class="value hash">{{ blockchainInfo.latestBlockHash }}</span>
          </div>
          <div class="info-item">
            <label>⏰ Timestamp:</label>
            <span class="value">{{ formatDate(blockchainInfo.latestBlockTime as string) }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="loadingInfo"
        class="loading"
      >
        <div class="spinner" />
        <p>Retrieving data...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCosmosBasic } from '../composables/useCosmosBasic'
import type { BasicBlockchainInfo } from '../composables/useCosmosBasic'

interface Props {
  defaultEndpoint?: string
  autoConnect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultEndpoint: 'https://cosmos-api.cosmdev.com/rpc/atom',
  autoConnect: false,
})

const {
  isConnected,
  isLoading,
  error,
  connect,
  disconnect,
  getBasicInfo,
} = useCosmosBasic()

const rpcEndpoint = ref(props.defaultEndpoint)
const blockchainInfo = ref<BasicBlockchainInfo | null>(null)
const loadingInfo = ref(false)

const handleConnect = async () => {
  console.log('Attempting connection to:', rpcEndpoint.value)
  await connect(rpcEndpoint.value)

  if (isConnected.value) {
    console.log('Connection successful, retrieving info...')
    await refreshInfo()
  }
}

const handleDisconnect = () => {
  disconnect()
  blockchainInfo.value = null
}

const refreshInfo = async () => {
  if (!isConnected.value) {
    console.log('Not connected, cannot retrieve info')
    return
  }

  try {
    loadingInfo.value = true
    console.log('Starting information retrieval...')
    blockchainInfo.value = await getBasicInfo()
    console.log('Information retrieved:', blockchainInfo.value)
  }
  catch (err) {
    console.error('Error during refresh:', err)
  }
  finally {
    loadingInfo.value = false
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  catch {
    return dateString
  }
}

onMounted(() => {
  console.log('Component monté, autoConnect:', props.autoConnect)
  if (props.autoConnect && props.defaultEndpoint) {
    handleConnect()
  }
})
</script>

<style scoped>
.cosmos-basic-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.connection-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.connection-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.rpc-input {
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255,255,255,0.1);
  color: white;
  backdrop-filter: blur(10px);
}

.rpc-input::placeholder {
  color: rgba(255,255,255,0.7);
}

.rpc-input:focus {
  outline: none;
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.15);
}

.connect-btn, .disconnect-btn, .refresh-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.connect-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.connect-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.connect-btn:disabled {
  background: rgba(255,255,255,0.1);
  cursor: not-allowed;
  opacity: 0.6;
}

.disconnect-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
}

.disconnect-btn:hover {
  background: linear-gradient(135deg, #ff5252, #f44336);
  transform: translateY(-2px);
}

.error-message {
  background: rgba(255,82,82,0.2);
  border: 1px solid rgba(255,82,82,0.3);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.success-message {
  background: rgba(76,175,80,0.2);
  border: 1px solid rgba(76,175,80,0.3);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.actions {
  margin-bottom: 20px;
}

.refresh-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.info-grid {
  display: grid;
  gap: 20px;
}

.info-card {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.1);
}

.info-card h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.7);
  border-radius: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-weight: 600;
  color: #34495e;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-item .value {
  color: #2c3e50;
  word-break: break-all;
  text-align: right;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.info-item .value.hash {
  font-size: 11px;
  background: #ecf0f1;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #bdc3c7;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #7f8c8d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }

  .rpc-input {
    min-width: auto;
    width: 100%;
  }
}
</style>
