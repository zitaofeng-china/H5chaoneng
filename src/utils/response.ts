/**
 * 统一响应处理工具
 */

import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/api/types'
import { getErrorMessage, getSuccessMessage } from './errorCode'

/**
 * 成功状态码
 */
export const SUCCESS_CODE = '000000'

/**
 * Token过期相关错误码
 */
export const TOKEN_EXPIRED_CODES = ['100003', '100004', '401']

/**
 * 检查响应是否成功
 */
export function isSuccess(code: string | number): boolean {
  return String(code) === SUCCESS_CODE
}

/**
 * 检查是否为token过期错误
 */
export function isTokenExpired(code: string | number): boolean {
  return TOKEN_EXPIRED_CODES.includes(String(code))
}

/**
 * 处理token过期
 */
export function handleTokenExpired(): void {
  // 保存需要保留的数据
  const locale = localStorage.getItem('locale')
  
  // 清除认证相关存储
  localStorage.removeItem('tokens')
  localStorage.removeItem('refresh_tokens')
  localStorage.removeItem('user_infos')
  localStorage.removeItem('remember_password')
  localStorage.removeItem('saved_username')
  localStorage.removeItem('saved_password')
  
  // 恢复语言设置
  if (locale) {
    localStorage.setItem('locale', locale)
  }
  
  // 清除sessionStorage
  sessionStorage.clear()
  
  // 清除所有Cookie
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
  })
  
  // 不跳转，只清除认证信息
}

/**
 * 处理 API 响应并显示提示
 * @param response API 响应对象
 * @param options 配置选项
 * @returns 是否成功
 */
export function handleResponse<T = any>(
  response: ApiResponse<T>,
  options?: {
    context?: string
    successMessage?: string
    errorMessage?: string
    showSuccess?: boolean
    showError?: boolean
    useBackendMsg?: boolean
  }
): boolean {
  const {
    context,
    successMessage,
    errorMessage,
    showSuccess = true,
    showError = true,
    useBackendMsg = false,
  } = options || {}

  // 检查token是否过期
  if (isTokenExpired(response.code)) {
    // 不显示任何提示，直接返回false
    // 跳转逻辑由拦截器统一处理
    return false
  }

  const success = isSuccess(response.code)

  if (success) {
    if (showSuccess) {
      const message =
        successMessage ||
        (useBackendMsg ? response.msg : null) ||
        getSuccessMessage(context) ||
        '操作成功'

      ElMessage.success(message)
    }
  } else {
    if (showError) {
      const message =
        errorMessage ||
        (useBackendMsg ? response.msg : null) ||
        getErrorMessage(response.code, context, response.msg)

      ElMessage.error(message)
    }
  }

  return success
}

/**
 * 处理 API 响应（静默模式，不显示任何提示）
 */
export function handleSilentResponse<T = any>(
  response: ApiResponse<T>
): boolean {
  return handleResponse(response, {
    showSuccess: false,
    showError: false,
  })
}
