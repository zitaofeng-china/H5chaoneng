/**
 * HTTP 请求封装
 * 基于 fetch API 的统一请求处理
 */

import type { ApiResponse } from './types'
import {
  BASE_URL,
  REQUEST_TIMEOUT,
  RETRY_COUNT,
  RETRY_DELAY,
  RESPONSE_CONFIG,
} from './config'
import {
  requestInterceptor,
  responseInterceptor,
  retryInterceptor,
  tokenRefreshInterceptor,
} from './interceptors'
import {
  handleNetworkError,
  handleTimeoutError,
  handleHttpError,
  handleBusinessError,
} from './errorHandler'

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, any>
  timeout?: number
  retry?: boolean
  retryCount?: number
  retryDelay?: number
}

/**
 * 构建完整 URL
 */
function buildUrl(url: string, params?: Record<string, any>): string {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  if (!params || Object.keys(params).length === 0) {
    return fullUrl
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return queryString ? `${fullUrl}?${queryString}` : fullUrl
}

/**
 * 请求超时处理
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'))
    }, timeout)
  })
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 统一请求方法
 */
async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    params,
    timeout = REQUEST_TIMEOUT,
    retry = true,
    retryCount = RETRY_COUNT,
    retryDelay = RETRY_DELAY,
    ...restConfig
  } = config

  const method = restConfig.method || 'GET'
  const fullUrl = buildUrl(url, params)

  // 请求拦截
  const interceptedConfig = requestInterceptor(fullUrl, restConfig)

  let currentRetry = 0

  while (currentRetry <= retryCount) {
    try {
      // 发起请求（带超时）
      const response = await Promise.race([
        fetch(fullUrl, interceptedConfig),
        createTimeoutPromise(timeout),
      ])

      // 检查 HTTP 状态
      if (!response.ok) {
        return handleHttpError(response.status, response.statusText, fullUrl, method)
      }

      // 解析响应
      const rawData = await response.json()

      // 响应拦截
      const data = responseInterceptor<T>(rawData, fullUrl, method)

      // 检查业务状态码
      const { successCode } = RESPONSE_CONFIG
      const isSuccess = Array.isArray(successCode)
        ? successCode.includes(data.code)
        : data.code === successCode

      if (!isSuccess) {
        // 尝试刷新 Token
        const tokenRefreshed = await tokenRefreshInterceptor(data)
        if (tokenRefreshed) {
          // Token 刷新成功，重新请求
          return request<T>(url, config)
        }

        // 业务错误处理
        return handleBusinessError(data.code, data.message, fullUrl, method, data.data)
      }

      return data
    } catch (error) {
      // 判断是否需要重试
      if (retry && retryInterceptor(error as Error, currentRetry, retryCount)) {
        currentRetry++
        await delay(retryDelay * currentRetry) // 指数退避
        continue
      }

      // 错误处理
      if (error instanceof Error) {
        if (error.message === 'Request timeout') {
          return handleTimeoutError(fullUrl, method)
        }
        if (error.message.includes('Failed to fetch')) {
          return handleNetworkError(fullUrl, method)
        }
      }

      // 未知错误
      return {
        code: -1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null as any,
      }
    }
  }

  // 重试次数用尽
  return handleNetworkError(fullUrl, method)
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: Record<string, any>, config?: RequestConfig) {
  return request<T>(url, {
    method: 'GET',
    params,
    ...config,
  })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, config?: RequestConfig) {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...config,
  })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: RequestConfig) {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...config,
  })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: Record<string, any>, config?: RequestConfig) {
  return request<T>(url, {
    method: 'DELETE',
    params,
    ...config,
  })
}

/**
 * PATCH 请求
 */
export function patch<T = any>(url: string, data?: any, config?: RequestConfig) {
  return request<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...config,
  })
}

// 导出默认请求方法
export default request
