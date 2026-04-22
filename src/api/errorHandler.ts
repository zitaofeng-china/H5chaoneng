/**
 * 错误处理器
 */

import { ElMessage } from 'element-plus'
import i18n from '@/lang'
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
 * 获取 HTTP 错误的国际化消息
 */
function getHttpErrorMessage(code: number): string {
  const t = i18n.global.t
  
  switch (code) {
    case 400:
      return t('http.badRequest')
    case 401:
      return t('http.unauthorized')
    case 403:
      return t('http.forbidden')
    case 404:
      return t('http.notFound')
    case 408:
      return t('http.timeout')
    case 500:
      return t('http.internalServerError')
    case 502:
      return t('http.badGateway')
    case 503:
      return t('http.serviceUnavailable')
    case 504:
      return t('http.gatewayTimeout')
    default:
      return t('http.unknownError', { code })
  }
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
  // 检查是否为token过期（401）
  if (code === 401) {
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
    
    // 不跳转，只返回错误信息
    return {
      code,
      msg: getHttpErrorMessage(code),
      data: null as any,
    }
  }
  
  const errorMessage = getHttpErrorMessage(code)
  
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

