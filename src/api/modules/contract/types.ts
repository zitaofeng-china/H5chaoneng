/**
 * 合约闪兑模块类型定义
 */

// 闪兑类型
export type FlashType = 'usdt-to-trx' | 'trx-to-usdt'

// 闪兑状态
export type FlashStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded'

// 合约闪兑请求参数
export interface ContractFlashParams {
  type: FlashType
  amount: number // 输入金额
  address: string // 接收地址
  estimatedGet?: number // 预计获得（前端计算）
}

// 合约闪兑响应数据
export interface ContractFlashResponse {
  orderId: string
  type: FlashType
  amount: number // 输入金额
  estimatedGet: number // 预计获得
  actualGet?: number // 实际获得（完成后）
  rate: number // 实时汇率
  fee: number // 手续费
  slippage: number // 滑点
  walletAddress: string // 闪兑钱包地址
  qrcode: string // 二维码
  status: FlashStatus
  expiresIn: number // 有效期（秒）
  createdAt: string
  updatedAt?: string
}

// 闪兑订单详情
export interface FlashOrderDetail extends ContractFlashResponse {
  userId: string
  fromAddress?: string // 付款地址
  toAddress: string // 接收地址
  transactionHash?: string // 交易哈希
  completedAt?: string // 完成时间
  failedReason?: string // 失败原因
}

// 实时汇率信息
export interface RateInfo {
  usdtToTrx: number // USDT → TRX 汇率
  trxToUsdt: number // TRX → USDT 汇率
  updateTime: string // 更新时间
  source: string // 数据来源
}

// 闪兑配置
export interface FlashConfig {
  usdtToTrx: {
    minAmount: number // 最小兑换额度
    maxAmount: number // 最大兑换额度
    fee: number // 手续费（TRX）
    tips: string[] // 提示信息
  }
  trxToUsdt: {
    minAmount: number
    maxAmount: number
    fee: number
    tips: string[]
  }
  slippageTolerance: number // 滑点容忍度
  expiresIn: number // 订单有效期（秒）
}

// 库存信息
export interface StockInfo {
  usdtStock: number // USDT 库存
  trxStock: number // TRX 库存
  updateTime: string
}

// 计算预估结果参数
export interface CalculateEstimateParams {
  type: FlashType
  amount: number
}

// 计算预估结果响应
export interface CalculateEstimateResponse {
  inputAmount: number // 输入金额
  outputAmount: number // 输出金额
  rate: number // 汇率
  fee: number // 手续费
  slippage: number // 预估滑点
  minReceive: number // 最少获得
}
