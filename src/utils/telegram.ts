/**
 * Telegram Mini App 工具函数
 */

/**
 * 获取 Telegram WebApp 实例
 */
export function getTelegramWebApp() {
  return (window as any)?.Telegram?.WebApp
}

/**
 * 检测是否由 Telegram Mini App 启动。
 *
 * Telegram SDK 在普通浏览器中也可能暴露 platform/version，因此它们不能作为容器依据。
 * 只有 SDK initData 或 Telegram 注入的 tgWebAppData 启动参数存在时才认为是 Mini App。
 */
export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const tg = getTelegramWebApp()
    if (typeof tg?.initData === 'string' && tg.initData.trim()) return true

    const loc = `${window.location.search || ''}${window.location.hash || ''}`
    if (/(?:[?&#])tgWebAppData=[^&#]+/i.test(loc)) return true
  } catch {
    // ignore
  }

  return false
}

/**
 * 严格检测：是否在 Telegram Mini App 且可取到 initData（可走自动登录）
 */
export function isTelegramMiniApp(): boolean {
  const tg = getTelegramWebApp()
  return typeof tg?.initData === 'string' && tg.initData.trim().length > 0
}

/**
 * 获取 Telegram initData（用于后端验证）
 */
export function getTelegramInitData(): string {
  const tg = getTelegramWebApp()
  return tg?.initData || ''
}

/**
 * 获取 Telegram 用户信息
 */
export function getTelegramUser() {
  const tg = getTelegramWebApp()
  return tg?.initDataUnsafe?.user || null
}

/**
 * 通知 Telegram 页面已准备好
 */
export function telegramReady() {
  const tg = getTelegramWebApp()
  tg?.ready()
}

/**
 * 展开 Mini App 到全屏
 */
export function telegramExpand() {
  const tg = getTelegramWebApp()
  tg?.expand()
}

/**
 * 获取 Telegram 主题参数
 */
export function getTelegramTheme() {
  const tg = getTelegramWebApp()
  return tg?.themeParams || {}
}

/**
 * 关闭 Mini App
 */
export function telegramClose() {
  const tg = getTelegramWebApp()
  tg?.close()
}
