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
 * HTTP 错误处理（404、500等）
 * 这些错误需要立即显示，因为请求根本没有成功
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
    msg: errorMessage,
    data: null as any,
  }
}

