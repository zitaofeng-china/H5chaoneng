/**
 * 币安 API 类型定义
 */

/**
 * 币安价格响应
 */
export interface BinancePriceResponse {
  symbol: string // 交易对符号，如 "TRXUSDT"
  price: string // 价格，如 "0.24850000"
}
