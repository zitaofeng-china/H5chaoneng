/**
 * 价格模块 API
 */

import { get } from '@/api/request'
import type { PriceData } from './types'

/**
 * 获取价格表（用于验证 Site 是否有效）
 * GET /v3/price
 * 需要在请求头中传递 Site 参数（由拦截器自动添加）
 */
export function getPrice() {
  console.log('[Price API] 🔥 getPrice() 被调用')
  return get<PriceData>('/v3/price')
}
