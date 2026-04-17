/**
 * 币安 API 模块
 */

import type { BinancePriceResponse } from './types'

/**
 * 获取 TRX/USDT 实时汇率
 * 直接调用币安公开API，不需要认证
 */
export async function getTrxUsdtPrice(): Promise<BinancePriceResponse> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT')
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }
    
    const data: BinancePriceResponse = await response.json()
    console.log('[Binance API] TRX/USDT 实时汇率:', data)
    
    return data
  } catch (error) {
    console.error('[Binance API] 获取汇率失败:', error)
    throw error
  }
}
