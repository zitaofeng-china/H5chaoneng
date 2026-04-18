/**
 * 统一错误处理 Hook
 */

import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { createLogger } from '@/utils/logger'

interface ErrorHandlerOptions {
  /**
   * 日志前缀
   */
  prefix?: string
  /**
   * 默认错误消息的 i18n key
   */
  defaultMessageKey?: string
  /**
   * 是否显示错误提示
   */
  showMessage?: boolean
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { t } = useI18n()
  const logger = createLogger(options.prefix || 'Error')

  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文描述
   * @param customMessage 自定义错误消息
   */
  const handleError = (
    error: any,
    context?: string,
    customMessage?: string
  ) => {
    // 记录错误日志
    const logMessage = context ? `${context}失败` : '操作失败'
    logger.error(logMessage, error)

    // 显示错误提示
    if (options.showMessage !== false) {
      const message = customMessage 
        || error?.message 
        || (options.defaultMessageKey ? t(options.defaultMessageKey) : '操作失败，请重试')
      
      ElMessage.error(message)
    }
  }

  /**
   * 包装异步函数，自动处理错误
   * @param fn 异步函数
   * @param context 错误上下文
   * @returns 包装后的函数
   */
  const wrapAsync = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(error, context)
        throw error
      }
    }) as T
  }

  /**
   * 安全执行异步函数，捕获错误但不抛出
   * @param fn 异步函数
   * @param context 错误上下文
   * @returns 执行结果或 null
   */
  const safeAsync = async <T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }

  return {
    handleError,
    wrapAsync,
    safeAsync,
  }
}
