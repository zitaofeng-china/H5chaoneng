/**
 * HTTP 请求封装
 */

import type { ApiResponse } from './types'
import { BASE_URL, REQUEST_TIMEOUT, RESPONSE_CONFIG } from './config'
import { requestInterceptor, responseInterceptor } from './interceptors'
import { handleHttpError } from './errorHandler'

// 请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, any>
  timeout?: number
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
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  })
}

/**
 * 统一请求方法
 */
async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { params, timeout = REQUEST_TIMEOUT, ...restConfig } = config

  const method = restConfig.method || 'GET'
  const fullUrl = buildUrl(url, params)

  // 请求拦截
  const interceptedConfig = requestInterceptor(fullUrl, restConfig)

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
    const isSuccess = data.code === successCode

    // 不在这里显示错误提示，由组件层统一处理
    if (!isSuccess) {
      if (import.meta.env.DEV) {
        console.error('[Business Error]', {
          code: data.code,
          msg: data.msg,
          url: fullUrl,
          method,
          data: data.data,
        })
      }
    }

    return data
  } catch (error) {
    // 错误处理
    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        return {
          code: -1,
          msg: '请求超时',
          data: null as any,
        }
      }
      if (error.message.includes('Failed to fetch')) {
        return {
          code: -1,
          msg: '网络错误',
          data: null as any,
        }
      }
    }

    // 未知错误
    return {
      code: -1,
      msg: error instanceof Error ? error.message : '未知错误',
      data: null as any,
    }
  }
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
 * PATCH 请求
 */
export function patch<T = any>(url: string, data?: any, config?: RequestConfig) {
  return request<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...config,
  })
}

export default request
