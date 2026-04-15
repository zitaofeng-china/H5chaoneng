/**
 * 地址模块类型定义
 */

/**
 * 地址类别枚举
 */
export enum AddressKind {
  COUNT_RENTAL = 9, // 按笔数租用
  // 可以根据需要添加其他类别
}

/**
 * 获取付款地址请求参数
 */
export interface GetAddressParams {
  kind: AddressKind | number // 地址类别
}

/**
 * 付款地址数据
 */
export interface AddressData {
  address: string // 付款地址
  agent_id: number // 代理ID
  bot_id: number // 机器人ID
  created_at: string // 创建时间
  created_by: string // 创建者
  id: number // 地址ID
  kind: number // 地址类别
  site_id: number // 站点ID
  updated_at: string // 更新时间
}
