/**
 * 合约闪兑模块 API
 */

import { post, get } from '@/api/request'
import type {
  ContractFlashParams,
  ContractFlashResponse,
  FlashOrderDetail,
  RateInfo,
  FlashConfig,
  StockInfo,
  CalculateEstimateParams,
  CalculateEstimateResponse,
} from './types'

/**
 * 创建闪兑订单
 */
export function createFlashOrder(params: ContractFlashParams) {
  return post<ContractFlashResponse>('/contract/flash', params)
}

/**
 * 获取闪兑订单详情
 */
export function getFlashOrder(orderId: string) {
  return get<FlashOrderDetail>(`/contract/order/${orderId}`)
}

/**
 * 获取闪兑订单列表
 */
export function getFlashOrders(params?: {
  page?: number
  pageSize?: number
  type?: 'usdt-to-trx' | 'trx-to-usdt'
  status?: string
}) {
  return get<{
    list: FlashOrderDetail[]
    total: number
    page: number
    pageSize: number
  }>('/contract/orders', params)
}

/**
 * 获取实时汇率
 */
export function getRate() {
  return get<RateInfo>('/contract/rate')
}

/**
 * 获取闪兑配置
 */
export function getFlashConfig() {
  return get<FlashConfig>('/contract/config')
}

/**
 * 获取库存信息
 */
export function getStock() {
  return get<StockInfo>('/contract/stock')
}

/**
 * 计算预估结果
 */
export function calculateEstimate(params: CalculateEstimateParams) {
  return post<CalculateEstimateResponse>('/contract/calculate', params)
}

/**
 * 取消闪兑订单
 */
export function cancelFlashOrder(orderId: string) {
  return post<{ success: boolean; message: string }>(`/contract/cancel/${orderId}`)
}

/**
 * 查询交易状态
 */
export function queryTransactionStatus(transactionHash: string) {
  return get<{
    status: string
    confirmations: number
    blockNumber?: number
  }>(`/contract/transaction/${transactionHash}`)
}
