/**
 * 代理标识管理工具
 */

const AGENT_CODE_KEY = 'agent_code'

/**
 * 保存代理标识到本地存储（明文保存）
 */
export function saveAgentCode(code: string): void {
  localStorage.setItem(AGENT_CODE_KEY, code)
}

/**
 * 从本地存储获取代理标识
 */
export function getAgentCode(): string | null {
  try {
    return localStorage.getItem(AGENT_CODE_KEY)
  } catch (error) {
    console.error('Failed to get agent code:', error)
    return null
  }
}

/**
 * 清除代理标识
 */
export function clearAgentCode(): void {
  localStorage.removeItem(AGENT_CODE_KEY)
}

/**
 * 检查是否有有效的代理标识
 */
export function hasValidAgentCode(): boolean {
  return getAgentCode() !== null
}
