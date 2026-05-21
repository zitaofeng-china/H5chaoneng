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
 * 判断当前是否在 Telegram Mini App 环境中
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
