/**
 * 代理标识管理工具
 * 注意：代理标识（X-Agent-Code）与 Site 是同一个值
 * 统一使用 @/utils/site 中的 getSite() 获取
 */

import { getSite, clearSite } from './site'

/**
 * 保存代理标识（实际上是保存 Site）
 * 注意：现在 Site 一直在 URL 中，不需要单独保存
 * 这个函数保留是为了兼容性，但实际上不做任何操作
 */
export function saveAgentCode(code: string): void {
  console.log('[Invite] saveAgentCode 被调用，但 Site 已在 URL 中，无需保存:', code)
  // 不需要保存，Site 一直在 URL 中
}

/**
 * 获取代理标识（实际上是获取 Site）
 */
export function getAgentCode(): string {
  return getSite()
}

/**
 * 清除代理标识（实际上是清除 Site）
 */
export function clearAgentCode(): void {
  clearSite()
}

/**
 * 检查是否有有效的代理标识
 */
export function hasValidAgentCode(): boolean {
  return getAgentCode() !== null && getAgentCode() !== ''
}


