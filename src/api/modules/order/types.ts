/**
 * 订单模块类型定义
 */

/**
 * 订单类型枚举
 */
export enum OrderKind {
  KindAgentDeposit = 1,      // 代理充值（地址由运营户户管理）
  KindUserDeposit = 2,       // 用户充值
  KindExchange = 3,          // 兑换（TRX-USDT）
  KindTimeEnergy = 4,        // 时间能量（闪租能量，1小时有效的）
  KindStrokeEnergy = 5,      // 笔数能量（长期有效的，每天不用额外扣一笔，一次发放两笔，用完再补）
  KindWealEnergy = 6,        // 福利能量（打折的时间能量，有购买限制）
  KindFlashEnergy = 7,       // 快速能量（快速租用，1小时有效的，用户会提前回收）
  KindHosting = 8,           // 托管（一次发放两笔）
  KindBatchEnergy = 9,       // 批量能量（带自动激活）
  KindBatchActive = 10,      // 批量激活
  KindBotFee = 11,           // 机器人付费
}

/**
 * 创建订单请求参数
 */
export interface CreateOrderParams {
  count?: number              // 数量（托管时可不传）
  duration?: number           // 时长（秒数，按笔数租用/托管时可不传）
  kind: OrderKind | number    // 订单类型
  target: string[]            // 目标地址列表
  user_id: number             // 用户ID
}
