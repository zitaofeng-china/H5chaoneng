/**
 * 认证模块类型定义
 */

// 用户信息
export interface UserInfo {
  id: string
  username: string
  email: string
  telegram?: string
  balance: number
  trxBalance: number
  createdAt: string
  updatedAt?: string
}

// 登录请求参数
export interface LoginParams {
  username: string // 支持用户名或邮箱
  password: string
  rememberPassword?: boolean
}

// 登录响应数据
export interface LoginResponse {
  token: string
  refreshToken?: string
  userInfo: UserInfo
  expiresIn?: number
}

// 注册请求参数
export interface RegisterParams {
  username: string
  email: string
  password: string
  confirmPassword?: string
  telegram?: string
  inviteCode?: string
}

// 注册响应数据
export interface RegisterResponse {
  userId: string
  username: string
  email: string
  message: string
}

// 重置密码请求参数
export interface ResetPasswordParams {
  email: string
  code: string
  password: string
  confirmPassword?: string
}

// 修改密码请求参数
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
