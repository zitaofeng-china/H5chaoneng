/**
 * Site 管理工具
 * 用于提取、保存和清除代理标识
 */

import { useRoute } from 'vue-router'

export function getSite(): string {
  const path = window.location.pathname
  const segments = path.split('/').filter(Boolean)
  return segments[0] || ''
}

export function clearSite(): void {
  localStorage.clear()
}

