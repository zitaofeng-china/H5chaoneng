/**
 * API 配置文件
 */

// API 基础 URL
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
  '/auth/register',
  '/auth/send-code',
  '/auth/reset-password',
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
