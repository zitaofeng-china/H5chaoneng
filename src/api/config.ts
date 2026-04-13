/**
 * API 配置文件
 */

// API 基础 URL
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 30000

// 请求重试次数
export const RETRY_COUNT = 3

// 请求重试延迟（毫秒）
export const RETRY_DELAY = 1000

// Token 存储 key
export const TOKEN_KEY = 'token'

// Refresh Token 存储 key
export const REFRESH_TOKEN_KEY = 'refresh_token'

// 状态码配置
export const STATUS_CODE = {
  SUCCESS: 200, // 成功
  CREATED: 201, // 创建成功
  NO_CONTENT: 204, // 无内容
  BAD_REQUEST: 400, // 请求错误
  UNAUTHORIZED: 401, // 未授权
  FORBIDDEN: 403, // 禁止访问
  NOT_FOUND: 404, // 未找到
  TIMEOUT: 408, // 请求超时
  CONFLICT: 409, // 冲突
  INTERNAL_ERROR: 500, // 服务器错误
  BAD_GATEWAY: 502, // 网关错误
  SERVICE_UNAVAILABLE: 503, // 服务不可用
  GATEWAY_TIMEOUT: 504, // 网关超时
} as const

// 业务状态码配置
export const BUSINESS_CODE = {
  SUCCESS: 200, // 成功
  FAIL: -1, // 失败
  TOKEN_EXPIRED: 401, // Token 过期
  TOKEN_INVALID: 402, // Token 无效
  PERMISSION_DENIED: 403, // 权限不足
  RESOURCE_NOT_FOUND: 404, // 资源不存在
  PARAMS_ERROR: 422, // 参数错误
  SERVER_ERROR: 500, // 服务器错误
  MAINTENANCE: 503, // 系统维护
} as const

// 错误消息配置
export const ERROR_MESSAGE = {
  NETWORK_ERROR: 'network.error',
  TIMEOUT_ERROR: 'network.timeout',
  SERVER_ERROR: 'server.error',
  UNKNOWN_ERROR: 'error.unknown',
  TOKEN_EXPIRED: 'auth.tokenExpired',
  TOKEN_INVALID: 'auth.tokenInvalid',
  PERMISSION_DENIED: 'auth.permissionDenied',
  PARAMS_ERROR: 'error.paramsError',
  RESOURCE_NOT_FOUND: 'error.notFound',
} as const

// 是否显示错误提示
export const SHOW_ERROR_MESSAGE = true

// 是否显示成功提示
export const SHOW_SUCCESS_MESSAGE = false

// 是否优先使用后端返回的错误消息
export const USE_BACKEND_ERROR_MESSAGE = true

// 是否在控制台打印请求日志
export const ENABLE_REQUEST_LOG = import.meta.env.DEV

// 是否在控制台打印响应日志
export const ENABLE_RESPONSE_LOG = import.meta.env.DEV

// 需要忽略错误提示的接口列表（支持正则）
export const IGNORE_ERROR_URLS: (string | RegExp)[] = [
  '/auth/verify-token', // 验证 Token 接口
  /\/check-status$/, // 状态检查接口
]

// 需要显示成功提示的接口列表（支持正则）
export const SHOW_SUCCESS_URLS: (string | RegExp)[] = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/revise-password',
  /\/rental\/(time|count)$/,
  /\/contract\/flash$/,
  /\/hosting\/(add|delete)$/,
  /\/activation\/batch$/,
]

// 需要 Token 的接口白名单（不需要 Token 的接口）
export const NO_TOKEN_URLS: (string | RegExp)[] = [
  '/auth/login',
  '/auth/register',
  '/auth/send-code',
  '/auth/reset-password',
  /\/contract\/rate$/,
  /\/contract\/config$/,
  /\/rental\/config$/,
]

// 请求头配置
export const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
} as const

// 响应数据格式配置
export interface ResponseConfig {
  codeField: string // 状态码字段名
  messageField: string // 消息字段名
  dataField: string // 数据字段名
  successCode: number | number[] // 成功状态码
}

export const RESPONSE_CONFIG: ResponseConfig = {
  codeField: 'code',
  messageField: 'message',
  dataField: 'data',
  successCode: [200, 0], // 支持多个成功状态码
}
