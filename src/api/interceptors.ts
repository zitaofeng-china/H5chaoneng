/**
 * 请求/响应拦截器
 */

import { REQUEST_HEADERS, NO_TOKEN_URLS, ENABLE_REQUEST_LOG, ENABLE_RESPONSE_LOG, RESPONSE_CONFIG } from './config'
import type { ApiResponse } from './types'
import { getSite } from '@/utils/site'
import { getToken } from '@/utils/token'

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
 * 请求拦截器
 */
export function requestInterceptor(url: string, config: RequestInit): RequestInit {
  // 构建请求头
  const configHeaders = (config.headers as Record<string, string>) || {}
  const headers: Record<string, string> = {
    ...REQUEST_HEADERS,
    ...configHeaders,
  }

  // 获取 Site（从 URL 路由参数）
  const site = getSite()
  
  // 添加 Site 请求头
  headers['Site'] = site

  // 添加 Token（从当前 Site 的 Token 存储中获取）
  if (needsToken(url)) {
    const token = getToken()
    if (token) {
      // 注意：后端需要的是直接的 Token，不需要 Bearer 前缀
      headers['Authorization'] = token
    }
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
  const { codeField, messageField, dataField } = RESPONSE_CONFIG

  // 提取响应数据（确保 code 是字符串类型）
  const code = String(response[codeField as keyof typeof response])
  const message = response[messageField as keyof typeof response] as string
  const data = response[dataField as keyof typeof response] as T

  // 返回标准格式
  return {
    code,
    message,
    data,
  }
}
