import type { BinancePriceResponse, TickerPriceApiResponse } from './types'

const TRX_USDT_TICKER_PRICE_URL = 'http://47.84.135.181:8888/v1/ticker/price?symbol=TRXUSDT'

/**
 * 获取 TRX/USDT 实时汇率
 */
export async function getTrxUsdtPrice(): Promise<BinancePriceResponse> {
  try {
    const response = await fetch(TRX_USDT_TICKER_PRICE_URL, {
      headers: {
        accept: 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Ticker API error: ${response.status}`)
    }
    
    const data = (await response.json()) as TickerPriceApiResponse
    const isSuccessCode = /^0+$/.test(String(data.code))
    if (!isSuccessCode || data.data === undefined || data.data === null || data.data === '') {
      throw new Error(data.msg || '获取 TRX/USDT 实时汇率失败')
    }

    const tickerPrice = {
      symbol: 'TRXUSDT',
      price: data.data,
    }
    console.log('[Ticker API] TRX/USDT 实时汇率:', tickerPrice)
    
    return tickerPrice
  } catch (error) {
    console.error('[Ticker API] 获取汇率失败:', error)
    throw error
  }
}
