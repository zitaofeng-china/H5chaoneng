/**
 * 用户广告模块 API
 */

import { get } from '@/api/request'
import type { ApiResponse } from '@/api/types'
import type { AdList } from './types'

/**
 * 获取当前用户可见广告列表
 */
export function getAds(): Promise<ApiResponse<AdList>> {
  return get<AdList>('/v3/ad')
}
