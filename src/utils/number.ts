/**
 * 格式化 TRX/USDT 的用户可见金额。
 */
export function formatCryptoAmount(value: string | number | null | undefined): string {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

export const formatBalance = formatCryptoAmount
