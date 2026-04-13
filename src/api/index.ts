/**
 * API 统一导出入口
 */

// 认证模块
export * as authApi from './modules/auth'

// 用户模块
export * as userApi from './modules/user'

// 能量租赁模块
export * as rentalApi from './modules/rental'

// 合约闪兑模块
export * as contractApi from './modules/contract'

// 智能托管模块
export * as hostingApi from './modules/hosting'

// 批量激活模块
export * as activationApi from './modules/activation'

// 导出请求方法
export { get, post, put, del, patch } from './request'

// 导出通用类型
export type { ApiResponse } from './types'
