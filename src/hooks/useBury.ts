/**
 * 数据埋点 Hook
 * 使用 Umami 进行数据统计
 */

export const useBury = () => {
  /**
   * 埋点追踪
   * @param type 事件类型/名称
   * @param isOnce 是否只触发一次（通过 localStorage 去重）
   */
  const track = (type: string, isOnce: boolean = false) => {
    // 开发环境不埋点
    if (import.meta.env.DEV) {
      return
    }

    // 如果 isOnce 为 true，则只触发一次
    if (isOnce) {
      const key = `bury_${type}`
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1')
        ;(window as any)?.umami?.track('埋点', { [type]: type })
      }
      return
    }

    ;(window as any)?.umami?.track('埋点', { [type]: type })
  }

  return { track }
}
