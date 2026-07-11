/**
 * Site 管理工具
 * 用于提取、保存和清除代理标识
 */

// 默认 Site 标识
// 优先级：运行时配置(config.js) > 环境变量 > 硬编码兜底
function getDefaultSite(): string {
  const runtimeConfig = typeof window !== 'undefined' ? (window as any).__APP_CONFIG__?.DEFAULT_SITE : undefined
  if (runtimeConfig) {
    return runtimeConfig
  }
  return import.meta.env.VITE_DEFAULT_SITE || '1ih5zt8q'
}

export const DEFAULT_SITE = getDefaultSite()

// 精简模式站点 = 默认站点（定制化跟着默认站点走）
// 当 URL 中的 site 等于 DEFAULT_SITE 时，隐藏按时间/笔数租用、托管、激活、登录入口等
export const LITE_SITE = DEFAULT_SITE

export function getSite(): string {
  const path = window.location.pathname
  const segments = path.split('/').filter(Boolean)
  const siteFromUrl = segments[0] || ''

  // 如果 URL 中没有 Site，返回默认 Site
  return siteFromUrl || DEFAULT_SITE
}

/**
 * 判断当前站点是否为精简模式（隐藏部分功能）
 * 规则：当前 site === DEFAULT_SITE（见 LITE_SITE）
 */
export function isLiteSite(): boolean {
  return getSite() === LITE_SITE
}

export function clearSite(): void {
  // Site 依赖 URL，不在本地持久化，这里仅保留兼容方法。
}
