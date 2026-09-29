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
  SendEmailCodeParams,
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
 * 发送邮箱验证码
 */
export function sendEmailCode(params: SendEmailCodeParams) {
  return post<{}>('/v3/captcha/email', params)
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
 * 获取接口密钥
 */
export function getSecretKey() {
  return get<string>('/v3/key')
}

/**
 * 刷新接口密钥
 */
export function refreshSecretKey() {
  return put<string>('/v3/key')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(params: Partial<UserInfo>) {
  return put<UserInfo>('/v3/user', params)
}
