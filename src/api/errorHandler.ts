/**
 * 错误处理器
 */

import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  STATUS_CODE,
  BUSINESS_CODE,
  ERROR_MESSAGE,
  SHOW_ERROR_MESSAGE,
  IGNORE_ERROR_URLS,
  USE_BACKEND_ERROR_MESSAGE,
} from './config'
import type { ApiResponse } from './types'

// 错误类型
export enum ErrorType {
  NETWORK = 'NETWORK', // 网络错误
  TIMEOUT = 'TIMEOUT', // 超时错误
  HTTP = 'HTTP', // HTTP 错误
  BUSINESS = 'BUSINESS', // 业务错误
  UNKNOWN = 'UNKNOWN', // 未知错误
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType
  code: number
  message: string
  url?: string
  method?: string
  data?: any
}

/**
 * 判断是否需要忽略错误提示
 */
function shouldIgnoreError(url: string): boolean {
  return IGNORE_ERROR_URLS.some((pattern) => {
    if (typeof pattern === 'string') {
      return url.includes(pattern)
    }
    return pattern.test(url)
  })
}

/**
 * 获取错误消息
 * 优先级：
 * 1. 后端返回消息（如果 USE_BACKEND_ERROR_MESSAGE = true）
 * 2. 翻译消息（如果消息是翻译 key）
 * 3. 默认消息（根据错误类型和错误码）
 */
function getErrorMessage(errorInfo: ErrorInfo): string {
  const { t } = useI18n()

  // 1. 优先使用后端返回的消息（如果配置开启）
  if (USE_BACKEND_ERROR_MESSAGE && errorInfo.message && errorInfo.message.trim()) {
    // 判断是否是翻译 key（包含点号且不是 URL）
    const isTranslationKey =
      errorInfo.message.includes('.') &&
      !errorInfo.message.startsWith('http') &&
      !errorInfo.message.includes('://')

    if (isTranslationKey) {
      // 尝试翻译，如果翻译 key 不存在则使用原文
      const translated = t(errorInfo.message)
      return translated !== errorInfo.message ? translated : errorInfo.message
    }

    // 直接返回后端消息
    return errorInfo.message
  }

  // 2. 根据错误类型返回默认消息
  switch (errorInfo.type) {
    case ErrorType.NETWORK:
      return t(ERROR_MESSAGE.NETWORK_ERROR)
    case ErrorType.TIMEOUT:
      return t(ERROR_MESSAGE.TIMEOUT_ERROR)
    case ErrorType.HTTP:
      return getHttpErrorMessage(errorInfo.code)
    case ErrorType.BUSINESS:
      return getBusinessErrorMessage(errorInfo.code)
    default:
      return t(ERROR_MESSAGE.UNKNOWN_ERROR)
  }
}

/**
 * 获取 HTTP 错误消息
 */
function getHttpErrorMessage(code: number): string {
  const { t } = useI18n()

  const messageMap: Record<number, string> = {
    [STATUS_CODE.BAD_REQUEST]: t('error.badRequest'),
    [STATUS_CODE.UNAUTHORIZED]: t(ERROR_MESSAGE.TOKEN_EXPIRED),
    [STATUS_CODE.FORBIDDEN]: t(ERROR_MESSAGE.PERMISSION_DENIED),
    [STATUS_CODE.NOT_FOUND]: t(ERROR_MESSAGE.RESOURCE_NOT_FOUND),
    [STATUS_CODE.TIMEOUT]: t(ERROR_MESSAGE.TIMEOUT_ERROR),
    [STATUS_CODE.INTERNAL_ERROR]: t(ERROR_MESSAGE.SERVER_ERROR),
    [STATUS_CODE.BAD_GATEWAY]: t('error.badGateway'),
    [STATUS_CODE.SERVICE_UNAVAILABLE]: t('error.serviceUnavailable'),
    [STATUS_CODE.GATEWAY_TIMEOUT]: t(ERROR_MESSAGE.TIMEOUT_ERROR),
  }

  return messageMap[code] || t(ERROR_MESSAGE.SERVER_ERROR)
}

/**
 * 获取业务错误消息
 */
