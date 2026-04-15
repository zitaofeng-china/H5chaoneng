/**
 * Site 模块类型定义
 */

// Site 信息
export interface SiteInfo {
  id: number
  created_at: number // 创建时间戳
  updated_at: number // 更新时间戳
  name: string // Site 名称
  price_id: number // 价格 ID
  agent_id: number // 代理 ID
  status: number // 状态
  tg_admin: string // Telegram 管理员
  describe: string // 描述
}
