/**
 * 能量租赁模块类型定义
 */

// 租赁类型
export type RentalType = 'time' | 'count'

// 租赁状态
export type RentalStatus = 'pending' | 'processing' | 'success' | 'failed' | 'expired'

// 能量租赁请求参数（按时间）
export interface TimeRentalParams {
  address: string // 租用钱包地址
  count: number // 笔数
  unitPrice: number // 单价（TRX）
  energy: number // 能量数量（W）
  validity: number // 有效期（天）
  totalPrice: number // 总价（TRX）
  paymentMethod?: 'balance' | 'transfer' // 支付方式
}

// 能量租赁请求参数（按笔数）
export interface CountRentalParams {
  address: string // 租用钱包地址
  count: number // 笔数
  unitPrice: number // 单价（TRX）
  energy: number // 单笔能量数量
  totalPrice: number // 总价（TRX）
  paymentMethod?: 'balance' | 'transfer' // 支付方式
}

// 能量租赁响应数据
export interface RentalResponse {
  orderId: string
  type: RentalType
  address: string
  count: number
  unitPrice: number
  totalPrice: number
  energy: number
  validity?: number // 有效期（按时间租用才有）
  status: RentalStatus
  paymentMethod: string
  walletAddress?: string // 转账地址（转账支付时返回）
  qrcode?: string // 二维码（转账支付时返回）
  expiresAt?: string // 过期时间
  createdAt: string
  updatedAt?: string
}

// 租赁订单详情
export interface RentalOrderDetail extends RentalResponse {
  userId: string
  transactionHash?: string // 交易哈希
  usedCount: number // 已使用笔数
  remainingCount: number // 剩余笔数
  lastUsedAt?: string // 最后使用时间
}

// 快速租用参数
export interface QuickRentalParams {
  address: string
  count?: number // 默认 1 笔
}

// 转账租赁参数
export interface TransferRentalParams {
  address: string
  amount: number // 转账金额（TRX）
}

// 转账租赁响应
export interface TransferRentalResponse {
  walletAddress: string // 租赁钱包地址
  qrcode: string // 二维码
  amount: number // 应转账金额
  count: number // 对应笔数
  energy: number // 对应能量
  expiresIn: number // 有效期（秒）
  tips: string[] // 温馨提示
}

// 保存地址参数
export interface SaveAddressParams {
  address: string
  label?: string // 地址标签
}

// 保存的地址信息
export interface SavedAddress {
  id: string
  address: string
  label?: string
  usedCount: number // 使用次数
  lastUsedAt?: string
  createdAt: string
}

// 租赁配置
export interface RentalConfig {
  timeRental: {
    options: Array<{
      validity: number // 有效期（小时或天）
      unit: 'hour' | 'day'
      counts: number[] // 可选笔数
      unitPrice: number // 单价
    }>
    energyPerCount: number // 每笔能量数
  }
  countRental: {
    unitPrice: number // 单价
    energyPerCount: number // 每笔能量数
    tips: string[] // 提示信息
  }
  transferRental: {
    options: Array<{
      amount: number // 转账金额
      count: number // 对应笔数
    }>
    energyPerCount: number
    expiresIn: number // 有效期（秒）
  }
}
