/**
 * 地址模块类型定义
 */

/**
 * 地址类别枚举
 */
export enum AddressKind {
  RECHARGE = 2, // 充值
  FLASH_EXCHANGE = 3, // 闪兑（USDT/TRX互换）
  FLASH_ENERGY_TRANSFER = 4, // 闪租能量-转账租赁
  COUNT_RENTAL = 5, // 按笔数租用（USDT购买）
  WELFARE_ORDER = 6, // 福利订单
  FLASH_ENERGY_BALANCE = 7, // 闪租能量-余额支付
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

/**
 * 托管地址项
 */
export interface HostingAddressItem {
  address: string // 托管地址
  agent_id: number // 代理ID
  bot_id: number // 机器人ID
  created_at: number // 创建时间（Unix时间戳，秒）
  id: number // 托管记录ID
  order_id: string // 订单ID
  origin: number // 来源
  updated_at: number // 更新时间（Unix时间戳，秒）
  user_id: number // 用户ID
  total?: number // 总使用次数（可选）
  today_total?: number // 今日使用次数（可选）
}

/**
 * 托管列表分页信息
 */
export interface HostingPager {
  current_page: number // 当前页码
  page_size: number // 每页条数
  total: number // 总记录数
}

/**
 * 托管列表响应数据
 */
export interface HostingListData {
  list: HostingAddressItem[] // 托管地址列表
  pager: HostingPager // 分页信息
}

/**
 * 获取托管列表请求参数
 */
export interface GetHostingListParams {
  limit: number // 查询条数
}

/**
 * 添加托管地址请求参数
 */
export interface AddHostingAddressParams {
  address: string[] // 托管地址数组
}

/**
 * 删除托管地址请求参数
 */
export interface DeleteHostingAddressParams {
  address: string // 托管地址
}
