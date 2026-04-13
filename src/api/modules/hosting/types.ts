/**
 * 智能托管模块类型定义
 */

// 托管状态
export type HostingStatus = 'active' | 'inactive' | 'paused' | 'expired'

// 能量规格
export type EnergySpec = '65000' | '131000'

// 添加托管请求参数
export interface AddHostingParams {
  addresses: string[] // 需要托管的地址列表
  energySpec?: EnergySpec // 能量规格，默认 131000
}

// 托管地址信息
export interface HostingAddress {
  id: string
  address: string
  energySpec: EnergySpec // 能量规格
  currentEnergy: number // 当前能量
  targetEnergy: number // 目标能量
  historyUsed: number // 历史已用笔数
  todayUsed: number // 今天已用笔数
  totalCost: number // 总费用（TRX）
  status: HostingStatus
  lastChargeAt?: string // 最后充能时间
  lastTransferAt?: string // 最后转账时间
  createdAt: string
  updatedAt?: string
}

// 托管配置
export interface HostingConfig {
  minBalance: number // 最低余额要求（TRX）
  energySpecs: Array<{
    spec: EnergySpec
    energy: number // 能量数量
    pricePerCharge: number // 每次充能价格（TRX）
  }>
  autoChargeInterval: number // 自动充能间隔（小时）
  tips: string[] // 提示信息
}

// 托管统计信息
export interface HostingStats {
  totalAddresses: number // 总托管地址数
  activeAddresses: number // 活跃地址数
  totalUsed: number // 总使用笔数
  todayUsed: number // 今日使用笔数
  totalCost: number // 总费用（TRX）
  todayCost: number // 今日费用（TRX）
}

// 托管记录
export interface HostingRecord {
  id: string
  addressId: string
  address: string
  type: 'charge' | 'transfer' | 'deduct' // 充能/转账/扣费
  energy: number // 能量变化
  cost: number // 费用（TRX）
  balance: number // 余额
  transactionHash?: string
  createdAt: string
}

// 删除托管参数
export interface DeleteHostingParams {
  addressIds: string[] // 要删除的地址 ID 列表
}

// 更新托管参数
export interface UpdateHostingParams {
  addressId: string
  energySpec?: EnergySpec // 更新能量规格
  status?: HostingStatus // 更新状态
}

// 批量操作响应
export interface BatchOperationResponse {
  successCount: number
  failedCount: number
  failedAddresses: Array<{
    address: string
    reason: string
  }>
}
