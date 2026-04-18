/**
 * 时间相关工具函数
 */

/**
 * 格式化截止时间
 * @param minutes 分钟数
 * @param locale 语言环境，默认 'zh-CN'
 * @returns 格式化后的时间字符串
 */
export function formatDeadline(minutes: number, locale = 'zh-CN'): string {
  const now = new Date()
  const deadline = new Date(now.getTime() + minutes * 60 * 1000)
  
  return deadline.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * 格式化时间戳为日期字符串
 * @param timestamp 时间戳（毫秒）
 * @param locale 语言环境，默认 'zh-CN'
 * @returns 格式化后的日期字符串
 */
export function formatTimestamp(timestamp: number, locale = 'zh-CN'): string {
  const date = new Date(timestamp)
  
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * 计算剩余时间（秒）
 * @param deadline 截止时间
 * @returns 剩余秒数，如果已过期返回 0
 */
export function getRemainingSeconds(deadline: Date | string | number): number {
  const deadlineTime = typeof deadline === 'string' || typeof deadline === 'number' 
    ? new Date(deadline).getTime() 
    : deadline.getTime()
  
  const now = Date.now()
  const remaining = Math.floor((deadlineTime - now) / 1000)
  
  return Math.max(0, remaining)
}

/**
 * 格式化持续时间
 * @param seconds 秒数
 * @returns 格式化后的时间字符串（如：1小时30分钟）
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}小时`
  }
  
  return `${hours}小时${remainingMinutes}分钟`
}
