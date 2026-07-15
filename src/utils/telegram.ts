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
 * 宽松检测：是否处于 Telegram 客户端 / Mini App 容器（用于 UI 文案，不要求 initData 已就绪）
 */
export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const tg = getTelegramWebApp()
    // initData / platform / version 任一存在即可认为在 TG 内
    if (tg && (tg.initData || tg.platform || tg.version)) return true

    const loc = `${window.location.search || ''}${window.location.hash || ''}`
    if (/tgWebApp/i.test(loc)) return true

    if (/Telegram/i.test(navigator.userAgent || '')) return true
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
  return !!(tg && tg.initData && tg.initData.length > 0)
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
