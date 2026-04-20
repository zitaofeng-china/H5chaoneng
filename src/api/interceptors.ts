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
