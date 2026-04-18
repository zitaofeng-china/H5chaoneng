/**
 * 支付地址管理 Hook
 * 统一处理不同类型地址的获取和解析
 */

import { ref } from 'vue'
import { addressApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import type { AddressData } from '@/api/modules/address/types'
import { logger } from '@/utils/logger'

/**
 * 从响应数据中提取地址
 */
function extractAddress(data: any): string {
  if (!data) return ''
  
  // 如果 data 是对象且有 address 字段
  if (typeof data === 'object' && !Array.isArray(data) && 'address' in data) {
    return data.address || ''
  }
  
  // 如果 data 是数组，查找对应 addressKind 的项
  if (Array.isArray(data)) {
    const addressItem = data.find((item: AddressData) => item.address)
    return addressItem?.address || ''
  }
  
  // 如果 data 直接是地址字符串
  if (typeof data === 'string') {
    return data
  }
  
  return ''
}

/**
 * 支付地址管理 Hook
 */
export function usePaymentAddress(kind: AddressKind) {
  const address = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取支付地址
   */
  const fetchAddress = async () => {
    loading.value = true
    error.value = null
    
    try {
      logger.info('[usePaymentAddress] 获取地址', { kind })
      
      const response = await addressApi.getAddress({ kind })
      
      if (response.data) {
        address.value = extractAddress(response.data)
        logger.info('[usePaymentAddress] 地址获取成功', { address: address.value })
      } else {
        error.value = '获取地址失败'
        logger.error('[usePaymentAddress] 响应数据为空')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取地址失败'
      logger.error('[usePaymentAddress] 获取地址失败', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    address.value = ''
    error.value = null
    loading.value = false
  }

  return {
    address,
    loading,
    error,
    fetchAddress,
    reset,
  }
}
