/**
 * Element Plus 消息封装：走组件子路径，避免从 element-plus 桶入口整包引入
 * 并为 Message 统一默认 offset，避免全局 CSS 强制 top 导致多条提示重叠
 */
import { ElMessage as RawElMessage } from 'element-plus/es/components/message/index.mjs'
export { ElMessageBox } from 'element-plus/es/components/message-box/index.mjs'

const DESKTOP_OFFSET = 80
const MOBILE_OFFSET = 70
const MOBILE_BREAKPOINT = 890

function getDefaultOffset(): number {
  if (typeof window === 'undefined') return DESKTOP_OFFSET
  return window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_OFFSET : DESKTOP_OFFSET
}

/** 将入参统一为带默认 offset 的配置（调用方可显式覆盖 offset） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withOffset(options: any): any {
  const offset = getDefaultOffset()
  if (options == null || typeof options === 'string') {
    return { message: options, offset }
  }
  if (typeof options === 'object') {
    return { offset, ...options }
  }
  return { message: options, offset }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createTyped(type: 'success' | 'warning' | 'info' | 'error' | 'primary') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (options?: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = (RawElMessage as any)[type]
    if (typeof fn !== 'function') {
      return RawElMessage(withOffset(options))
    }
    return fn(withOffset(options))
  }
}

export const ElMessage = Object.assign(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (options?: any) => RawElMessage(withOffset(options)),
  {
    success: createTyped('success'),
    warning: createTyped('warning'),
    info: createTyped('info'),
    error: createTyped('error'),
    primary: createTyped('primary'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    closeAll: (...args: any[]) => (RawElMessage as any).closeAll(...args),
  },
) as typeof RawElMessage
