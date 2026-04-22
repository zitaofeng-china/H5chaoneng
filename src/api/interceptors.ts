/**
 * 请求/响应拦截器
 */

import { NO_TOKEN_URLS, ENABLE_REQUEST_LOG, ENABLE_RESPONSE_LOG, RESPONSE_CONFIG } from './config'
import type { ApiResponse } from './types'
import { getSite } from '@/utils/site'
import { getToken, isTokenExpired, removeToken, removeRefreshToken, removeUserInfo, removeTokenExpiredAt } from '@/utils/token'
import { ElMessage } from 'element-plus'
import i18n from '@/lang'

// 防止重复弹出登录框的标志
let isShowingLoginPopup = false

/**
 * 获取当前语言的翻译文本
 */
function getTranslation(key: string, fallback: string): string {
  // 直接使用手动翻译映射
  const locale = localStorage.getItem('locale') || 'zh-CN'
  
  const translations: Record<string, Record<string, string>> = {
    'zh-CN': {
      'common.pleaseLogin': '请先登录',
      'auth.tokenExpired': '登录已过期，请重新登录'
    },
    'zh-TW': {
      'common.pleaseLogin': '請先登錄',
      'auth.tokenExpired': '登入已過期，請重新登入'
    },
    'en': {
      'common.pleaseLogin': 'Please login first',
      'auth.tokenExpired': 'Login expired, please login again'
    },
    'ja': {
      'common.pleaseLogin': 'まずログインしてください',
      'auth.tokenExpired': 'ログインが期限切れです、再度ログインしてください'
    },
    'ko': {
      'common.pleaseLogin': '먼저 로그인해주세요',
      'auth.tokenExpired': '로그인이 만료되었습니다, 다시 로그인해주세요'
    },
    'ru': {
      'common.pleaseLogin': 'Пожалуйста, сначала войдите в систему',
      'auth.tokenExpired': 'Срок действия входа истек, войдите снова'
    },
    'ar': {
      'common.pleaseLogin': 'الرجاء تسجيل الدخول أولاً',
      'auth.tokenExpired': 'انتهت صلاحية تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى'
    },
    'es': {
      'common.pleaseLogin': 'Por favor inicie sesión primero',
      'auth.tokenExpired': 'Sesión expirada, inicie sesión nuevamente'
    },
    'tr': {
      'common.pleaseLogin': 'Lütfen önce giriş yapın',
      'auth.tokenExpired': 'Oturum süresi doldu, lütfen tekrar giriş yapın'
    }
  }
  
  if (translations[locale] && translations[locale][key]) {
    return translations[locale][key]
  }
  
  return fallback
}

/**
 * 清除用户认证信息（包括 store 状态）
 */
function clearAuthData() {
  // 保存需要保留的数据
  const locale = localStorage.getItem('locale')
  
  // 清除认证相关存储
  removeToken()
  removeRefreshToken()
  removeUserInfo()
  removeTokenExpiredAt()
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
  
  // 清除 Pinia store 状态
  try {
    // 动态导入 userStore 以避免循环依赖
    import('@/stores/useUserStore').then(({ useUserStore }) => {
      const userStore = useUserStore()
      // 直接设置响应式状态为空
      userStore.token = ''
      userStore.userInfo = null
    })
  } catch (error) {
    console.warn('[Interceptor] 清除 store 状态失败:', error)
  }
}
/**
 * 显示登录弹窗
 */
function showLoginPopup(message?: string) {
  if (isShowingLoginPopup) return
  
  isShowingLoginPopup = true
  
  // 显示提示消息
  if (message) {
    ElMessage.warning(message)
  }
  
  // 使用 Vue 的全局属性访问登录弹窗
  const app = (window as any).__VUE_APP__
  if (app?.config?.globalProperties?.$loginPopup) {
    app.config.globalProperties.$loginPopup.open()
  }
  
  // 3秒后重置标志，允许再次弹出
  setTimeout(() => {
    isShowingLoginPopup = false
  }, 3000)
}

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
  // 检查是否需要认证
  if (needsToken(url)) {
    const token = getToken()
    
    // 情况1：未登录（没有 token）
    if (!token) {
      console.warn('[Request] 未登录，阻止请求:', url)
      
      // 显示未登录提示
      const message = getTranslation('common.pleaseLogin', '请先登录')
      ElMessage.warning(message)
      
      // 抛出错误让业务代码处理
      throw new Error('NOT_LOGGED_IN')
    }
    
    // 情况2：Token 已过期
    if (isTokenExpired()) {
      console.warn('[Request] Token 已过期，清除认证信息')
      
      // 清除认证数据（包括 store 状态）
      clearAuthData()
      
      // Token 过期时显示登录弹窗
      const message = getTranslation('auth.tokenExpired', '登录已过期，请重新登录')
      showLoginPopup(message)
      
      // 抛出错误，阻止请求继续
      throw new Error('TOKEN_EXPIRED')
    }
  }

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
    // 清除认证数据（包括 store 状态）
    clearAuthData()
    
    // 显示登录弹窗
    const message = getTranslation('auth.tokenExpired', '登录已过期，请重新登录')
    showLoginPopup(message)
  }

  // 返回标准格式（保持后端字段名 msg）
  return {
    code,
    msg,
    data,
  }
}
