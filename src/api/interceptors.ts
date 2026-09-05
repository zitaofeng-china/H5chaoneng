/**
 * 请求/响应拦截器
 */

import { NO_TOKEN_URLS, ENABLE_REQUEST_LOG, ENABLE_RESPONSE_LOG, RESPONSE_CONFIG } from './config'
import type { ApiResponse } from './types'
import { getSite } from '@/utils/site'
import { getToken, isTokenExpired } from '@/utils/token'
import { clearAuthSession } from '@/utils/session'
import { ElMessage } from '@/utils/element'
import { getPopup } from '@/plugins/popupRegistry'
import i18n from '@/lang'
import { isMiniAppRuntime } from '@/utils/telegram'

// 防止重复弹出登录框的标志
let isShowingLoginPopup = false

function t(key: string, fallback: string): string {
  try {
    const translated = i18n.global.t(key)
    if (typeof translated === 'string' && translated && translated !== key) {
      return translated
    }
  } catch {
    // i18n 尚未就绪时回退
  }
  return fallback
}

function showLoginTip(message: string) {
  ElMessage.warning({
    message,
    duration: 2000,
    showClose: true,
  })
}

/**
 * 显示登录弹窗
 */
function showLoginPopup(message?: string) {
  if (isShowingLoginPopup) return

  isShowingLoginPopup = true

  // Mini App 不打开账号密码登录框，仅展示可点击/2 秒自动关闭的提示
  if (isMiniAppRuntime()) {
    if (message) showLoginTip(message)
    setTimeout(() => {
      isShowingLoginPopup = false
    }, 2000)
    return
  }

  // 显示提示消息
  if (message) {
    ElMessage.warning(message)
  }

  // 登录弹窗可能尚未懒加载完成
  void Promise.resolve(getPopup('loginPopup')?.open()).catch(() => {})

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
  const requiresAuth = needsToken(url)

  if (requiresAuth) {
    const token = getToken()

    // 情况1：未登录（没有 token）
    if (!token) {
      console.warn('[Request] 未登录，阻止请求:', url)

      // 显示未登录提示
      const message = t('common.pleaseLogin', '请先登录')
      if (isMiniAppRuntime()) {
        if (!isShowingLoginPopup) {
          isShowingLoginPopup = true
          showLoginTip(message)
          setTimeout(() => {
            isShowingLoginPopup = false
          }, 2000)
        }
      } else {
        ElMessage.warning(message)
      }

      // 抛出错误让业务代码处理
      throw new Error('NOT_LOGGED_IN')
    }

    // 情况2：Token 已过期
    if (isTokenExpired()) {
      console.warn('[Request] Token 已过期，清除认证信息')

      // 清除认证数据（包括 store 状态）
      void clearAuthSession()

      // Token 过期时显示登录弹窗
      const message = t('auth.tokenExpired', '登录已过期，请重新登录')
      showLoginPopup(message)

      // 抛出错误，阻止请求继续
      throw new Error('TOKEN_EXPIRED')
    }
  } else if (import.meta.env.DEV) {
    // 不需要认证的接口，仅开发环境记录日志
    console.log('[Request] 无需认证的接口:', url)
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
  if (requiresAuth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = token
    }
  }

  // 合并用户自定义的请求头（如 TG InitData）
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
    // 站点和价格等公开接口无需携带浏览器 Cookie，避免代理将旧登录态转发给后端。
    credentials: requiresAuth ? config.credentials : 'omit',
  }
}

/**
 * 响应拦截器
 */
export function responseInterceptor<T = unknown>(
  response: ApiResponse<T>,
  url: string,
  method: string,
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
    void clearAuthSession()

    // 显示登录弹窗
    const message = t('auth.tokenExpired', '登录已过期，请重新登录')
    showLoginPopup(message)
  }

  // 返回标准格式（保持后端字段名 msg）
  return {
    code,
    msg,
    data,
  }
}
