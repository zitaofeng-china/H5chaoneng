import { get } from '@/api/request'
import type { BinancePriceResponse } from './types'

/**
 * 获取 TRX/USDT 实时汇率
 */
export async function getTrxUsdtPrice(): Promise<BinancePriceResponse> {
  try {
    const response = await get<string>('/v1/ticker/price', { symbol: 'TRXUSDT' })

    if (response.code !== '000000' || response.data === undefined || response.data === null || response.data === '') {
      throw new Error(response.msg || '获取 TRX/USDT 实时汇率失败')
    }

    const tickerPrice = {
      symbol: 'TRXUSDT',
      price: response.data,
    }
    console.log('[Ticker API] TRX/USDT 实时汇率:', tickerPrice)
    
    return tickerPrice
  } catch (error) {
    console.error('[Ticker API] 获取汇率失败:', error)
    throw error
  }
}
