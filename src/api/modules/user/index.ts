/**
 * 用户模块 API
 */

import { post, get } from '@/api/request'
import type {
  RechargeParams,
  RechargeResponse,
  RechargeOrderDetail,
  BalanceInfo,
  TransactionRecord,
  UserStats,
  WithdrawParams,
  WithdrawResponse,
  SetPayPasswordParams,
  ChangePayPasswordParams,
  UserPreferences,
} from './types'

/**
 * 创建充值订单
 */
export function createRecharge(params: RechargeParams) {
  return post<RechargeResponse>('/user/recharge', params)
}

/**
 * 获取充值订单详情
 */
export function getRechargeOrder(orderId: string) {
  return get<RechargeOrderDetail>(`/user/recharge/${orderId}`)
}

/**
 * 获取充值订单列表
 */
export function getRechargeOrders(params?: { page?: number; pageSize?: number; status?: string }) {
  return get<{
    list: RechargeOrderDetail[]
    total: number
    page: number
    pageSize: number
  }>('/user/recharge-orders', params)
}

/**
 * 获取余额信息
 */
export function getBalance() {
  return get<BalanceInfo>('/user/balance')
}

/**
 * 获取交易记录
 */
export function getTransactions(params?: {
  type?: string
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) {
  return get<{
    list: TransactionRecord[]
    total: number
    page: number
    pageSize: number
  }>('/user/transactions', params)
}

/**
 * 获取用户统计信息
 */
export function getUserStats() {
  return get<UserStats>('/user/stats')
}

/**
 * 创建提现订单
 */
export function createWithdraw(params: WithdrawParams) {
  return post<WithdrawResponse>('/user/withdraw', params)
}

/**
 * 获取提现订单列表
 */
export function getWithdrawOrders(params?: { page?: number; pageSize?: number; status?: string }) {
  return get<{
    list: WithdrawResponse[]
    total: number
    page: number
    pageSize: number
  }>('/user/withdraw-orders', params)
}

/**
 * 设置支付密码
 */
export function setPayPassword(params: SetPayPasswordParams) {
  return post<{ success: boolean; message: string }>('/user/set-pay-password', params)
}

/**
 * 修改支付密码
 */
export function changePayPassword(params: ChangePayPasswordParams) {
  return post<{ success: boolean; message: string }>('/user/change-pay-password', params)
}

/**
 * 获取用户偏好设置
 */
export function getPreferences() {
  return get<UserPreferences>('/user/preferences')
}

/**
 * 更新用户偏好设置
 */
export function updatePreferences(params: Partial<UserPreferences>) {
  return post<UserPreferences>('/user/preferences', params)
}

/**
 * 导出交易记录
 */
export function exportTransactions(params?: {
  type?: string
  startDate?: string
  endDate?: string
  format?: 'csv' | 'excel'
}) {
  return post<{ downloadUrl: string }>('/user/export-transactions', params)
}
