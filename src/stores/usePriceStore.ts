import { ref } from 'vue'
import { defineStore } from 'pinia'
import { priceApi } from '@/api'
import type { PriceData } from '@/api/modules/price/types'

export const usePriceStore = defineStore('price', () => {
  const priceData = ref<PriceData | null>(null)
  const loading = ref(false)

  function setPrice(data: PriceData | null) {
    priceData.value = data
  }

  async function fetchPrice(force = false) {
    if (!force && priceData.value) return priceData.value

    loading.value = true
    try {
      const response = await priceApi.getPrice()
      if (response.code === '000000' && response.data) {
        priceData.value = response.data
      }
      return priceData.value
    } catch (error) {
      console.error('[Price Store] 获取价格失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    priceData,
    loading,
    setPrice,
    fetchPrice,
  }
})
