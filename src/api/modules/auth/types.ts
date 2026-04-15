/**
 * 认证模块类型定义
 */

// 用户信息
export interface UserInfo {
  id: number // 用户ID
  created_at: number // 创建时间戳
  updated_at: number // 更新时间戳
  agent_id: number // 代理ID
  trx_balance: string // TRX 余额
  usdt_balance: number // USDT 余额
  address_list: string[] | null // 地址列表
  status: number // 状态：1-正常
  username: string // 用户名
  email: string // 邮箱
  site_id: number // 站点ID
  tg_user_id: number // Telegram 用户ID
  tg_user_name: string // Telegram 用户名
  tg_first_name: string // Telegram 名字
  lang: string // 语言：zh-CN, en, etc.
  bot_id: number // 机器人ID
  created_by: string // 创建者
}

// 登录请求参数
export interface LoginParams {
  code_id?: string // 验证码ID（可选）
  password: string // 密码
  username: string // 用户名
  verify_code?: string // 验证码（可选）
}

// 登录响应数据
export interface LoginResponse {
  token: string
  refreshToken?: string
  userInfo?: UserInfo
  expiresIn?: number
}

// 注册请求参数
export interface RegisterParams {
  username: string // 用户名
  email: string // 邮箱
  password: string // 密码
}

// 注册响应数据（后端返回空对象）
export interface RegisterResponse {
  // 注册成功后返回空对象
}

// 修改密码请求参数（登录后）
export interface ChangePasswordParams {
  password: string // 原密码
  new_password: string // 新密码
}

// 重置密码请求参数（忘记密码）
export interface ResetPasswordParams {
  email: string // 邮箱
  password: string // 新密码
  verify_code: string // 验证码
}

// 修改密码请求参数（旧接口）
export interface RevisePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword?: string
}

// 发送验证码请求参数
export interface SendCodeParams {
  email: string
  type: 'register' | 'reset' | 'verify'
}

// 发送验证码响应数据
export interface SendCodeResponse {
  success: boolean
  message: string
  expiresIn: number // 验证码有效期（秒）
}

// 验证 Token 响应
export interface VerifyTokenResponse {
  valid: boolean
  userInfo?: UserInfo
}

// 刷新 Token 请求参数
export interface RefreshTokenParams {
  refreshToken: string
}

// 刷新 Token 响应数据
export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

// 登出响应
export interface LogoutResponse {
  success: boolean
  message: string
}
