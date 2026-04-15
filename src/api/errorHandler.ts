/**
 * 错误处理器
 */

import { ElMessage } from 'element-plus'
import type { ApiResponse } from './types'

/**
 * 显示错误提示
 */
function showErrorMessage(message: string) {
  ElMessage.error({
    message,
    duration: 3000,
    showClose: true,
  })
}

/**
 * HTTP 错误处理
 */
export function handleHttpError(
  code: number,
  message: string,
  url: string,
  method: string
): ApiResponse {
  const errorMessage = message || `HTTP 错误 ${code}`
  
  if (import.meta.env.DEV) {
    console.error('[HTTP Error]', { code, message, url, method })
  }

  showErrorMessage(errorMessage)

  return {
    code,
    message: errorMessage,
    data: null as any,
  }
}

/**
 * 业务错误处理
 */
export function handleBusinessError(
  code: number | string,
  message: string,
  url: string,
  method: string,
  data?: any
): ApiResponse {
  const errorMessage = message || `业务错误 ${code}`
  
  if (import.meta.env.DEV) {
    console.error('[Business Error]', { code, message, url, method, data })
  }

  showErrorMessage(errorMessage)

  return {
    code,
    message: errorMessage,
    data: data || null,
  }
}

