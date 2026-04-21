/**
 * 请求/响应拦截器
 */

import { NO_TOKEN_URLS, ENABLE_REQUEST_LOG, ENABLE_RESPONSE_LOG, RESPONSE_CONFIG } from './config'
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
  // 构建请求头（只添加必需的请求头）
  const headers: Record<string, string> = {}

  // 1. Content-Type（只在有 body 的请求中添加）
  if (config.body) {
    headers['Content-Type'] = 'application/json'
  }

  // 2. Site（必需，后端用于识别站点）
  const site = getSite()
  headers['Site'] = site

  // 3. Authorization（仅在需要认证的接口添加）
  if (needsToken(url)) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = token
    }
  }

  // 合并用户自定义的请求头
  const configHeaders = (config.headers as Record<string, string>) || {}
  Object.assign(headers, configHeaders)

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
  const msg = response[messageField as keyof typeof response] as string
  const data = response[dataField as keyof typeof response] as T

  // 检查token是否过期（401或特定业务码）
  const TOKEN_EXPIRED_CODES = ['100003', '100004', '401']
  if (TOKEN_EXPIRED_CODES.includes(code)) {
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

  // 返回标准格式（保持后端字段名 msg）
  return {
    code,
    msg,
    data,
  }
}
