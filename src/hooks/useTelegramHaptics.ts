/**
 * Telegram Mini App (TMA) Haptics Feedback Hook
 * 安全调用 Telegram WebApp 震动马达反馈，非 TMA 环境静默降级
 */
export function useTelegramHaptics() {
  const tmaHapticImpact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    try {
      const tg = (window as any)?.Telegram?.WebApp
      if (tg?.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred(style)
      }
    } catch {
      // 非 TMA 环境静默降级
    }
  }

  const tmaHapticSelection = () => {
    try {
      const tg = (window as any)?.Telegram?.WebApp
      if (tg?.HapticFeedback?.selectionChanged) {
        tg.HapticFeedback.selectionChanged()
      }
    } catch {
      // 非 TMA 环境静默降级
    }
  }

  const tmaHapticNotification = (type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      const tg = (window as any)?.Telegram?.WebApp
      if (tg?.HapticFeedback?.notificationOccurred) {
        tg.HapticFeedback.notificationOccurred(type)
      }
    } catch {
      // 非 TMA 环境静默降级
    }
  }

  return {
    tmaHapticImpact,
    tmaHapticSelection,
    tmaHapticNotification,
  }
}
