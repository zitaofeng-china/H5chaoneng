/**
 * Site 模块 API
 */

import { get } from '@/api/request'
import type { SiteInfo } from './types'

/**
 * 获取当前 Site 信息
 */
export function getSiteInfo() {
  console.log('[Site API] 🔥 getSiteInfo() 被调用')
  return get<SiteInfo>('/v3/site')
}
