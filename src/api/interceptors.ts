/**
 * 请求/响应拦截器
 */

import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  TOKEN_KEY,
  REQUEST_HEADERS,
  NO_TOKEN_URLS,
  ENABLE_REQUEST_LOG,
  ENABLE_RESPONSE_LOG,
  RESPONSE_CONFIG,
  SHOW_SUCCESS_MESSAGE,
  SHOW_SUCCESS_URLS,
} from './config'
import type { ApiResponse } from './types'
import { getAgentCode } from '@/utils/invite'

/**
 * 判断是否需要 Token
 */
function needsToken(url: string): boolean {
  return !NO_TOKEN_URLS.some((pattern) => {
    if (typeof pattern === 'string') {
      return url.includes(pattern)
    }
    return pattern.test(url)
  })
}

/**
 * 判断是否需要显示成功提示
 */
function shouldShowSuccess(url: string): boolean {
  return SHOW_SUCCESS_URLS.some((pattern) => {
    if (typeof pattern === 'string') {
      return url.includes(pattern)
    }
    return pattern.test(url)
  })
}

/**
 * 获取 Token
 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 请求拦截器
 */
export function requestInterceptor(url: string, config: RequestInit): RequestInit {
  // 构建请求头
  const headers: Record<string, string> = {
    ...REQUEST_HEADERS,
    ...(config.headers as Record<string, string> || {}),
  }

  // 添加 Token
  if (needsToken(url)) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // 添加代理标识到请求头
  const agentCode = getAgentCode()
  if (agentCode) {
    headers['X-Agent-Code'] = agentCode
  }

  // 添加时间戳（防止缓存）
  if (config.method === 'GET') {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}_t=${Date.now()}`
  }

  // 打印请求日志
  if (ENABLE_REQUEST_LOG) {
    console.log('[Request]', {
      url,
      method: config.method || 'GET',
      headers,
      body: config.body,
    })
  }

  return {
    ...config,
    headers,
  }
}

/**
 * 响应拦截器
 */
export function responseInterceptor<T = any>(
  response: ApiResponse<T>,
  url: string,
  method: string
): ApiResponse<T> {
  // 打印响应日志
  if (ENABLE_RESPONSE_LOG) {
    console.log('[Response]', {
      url,
      method,
      response,
    })
  }

  // 获取配置的字段名
  const { codeField, messageField, dataField, successCode } = RESPONSE_CONFIG

  // 提取响应数据
  const code = response[codeField as keyof typeof response] as number
  const message = response[messageField as keyof typeof response] as string
  const data = response[dataField as keyof typeof response] as T

  // 判断是否成功
  const isSuccess = Array.isArray(successCode)
    ? successCode.includes(code)
    : code === successCode

  // 显示成功提示
  if (isSuccess && SHOW_SUCCESS_MESSAGE && shouldShowSuccess(url)) {
    const { t } = useI18n()
    ElMessage.success({
      message: message || t('common.success'),
      duration: 2000,
    })
  }

  // 返回标准格式
  return {
    code,
    message,
    data,
  }
}

/**
 * 请求重试拦截器
 */
export function retryInterceptor(
  error: Error,
  retryCount: number,
  maxRetries: number
): boolean {
  // 判断是否需要重试
  if (retryCount >= maxRetries) {
    return false
  }

  // 只重试网络错误和超时错误
  const shouldRetry =
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('timeout')

  if (shouldRetry && ENABLE_REQUEST_LOG) {
    console.log(`[Retry] Attempt ${retryCount + 1}/${maxRetries}`)
  }

  return shouldRetry
}

/**
 * Token 刷新拦截器
 */
export async function tokenRefreshInterceptor(response: ApiResponse): Promise<boolean> {
  // 判断是否需要刷新 Token
  if (response.code === 401 || response.code === 402) {
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      return false
    }

    try {
      // 调用刷新 Token 接口
      const res = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await res.json()

      if (data.code === 200) {
        // 保存新 Token
        localStorage.setItem(TOKEN_KEY, data.data.token)
        localStorage.setItem('refresh_token', data.data.refreshToken)
        return true
      }
    } catch (error) {
      console.error('[Token Refresh Error]', error)
    }
  }

  return false
}
