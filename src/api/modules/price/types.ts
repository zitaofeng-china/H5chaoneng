/**
 * 价格模块类型定义
 */

export interface PriceData {
  // 元数据字段
  id: number // 价格表ID
  created_at: number // 创建时间戳
  updated_at: number // 更新时间戳
  name: string // 名称
  agent_id: number // 代理ID
  
  // 激活价格
  active: string // 激活价格（如 "2.6"）
  
  // 能量租赁价格（按时长，单位：TRX）
  time_1h: string // 1小时租赁单价（如 "7"）
  time_1d: string // 1天租赁单价（如 "10"）
  time_3d: string // 3天租赁单价（如 "13"）
  time_7d: string // 7天租赁单价（如 "16"）
  time_15d: string // 15天租赁单价（如 "20"）
  time_30d: string // 30天租赁单价（如 "28"）
  
  // 其他服务价格（单位：TRX）
  stroke: string // 按笔租赁单价（如 "3.7"）
  stroke_usdt: string // 按笔租赁USDT单价（如 "11"）
  flash: string // 闪兑手续费（如 "2.9"）
  weal: string // 福利价格（如 "2"）
  hosting_65k: string // 65K能量托管价格（如 "2.8"）
  hosting_131k: string // 131K能量托管价格（如 "4.8"）
  batch_flash: string // 批量闪兑价格（如 "3"）
  
  // 汇率
  trx_2_usdt: string // TRX兑换USDT汇率（如 "0.04"）
  usdt_2_trx: string // USDT兑换TRX汇率（如 "0.06"）
  
  // 限额
  min_trx_balance: string // 最小TRX余额（如 "1500"）
  max_usdt_2_trx: string // USDT转TRX最大额度（如 "10000"）
  max_trx_2_usdt: string // TRX转USDT最大额度（如 "30000"）
}