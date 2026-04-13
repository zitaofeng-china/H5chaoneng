/**
 * 批量激活模块 API
 */

import { post, get } from '@/api/request'
import type {
  ActivationParams,
  ActivationResponse,
  ActivationOrderDetail,
  ActivationConfig,
  ActivationStats,
  CheckAddressParams,
  CheckAddressResponse,
  EstimateCostParams,
  EstimateCostResponse,
} from './types'

/**
 * 批量激活地址
 */
export function batchActivate(params: ActivationParams) {
  return post<ActivationResponse>('/activation/batch', params)
}

/**
 * 获取激活订单详情
 */
export function getActivationOrder(orderId: string) {
  return get<ActivationOrderDetail>(`/activation/order/${orderId}`)
}

/**
 * 获取激活订单列表
 */
export function getActivationOrders(params?: {
  page?: number
  pageSize?: number
  status?: string
}) {
  return get<{
    list: ActivationOrderDetail[]
    total: number
    page: number
    pageSize: number
  }>('/activation/orders', params)
}

/**
 * 获取激活配置
 */
export function getActivationConfig() {
  return get<ActivationConfig>('/activation/config')
}

/**
 * 获取激活统计
 */
export function getActivationStats() {
  return get<ActivationStats>('/activation/stats')
}

/**
 * 检查地址状态
 */
export function checkAddressStatus(params: CheckAddressParams) {
  return post<CheckAddressResponse>('/activation/check-status', params)
}

/**
 * 预估激活费用
 */
export function estimateCost(params: EstimateCostParams) {
  return post<EstimateCostResponse>('/activation/estimate-cost', params)
}

/**
 * 取消激活订单
 */
export function cancelActivationOrder(orderId: string) {
  return post<{ success: boolean; message: string }>(`/activation/cancel/${orderId}`)
}
