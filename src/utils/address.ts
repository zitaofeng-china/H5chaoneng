/**
 * 地址相关工具函数
 */

/**
 * 解析地址列表
 * 支持逗号、中文逗号、换行符分隔
 * @param input 输入的地址字符串
 * @returns 解析后的地址数组
 */
export function parseAddressList(input: string): string[] {
  if (!input || typeof input !== 'string') {
    return []
  }

  return input
    .split(/[,，\n\r]+/)
    .map(addr => addr.trim())
    .filter(addr => addr.length > 0)
}

/**
 * 验证 TRX 地址格式
 * @param address TRX 地址
 * @returns 是否有效
 */
export function isValidTrxAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  // TRX 地址以 T 开头，长度为 34
  return /^T[A-Za-z0-9]{33}$/.test(address)
}

/**
 * 格式化地址显示（中间省略）
 * @param address 完整地址
 * @param startLength 开头保留长度，默认 6
 * @param endLength 结尾保留长度，默认 4
 * @returns 格式化后的地址
 */
export function formatAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length <= startLength + endLength) {
    return address
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}
