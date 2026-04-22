/**
 * 闪兑汇率 API 类型定义
 */

/**
 * 闪兑汇率数据
 */
export interface ExchangeRateData {
  updated_at: number // 更新时间戳
  price_trx: string // TRX价格
  price_usdt: string // USDT价格
  stock_trx: string // TRX库存
  stock_usdt: string // USDT库存
  max_usdt2trx: string // USDT→TRX最大交换额度
  max_trx2usdt: string // TRX→USDT最大交换额度
}
