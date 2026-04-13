/**
 * 用户模块类型定义
 */

// 充值请求参数
export interface RechargeParams {
  amount: number // 充值金额（TRX）
}

// 充值响应数据
export interface RechargeResponse {
  orderId: string
  amount: number
  address: string // 充值地址
  qrcode: string // 二维码
  expiresIn: number // 有效期（秒）
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

// 充值订单详情
export interface RechargeOrderDetail extends RechargeResponse {
  userId: string
  fromAddress?: string // 付款地址
  transactionHash?: string
  completedAt?: string
  failedReason?: string
}

// 余额信息
export interface BalanceInfo {
  trxBalance: number // TRX 余额
  usdtBalance: number // USDT 余额
  frozenBalance: number // 冻结余额
  availableBalance: number // 可用余额
  updateTime: string
}

// 交易记录类型
export type TransactionType =
  | 'recharge' // 充值
  | 'rental' // 租赁
  | 'flash' // 闪兑
  | 'hosting' // 托管
  | 'activation' // 激活
  | 'refund' // 退款
  | 'withdraw' // 提现

// 交易记录
export interface TransactionRecord {
  id: string
  type: TransactionType
  amount: number
  balance: number // 交易后余额
  status: 'pending' | 'success' | 'failed'
  description: string
  transactionHash?: string
  createdAt: string
}

// 用户统计信息
export interface UserStats {
  totalRecharge: number // 总充值
  totalSpent: number // 总消费
  totalOrders: number // 总订单数
  rentalCount: number // 租赁次数
  flashCount: number // 闪兑次数
  hostingCount: number // 托管地址数
  activationCount: number // 激活次数
}

// 提现请求参数
export interface WithdrawParams {
  amount: number
  address: string // 提现地址
  password: string // 支付密码
}

// 提现响应数据
export interface WithdrawResponse {
  orderId: string
  amount: number
  fee: number // 手续费
  actualAmount: number // 实际到账
  address: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  createdAt: string
}

// 设置支付密码参数
export interface SetPayPasswordParams {
  password: string
  confirmPassword: string
  verifyCode?: string // 验证码
}

// 修改支付密码参数
export interface ChangePayPasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 用户偏好设置
export interface UserPreferences {
  language: string // 语言
  currency: string // 货币
  notifications: {
    email: boolean
    telegram: boolean
  }
  theme: 'light' | 'dark' | 'auto'
}
