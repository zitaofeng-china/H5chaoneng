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
 * 检查响应是否成功
 */
export function isSuccess(code: string | number): boolean {
  return String(code) === SUCCESS_CODE
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
