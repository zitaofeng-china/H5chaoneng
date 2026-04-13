/**
 * 批量激活模块类型定义
 */

// 激活状态
export type ActivationStatus = 'pending' | 'processing' | 'success' | 'failed'

// 批量激活请求参数
export interface ActivationParams {
  addresses: string[] // 需要激活的地址列表（最多1000个）
}

// 批量激活响应数据
export interface ActivationResponse {
  orderId: string
  totalCount: number // 总地址数
  successCount: number // 成功激活数
  failedCount: number // 失败数
  skippedCount: number // 跳过数（已激活）
  totalCost: number // 总费用（TRX）
  unitPrice: number // 单价（TRX）
  status: ActivationStatus
  createdAt: string
  completedAt?: string
}

// 激活订单详情
export interface ActivationOrderDetail extends ActivationResponse {
  userId: string
  addresses: ActivationAddressResult[] // 详细结果
  transactionHash?: string
  failedReason?: string
}

// 单个地址激活结果
export interface ActivationAddressResult {
  address: string
  status: 'success' | 'failed' | 'skipped'
  reason?: string // 失败或跳过原因
  cost: number // 费用
  transactionHash?: string
  activatedAt?: string
}

// 激活配置
export interface ActivationConfig {
  unitPrice: number // 单价（TRX）
  maxBatchSize: number // 最大批量数量
  minBalance: number // 最低余额要求
  tips: string[] // 提示信息
}

// 激活统计
export interface ActivationStats {
  totalActivated: number // 总激活数
  todayActivated: number // 今日激活数
  totalCost: number // 总费用
  todayCost: number // 今日费用
}

// 检查地址状态参数
export interface CheckAddressParams {
  addresses: string[]
}

// 地址状态信息
export interface AddressStatus {
  address: string
  isActivated: boolean // 是否已激活
  balance: number // 余额
  needActivation: boolean // 是否需要激活
}

// 检查地址状态响应
export interface CheckAddressResponse {
  results: AddressStatus[]
  needActivationCount: number // 需要激活的数量
  estimatedCost: number // 预估费用
}

// 预估费用参数
export interface EstimateCostParams {
  addressCount: number
}

// 预估费用响应
export interface EstimateCostResponse {
  addressCount: number
  unitPrice: number
  totalCost: number
  userBalance: number
  sufficient: boolean // 余额是否充足
}
