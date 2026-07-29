/**
 * Site 管理工具
 * 优先使用 Vite 部署基路径的最后一段；根路径部署时再从 URL 第一段解析。
 */

// 可选：精简模式（Lite）站点标识
// 优先级：运行时配置(config.js) > 环境变量
function getDefaultSite(): string {
  const runtimeConfig =
    typeof window !== 'undefined' ? (window as any).__APP_CONFIG__?.DEFAULT_SITE : undefined
  if (runtimeConfig) {
    return runtimeConfig
  }
  return import.meta.env.VITE_DEFAULT_SITE || ''
}

export const DEFAULT_SITE = getDefaultSite()

// 精简模式站点：仅当配置了 DEFAULT_SITE 且 URL site 与之相等时生效
export const LITE_SITE = DEFAULT_SITE

/** 非站点路径段，避免被识别为 site */
const RESERVED_PATH_SEGMENTS = new Set(['404'])

/**
 * 从 Vite 部署基路径提取 Site。
 * @example getSiteFromBase('/h5/') -> 'h5'
 */
export function getSiteFromBase(base = import.meta.env.BASE_URL): string {
  const segments = base.split('/').filter(Boolean)
  return segments[segments.length - 1] || ''
}

export function getSite(): string {
  const siteFromBase = getSiteFromBase()
  if (siteFromBase) {
    return siteFromBase
  }

  const path = window.location.pathname
  const segments = path.split('/').filter(Boolean)
  const siteFromUrl = segments[0] || ''

  if (!siteFromUrl || RESERVED_PATH_SEGMENTS.has(siteFromUrl)) {
    return ''
  }

  return siteFromUrl
}

/**
 * 判断当前站点是否为精简模式（隐藏部分功能）
 * 未配置 DEFAULT_SITE 时永远不是 Lite
 */
export function isLiteSite(): boolean {
  if (!LITE_SITE) return false
  return getSite() === LITE_SITE
}

/**
 * 拼接带站点前缀的路径
 * @example withSitePrefix('/hosting') → '/{site}/hosting'
 */
export function withSitePrefix(path: string = '/'): string {
  const site = getSite()
  const normalized = !path || path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`

  if (!site) {
    return normalized
  }

  if (normalized === '/') {
    return `/${site}/`
  }

  return `/${site}${normalized}`
}

export function clearSite(): void {
  // Site 依赖 URL，不在本地持久化，这里仅保留兼容方法。
}
