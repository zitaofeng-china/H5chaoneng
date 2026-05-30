/**
 * 地址管理 Hook
 */
import { ref } from 'vue'
import { addressApi } from '@/api'
import type { AddressData, AddressKind } from '@/api/modules/address/types'

export function useAddress() {
  const loading = ref(false)
  const addressData = ref<AddressData | null>(null)

  /**
   * 获取付款地址
   * @param kind - 地址类别
   */
  const fetchAddress = async (kind: AddressKind | number) => {
    loading.value = true
    try {
      const response = await addressApi.getAddress({ kind })
      
      if (response.code === '000000' && response.data) {
        addressData.value = response.data
        return response.data
      } else {
        // 错误已在 errorHandler 中处理，直接返回
        return null
      }
    } catch (error) {
      console.error('获取付款地址失败:', error)
      // 错误已在 errorHandler 中统一处理，这里不再重复提示
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    addressData,
    fetchAddress,
  }
}
