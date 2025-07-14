<template>
  <div>
    <h1>Nuxt Cosmos Module - Playground</h1>
    <p>Testing Cosmos module with CosmJS</p>

    <!-- Simplified and more stable component -->
    <CosmosBasicInfo
      :default-endpoint="'https://cosmos-api.cosmdev.com/rpc/atom'"
      :auto-connect="false"
    />

    <hr style="margin: 40px 0; border: 1px solid #eee;">

    <!-- Complete component (may have issues with some RPCs) -->
    <details>
      <summary style="cursor: pointer; padding: 10px; background: #f0f0f0; border-radius: 4px;">
        🔧 Advanced component (with node information)
      </summary>
      <div style="margin-top: 20px;">
        <CosmosBlockchainInfo
          :default-endpoint="'https://cosmos-api.cosmdev.com/rpc/atom'"
          :auto-connect="false"
        />
      </div>
    </details>

    <!-- Example of direct use of basic composable -->
    <div class="custom-example">
      <h2>Direct test of basic composable</h2>
      <button
        :disabled="loading"
        @click="testBasicComposable"
      >
        {{ loading ? 'Test in progress...' : 'Test useCosmosBasic' }}
      </button>
      <div
        v-if="basicInfo"
        class="result"
      >
        <h3>Result:</h3>
        <pre>{{ JSON.stringify(basicInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const { connect, getBasicInfo, disconnect } = useCosmosBasic()

const loading = ref(false)
const basicInfo = ref(null)

const testBasicComposable = async () => {
  try {
    loading.value = true
    console.log('Testing basic composable...')
    await connect('https://cosmos-api.cosmdev.com/rpc/atom')
    basicInfo.value = await getBasicInfo()
    disconnect()
    console.log('Test completed successfully!')
  }
  catch (error) {
    console.error('Error:', error)
  }
  finally {
    loading.value = false
  }
}
</script>

<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
}

.custom-example {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.custom-example button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.custom-example button:hover {
  background: #2980b9;
}

.custom-example button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #28a745;
}

.result pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
