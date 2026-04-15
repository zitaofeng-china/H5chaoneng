import { ref } from 'vue'
import { defineStore } from 'pinia'
import { priceApi } from '@/api'
import type { PriceData } from '@/api/modules/price/types'

export const usePriceStore = defineStore('price', () => {
  const priceData = ref<PriceData | null>(null)
  const loading = ref(false)

  async function fetchPrice() {
    loading.value = true
    try {
      const response = await priceApi.getPrice()
      if (response.code === '000000' && response.data) {
        priceData.value = response.data
      }
    } catch (error) {
      console.error('[Price Store] 获取价格失败:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    priceData,
    loading,
    fetchPrice,
  }
})
