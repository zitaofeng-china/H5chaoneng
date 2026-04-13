/**
 * 能量租赁模块 API
 */

import { post, get } from '@/api/request'
import type {
  TimeRentalParams,
  CountRentalParams,
  RentalResponse,
  RentalOrderDetail,
  QuickRentalParams,
  TransferRentalParams,
  TransferRentalResponse,
  SaveAddressParams,
  SavedAddress,
  RentalConfig,
} from './types'

/**
 * 按时间租用能量
 */
export function rentByTime(params: TimeRentalParams) {
  return post<RentalResponse>('/rental/time', params)
}

/**
 * 按笔数租用能量
 */
export function rentByCount(params: CountRentalParams) {
  return post<RentalResponse>('/rental/count', params)
}

/**
 * 快速租用（默认1笔）
 */
export function quickRent(params: QuickRentalParams) {
  return post<RentalResponse>('/rental/quick', params)
}

/**
 * 转账租赁（获取转账信息）
 */
export function getTransferInfo(params: TransferRentalParams) {
  return post<TransferRentalResponse>('/rental/transfer-info', params)
}

/**
 * 获取租赁订单详情
 */
export function getRentalOrder(orderId: string) {
  return get<RentalOrderDetail>(`/rental/order/${orderId}`)
}

/**
 * 获取租赁订单列表
 */
export function getRentalOrders(params?: {
  page?: number
  pageSize?: number
  type?: 'time' | 'count'
  status?: string
}) {
  return get<{
    list: RentalOrderDetail[]
    total: number
    page: number
    pageSize: number
  }>('/rental/orders', params)
}

/**
 * 保存地址
 */
export function saveAddress(params: SaveAddressParams) {
  return post<SavedAddress>('/rental/save-address', params)
}

/**
 * 获取已保存的地址列表
 */
export function getSavedAddresses() {
  return get<SavedAddress[]>('/rental/saved-addresses')
}

/**
 * 删除已保存的地址
 */
export function deleteSavedAddress(addressId: string) {
  return post<{ success: boolean }>(`/rental/delete-address/${addressId}`)
}

/**
 * 获取租赁配置
 */
export function getRentalConfig() {
  return get<RentalConfig>('/rental/config')
}

/**
 * 取消租赁订单
 */
export function cancelRentalOrder(orderId: string) {
  return post<{ success: boolean; message: string }>(`/rental/cancel/${orderId}`)
}
