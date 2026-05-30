/**
 * API 配置文件
 */

// API 基础 URL
// 优先级：
// 1. 开发环境：始终使用环境变量（走 Vite 代理）
// 2. 生产环境：运行时配置 > 环境变量
function getBaseUrl(): string {
  // 开发环境：优先使用环境变量（通常为空，走 Vite 代理）
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || ''
  }
  
  // 生产环境：优先使用运行时配置
  const runtimeConfig = (window as any).__APP_CONFIG__?.API_BASE_URL
  if (runtimeConfig !== undefined && runtimeConfig !== null) {
    return runtimeConfig
  }
  
  // 兜底：使用环境变量
  return import.meta.env.VITE_API_BASE_URL || ''
}

export const BASE_URL = getBaseUrl()

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 30000

// 是否在控制台打印请求日志
export const ENABLE_REQUEST_LOG = import.meta.env.DEV

// 是否在控制台打印响应日志
export const ENABLE_RESPONSE_LOG = import.meta.env.DEV

// 不需要 Token 的接口列表
export const NO_TOKEN_URLS: (string | RegExp)[] = [
  '/v3/login',
  '/v3/register',
  '/v3/reset_password',
  '/v3/change_password', // 修改密码不需要 Token，只需要 Site
  '/v3/site', // 获取站点信息
  '/v3/price', // 获取价格信息
  '/v3/address', // 获取付款地址（二维码）- 包括福利订单 kind=6
  '/v3/exchange/rate', // 获取汇率信息
  '/v3/captcha/email', // 获取邮箱验证码
  '/v3/tg_login', // Telegram Mini App 登录
]

// 请求头配置
export const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
} as const

// 响应数据格式配置
export interface ResponseConfig {
  codeField: string
  messageField: string
  dataField: string
  successCode: string // 成功状态码
  failCode: string // 失败状态码
}

export const RESPONSE_CONFIG: ResponseConfig = {
  codeField: 'code',
  messageField: 'msg',
  dataField: 'data',
  successCode: '000000', // 成功
  failCode: '000007', // 失败
}
