/**
 * API 统一导出入口
 */

// 认证模块
export * as authApi from './modules/auth'

// Site 模块
export * as siteApi from './modules/site'

// 价格模块
export * as priceApi from './modules/price'

// 地址模块
export * as addressApi from './modules/address'

// 导出请求方法
export { get, post } from './request'

// 导出通用类型
export type { ApiResponse } from './types'
