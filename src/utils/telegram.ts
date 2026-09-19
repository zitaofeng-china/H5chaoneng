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

/** Mini App 容器（含仅能识别到启动参数、尚未取到 initData 的情况） */
export function isMiniAppRuntime(): boolean {
  return isTelegramMiniApp() || isTelegramEnvironment()
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

/** 让 Mini App 页面宽度始终贴合手机可视宽度 */
export function applyTelegramFullWidth() {
  const tg = getTelegramWebApp()
  const root = document.documentElement
  const apply = () => {
    const width = Number(tg?.viewportWidth) || window.innerWidth
    if (width > 0) {
      root.style.setProperty('--tg-viewport-width', `${width}px`)
    }
    root.style.width = '100%'
    document.body.style.width = '100%'
  }

  apply()
  if (!tg?.onEvent) return
  tg.onEvent('viewportChanged', apply)
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

/**
 * 触发轻触选择震动（齿轮微触感：适用于 Tab 切换、单选套餐卡、币种切换）
 */
export function tmaHapticSelection() {
  const tg = getTelegramWebApp()
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.selectionChanged()
    } catch {
      // ignore
    }
  }
}

/**
 * 触发物理下压碰撞震动（按键回弹触感：适用于立即租用、计算器、确认、复制等按钮）
 */
export function tmaHapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  const tg = getTelegramWebApp()
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred(style)
    } catch {
      // ignore
    }
  }
}

/**
 * 触发状态通知震动（成功/失败/警告双击：适用于复制成功、支付完成、校验失败）
 */
export function tmaHapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
  const tg = getTelegramWebApp()
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.notificationOccurred(type)
    } catch {
      // ignore
    }
  }
}

/**
 * 禁用垂直下拉误滑关闭手势（锁定 Mini App 视口边界）
 */
export function tmaDisableVerticalSwipes() {
  const tg = getTelegramWebApp()
  try {
    if (typeof tg?.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes()
    }
  } catch {
    // ignore
  }
}

/**
 * 同步 Telegram 顶栏与底栏背景色
 */
export function tmaSyncThemeColors(headerColor = '#ffffff', bgColor = '#ffffff') {
  const tg = getTelegramWebApp()
  try {
    if (typeof tg?.setHeaderColor === 'function') {
      tg.setHeaderColor(headerColor)
    }
    if (typeof tg?.setBackgroundColor === 'function') {
      tg.setBackgroundColor(bgColor)
    }
  } catch {
    // ignore
  }
}

