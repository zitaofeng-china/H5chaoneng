/**
 * 行情价格响应
 */
export interface BinancePriceResponse {
  symbol: string // 交易对符号，如 "TRXUSDT"
  price: string // 价格，如 "0.24850000"
}

export interface TickerPriceApiResponse {
  code: string
  data: string
  msg: string
}
