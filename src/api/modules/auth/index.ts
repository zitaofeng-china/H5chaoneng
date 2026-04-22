/**
 * 认证模块 API
 */

import { post, get, put } from '@/api/request'
import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
  ResetPasswordParams,
  RevisePasswordParams,
  SendCodeParams,
  SendEmailCodeParams,
  SendCodeResponse,
  VerifyTokenResponse,
  RefreshTokenParams,
  RefreshTokenResponse,
  LogoutResponse,
  UserInfo,
} from './types'

/**
 * 用户登录
 */
export function login(params: LoginParams) {
  return post<LoginResponse>('/v3/login', params)
}

/**
 * 用户登录（简化版，自动填充 Site）
 */
export function loginSimple(data: LoginParams) {
  return login(data)
}

/**
 * 用户注册
 */
export function register(params: RegisterParams) {
  return post<RegisterResponse>('/v3/register', params)
}

/**
 * 修改密码（登录后，需要原密码）
 */
export function changePassword(params: { password: string; new_password: string }) {
  return post<{}>('/v3/change_password', params)
}

/**
 * 重置密码（忘记密码，需要验证码）
 */
export function resetPassword(params: ResetPasswordParams) {
  return post<{}>('/v3/reset_password', params)
}

/**
 * 修改密码（旧接口，保留兼容）
 */
export function revisePassword(params: RevisePasswordParams) {
  return post<{ success: boolean; message: string }>('/auth/revise-password', params)
}

/**
 * 发送验证码
 */
export function sendCode(params: SendCodeParams) {
  return post<SendCodeResponse>('/auth/send-code', params)
}

/**
 * 发送邮箱验证码
 */
export function sendEmailCode(params: SendEmailCodeParams) {
  return post<{}>('/v3/captcha/email', params)
}

/**
 * 验证 Token
 */
export function verifyToken() {
  return get<VerifyTokenResponse>('/auth/verify-token')
}

/**
 * 刷新 Token
 */
export function refreshToken(params: RefreshTokenParams) {
  return post<RefreshTokenResponse>('/auth/refresh-token', params)
}

/**
 * 用户登出
 */
export function logout() {
  return post<LogoutResponse>('/v3/logout')
}

/**
 * 获取当前用户信息
 */
export function getUserInfo() {
  return get<UserInfo>('/v3/user')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(params: Partial<UserInfo>) {
  return put<UserInfo>('/v3/user', params)
}
