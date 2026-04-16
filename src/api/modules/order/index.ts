/**
 * 订单模块 API
 */

import { post } from '@/api/request'
import type { CreateOrderParams } from './types'

/**
 * 创建订单
 * POST /v3/order
 * 支持三种租赁类型：快速租用、按时间租用、按笔数租用
 */
export function createOrder(params: CreateOrderParams) {
  return post('/v3/order', params)
}
