import { describe, expect, it } from 'vitest'

import { formatCryptoAmount } from '@/utils/number'

describe('formatCryptoAmount', () => {
  it('formats TRX and USDT display values to two decimals', () => {
    expect(formatCryptoAmount('1992.466601')).toBe('1992.47')
    expect(formatCryptoAmount('74.567281')).toBe('74.57')
    expect(formatCryptoAmount(2)).toBe('2.00')
  })

  it('uses a safe zero value for invalid input', () => {
    expect(formatCryptoAmount(undefined)).toBe('0.00')
  })
})
