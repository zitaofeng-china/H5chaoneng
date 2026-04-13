/**
 * 代理标识管理工具
 */

const AGENT_CODE_KEY = 'agent_code'
const ENCRYPT_KEY = 'GAS711_AGENT_SECRET_KEY_2026' // 加密密钥

/**
 * 简单加密函数（XOR + Base64）
 */
function encrypt(text: string): string {
  try {
    let encrypted = ''
    for (let i = 0; i < text.length; i++) {
      // XOR 加密
      const charCode = text.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length)
      encrypted += String.fromCharCode(charCode)
    }
    // Base64 编码
    return btoa(encrypted)
  } catch (error) {
    console.error('Encryption failed:', error)
    return text
  }
}

/**
 * 简单解密函数（Base64 + XOR）
 */
function decrypt(encryptedText: string): string {
  try {
    // Base64 解码
    const decoded = atob(encryptedText)
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      // XOR 解密
      const charCode = decoded.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length)
      decrypted += String.fromCharCode(charCode)
    }
    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}

/**
 * 保存代理标识到本地存储（加密保存）
 */
export function saveAgentCode(code: string): void {
  const encryptedCode = encrypt(code)
  localStorage.setItem(AGENT_CODE_KEY, encryptedCode)
}

/**
 * 从本地存储获取代理标识（自动解密）
 */
export function getAgentCode(): string | null {
  try {
    const encryptedCode = localStorage.getItem(AGENT_CODE_KEY)
    if (!encryptedCode) return null

    const decryptedCode = decrypt(encryptedCode)
    return decryptedCode || null
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
