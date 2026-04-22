/**
 * API 通用类型定义
 */

// 通用响应结构
export interface ApiResponse<T = any> {
  code: number | string // 支持数字和字符串类型的状态码
  msg: string // 后端统一使用 msg 字段
  data: T
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应数据
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  email: string
  telegram?: string
  balance: number
  createdAt: string
}

// 登录请求
export interface LoginParams {
  username: string
  password: string
  rememberPassword?: boolean
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

// 注册请求
export interface RegisterParams {
  username: string
  email: string
  password: string
  telegram?: string
}

// 重置密码请求
export interface ResetPasswordParams {
  email: string
  code: string
  password: string
}

// 修改密码请求
export interface RevisePasswordParams {
  oldPassword: string
  newPassword: string
}

// 发送验证码请求
export interface SendCodeParams {
  email: string
}

// 能量租赁请求
export interface EnergyRentalParams {
  address: string
  count: number
  unitPrice: number
  energy: number
  validity: number
  type: 'time' | 'count'
}

// 能量租赁响应
export interface EnergyRentalResponse {
  orderId: string
  address: string
  count: number
  totalPrice: number
  energy: number
  validity: number
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

// 合约闪兑请求
export interface ContractFlashParams {
  type: 'usdt-to-trx' | 'trx-to-usdt'
  amount: number
  address: string
}

// 合约闪兑响应
export interface ContractFlashResponse {
  orderId: string
  type: string
  amount: number
  estimatedGet: number
  rate: number
  walletAddress: string
  qrcode: string
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

// 智能托管请求
export interface HostingParams {
  addresses: string[]
}

// 智能托管响应
export interface HostingResponse {
  id: string
  address: string
  energy: number
  historyUsed: number
  todayUsed: number
  status: 'active' | 'inactive'
  createdAt: string
}

// 批量激活请求
export interface ActivationParams {
  addresses: string[]
}

// 批量激活响应
export interface ActivationResponse {
  successCount: number
  totalCount: number
  failedAddresses: string[]
}

// 充值请求
export interface RechargeParams {
  amount: number
}

// 充值响应
export interface RechargeResponse {
  orderId: string
  amount: number
  address: string
  qrcode: string
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

// 订单查询参数
export interface OrderQueryParams extends PageParams {
  type?: 'rental' | 'flash' | 'hosting' | 'activation' | 'recharge'
  status?: 'pending' | 'success' | 'failed'
  startDate?: string
  endDate?: string
}

// 订单信息
export interface OrderInfo {
  id: string
  type: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
}

// 汇率信息
export interface RateInfo {
  usdtToTrx: number
  trxToUsdt: number
  updateTime: string
}

// 系统配置
export interface SystemConfig {
  minUsdtAmount: number
  maxUsdtAmount: number
  minTrxAmount: number
  maxTrxAmount: number
  platformFee: number
  energyPrice: number
}
