/**
 * Site 管理工具
 * 用于提取、保存和清除代理标识
 */

import { useRoute } from 'vue-router'

// 默认 Site 标识（从环境变量读取，如果未配置则使用默认值）
export const DEFAULT_SITE = import.meta.env.VITE_DEFAULT_SITE || '1ExAgznu'

export function getSite(): string {
  const path = window.location.pathname
  const segments = path.split('/').filter(Boolean)
  const siteFromUrl = segments[0] || ''
  
  // 如果 URL 中没有 Site，返回默认 Site
  return siteFromUrl || DEFAULT_SITE
}

export function clearSite(): void {
  localStorage.clear()
}

