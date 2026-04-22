import { ref, onMounted, onUnmounted, watch } from 'vue'

interface UseAddressLoadingOptions {
  address: () => string
  timeout?: number
}

export function useAddressLoading(options: UseAddressLoadingOptions) {
  const { address, timeout = 10000 } = options
  
  const loadingTimeout = ref(false)
  let timeoutTimer: ReturnType<typeof setTimeout> | null = null

  const startLoadingTimer = () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
    }
    
    loadingTimeout.value = false
    
    timeoutTimer = setTimeout(() => {
      if (!address()) {
        loadingTimeout.value = true
      }
    }, timeout)
  }

  const resetTimer = () => {
    loadingTimeout.value = false
    startLoadingTimer()
  }

  watch(address, (newAddress) => {
    if (newAddress && timeoutTimer) {
      clearTimeout(timeoutTimer)
      loadingTimeout.value = false
    }
  })

  onMounted(() => {
    startLoadingTimer()
  })

  onUnmounted(() => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
    }
  })

  return {
    loadingTimeout,
    resetTimer,
  }
}
