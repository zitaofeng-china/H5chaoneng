/**
 * 认证模块 API
 */

import { post, get } from '@/api/request'
import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
  ResetPasswordParams,
  RevisePasswordParams,
  SendCodeParams,
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
  return post<LoginResponse>('/auth/login', params)
}

/**
 * 用户注册
 */
export function register(params: RegisterParams) {
  return post<RegisterResponse>('/auth/register', params)
}

/**
 * 重置密码
 */
export function resetPassword(params: ResetPasswordParams) {
  return post<{ success: boolean; message: string }>('/auth/reset-password', params)
}

/**
 * 修改密码
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
  return post<LogoutResponse>('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getUserInfo() {
  return get<UserInfo>('/auth/user-info')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(params: Partial<UserInfo>) {
  return post<UserInfo>('/auth/update-user-info', params)
}