function getBusinessErrorMessage(code: number): string {
  const { t } = useI18n()

  const messageMap: Record<number, string> = {
    [BUSINESS_CODE.TOKEN_EXPIRED]: t(ERROR_MESSAGE.TOKEN_EXPIRED),
    [BUSINESS_CODE.TOKEN_INVALID]: t(ERROR_MESSAGE.TOKEN_INVALID),
    [BUSINESS_CODE.PERMISSION_DENIED]: t(ERROR_MESSAGE.PERMISSION_DENIED),
    [BUSINESS_CODE.RESOURCE_NOT_FOUND]: t(ERROR_MESSAGE.RESOURCE_NOT_FOUND),
    [BUSINESS_CODE.PARAMS_ERROR]: t(ERROR_MESSAGE.PARAMS_ERROR),
    [BUSINESS_CODE.SERVER_ERROR]: t(ERROR_MESSAGE.SERVER_ERROR),
    [BUSINESS_CODE.MAINTENANCE]: t('error.maintenance'),
  }

  return messageMap[code] || t(ERROR_MESSAGE.UNKNOWN_ERROR)
}

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
 * 处理 Token 过期
 */
function handleTokenExpired() {
  const router = useRouter()

  // 清除 Token
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')

  // 跳转到登录页
  router.push({
    path: '/login',
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  })
}

/**
 * 处理权限不足
 */
function handlePermissionDenied() {
  const router = useRouter()

  // 跳转到 403 页面
  router.push('/403')
}

/**
 * 统一错误处理
 */
export function handleError(errorInfo: ErrorInfo): void {
  // 打印错误日志
  if (import.meta.env.DEV) {
    console.error('[API Error]', errorInfo)
  }

  // 判断是否需要忽略错误提示
  if (errorInfo.url && shouldIgnoreError(errorInfo.url)) {
    return
  }

  // 特殊错误处理
  if (
    errorInfo.code === STATUS_CODE.UNAUTHORIZED ||
    errorInfo.code === BUSINESS_CODE.TOKEN_EXPIRED
  ) {
    handleTokenExpired()
    return
  }

  if (
    errorInfo.code === STATUS_CODE.FORBIDDEN ||
    errorInfo.code === BUSINESS_CODE.PERMISSION_DENIED
  ) {
    handlePermissionDenied()
    return
  }

  // 显示错误提示
  if (SHOW_ERROR_MESSAGE) {
    const message = getErrorMessage(errorInfo)
    showErrorMessage(message)
  }
}

/**
 * 创建错误响应
 */
export function createErrorResponse<T = any>(errorInfo: ErrorInfo): ApiResponse<T> {
  return {
    code: errorInfo.code,
    message: getErrorMessage(errorInfo),
    data: null as any,
  }
}

/**
 * 网络错误处理
 */
export function handleNetworkError(url: string, method: string): ApiResponse {
  const errorInfo: ErrorInfo = {
    type: ErrorType.NETWORK,
    code: -1,
    message: ERROR_MESSAGE.NETWORK_ERROR,
    url,
    method,
  }

  handleError(errorInfo)
  return createErrorResponse(errorInfo)
}

/**
 * 超时错误处理
 */
export function handleTimeoutError(url: string, method: string): ApiResponse {
  const errorInfo: ErrorInfo = {
    type: ErrorType.TIMEOUT,
    code: STATUS_CODE.TIMEOUT,
    message: ERROR_MESSAGE.TIMEOUT_ERROR,
    url,
    method,
  }

  handleError(errorInfo)
  return createErrorResponse(errorInfo)
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
  const errorInfo: ErrorInfo = {
    type: ErrorType.HTTP,
    code,
    message,
    url,
    method,
  }

  handleError(errorInfo)
  return createErrorResponse(errorInfo)
}

/**
 * 业务错误处理
 * @param code 错误码
 * @param message 后端返回的错误消息（优先使用）
 * @param url 请求 URL
 * @param method 请求方法
 * @param data 响应数据
 */
export function handleBusinessError(
  code: number,
  message: string,
  url: string,
  method: string,
  data?: any
): ApiResponse {
  const errorInfo: ErrorInfo = {
    type: ErrorType.BUSINESS,
    code,
    message, // 直接使用后端返回的消息
    url,
    method,
    data,
  }

  handleError(errorInfo)
  return createErrorResponse(errorInfo)
}
