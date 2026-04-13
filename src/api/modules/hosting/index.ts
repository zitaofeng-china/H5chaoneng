/**
 * 智能托管模块 API
 */

import { post, get } from '@/api/request'
import type {
  AddHostingParams,
  HostingAddress,
  HostingConfig,
  HostingStats,
  HostingRecord,
  DeleteHostingParams,
  UpdateHostingParams,
  BatchOperationResponse,
} from './types'

/**
 * 添加托管地址
 */
export function addHosting(params: AddHostingParams) {
  return post<BatchOperationResponse>('/hosting/add', params)
}

/**
 * 获取托管地址列表
 */
export function getHostingAddresses(params?: {
  page?: number
  pageSize?: number
  status?: string
}) {
  return get<{
    list: HostingAddress[]
    total: number
    page: number
    pageSize: number
  }>('/hosting/addresses', params)
}

/**
 * 获取托管地址详情
 */
export function getHostingAddress(addressId: string) {
  return get<HostingAddress>(`/hosting/address/${addressId}`)
}

/**
 * 删除托管地址
 */
export function deleteHosting(params: DeleteHostingParams) {
  return post<BatchOperationResponse>('/hosting/delete', params)
}

/**
 * 更新托管配置
 */
export function updateHosting(params: UpdateHostingParams) {
  return post<HostingAddress>('/hosting/update', params)
}

/**
 * 暂停/恢复托管
 */
export function toggleHosting(addressId: string, pause: boolean) {
  return post<{ success: boolean; status: string }>(`/hosting/toggle/${addressId}`, { pause })
}

/**
 * 获取托管配置
 */
export function getHostingConfig() {
  return get<HostingConfig>('/hosting/config')
}

/**
 * 获取托管统计信息
 */
export function getHostingStats() {
  return get<HostingStats>('/hosting/stats')
}

/**
 * 获取托管记录
 */
export function getHostingRecords(params?: {
  addressId?: string
  type?: 'charge' | 'transfer' | 'deduct'
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) {
  return get<{
    list: HostingRecord[]
    total: number
    page: number
    pageSize: number
  }>('/hosting/records', params)
}

/**
 * 手动充能
 */
export function manualCharge(addressId: string) {
  return post<{
    success: boolean
    energy: number
    cost: number
    transactionHash?: string
  }>(`/hosting/charge/${addressId}`)
}

/**
 * 批量暂停托管
 */
export function batchPauseHosting(addressIds: string[]) {
  return post<BatchOperationResponse>('/hosting/batch-pause', { addressIds })
}

/**
 * 批量恢复托管
 */
export function batchResumeHosting(addressIds: string[]) {
  return post<BatchOperationResponse>('/hosting/batch-resume', { addressIds })
}
