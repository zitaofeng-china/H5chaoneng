/**
 * 闪兑汇率 API 模块
 */

import request from '@/api/request'
import type { ExchangeRateData } from './types'
import type { ApiResponse } from '@/api/types'

/**
 * 获取闪兑汇率和库存信息
 */
export async function getExchangeRate(): Promise<ApiResponse<ExchangeRateData>> {
  return request<ExchangeRateData>('/v3/exchange/rate', {
    method: 'GET',
  })
}

export * from './types'
