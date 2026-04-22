/**
 * Token 管理工具
 * 支持多 Site 的 Token 存储
 */

import { getSite } from './site'
import type { UserInfo } from '@/api/modules/auth/types'

const TOKENS_KEY = 'tokens'
const REFRESH_TOKENS_KEY = 'refresh_tokens'
const USER_INFOS_KEY = 'user_infos'
const TOKEN_EXPIRED_AT_KEY = 'token_expired_at'

interface TokenStorage {
  [site: string]: string
}

interface UserInfoStorage {
  [site: string]: UserInfo
}

interface ExpiredAtStorage {
  [site: string]: number
}

function getAllTokens(): TokenStorage {
  const tokensStr = localStorage.getItem(TOKENS_KEY)
  if (!tokensStr) return {}
  try {
    return JSON.parse(tokensStr)
  } catch {
    return {}
  }
}

function saveAllTokens(tokens: TokenStorage): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

function getAllRefreshTokens(): TokenStorage {
  const tokensStr = localStorage.getItem(REFRESH_TOKENS_KEY)
  if (!tokensStr) return {}
  try {
    return JSON.parse(tokensStr)
  } catch {
    return {}
  }
}

function saveAllRefreshTokens(tokens: TokenStorage): void {
  localStorage.setItem(REFRESH_TOKENS_KEY, JSON.stringify(tokens))
}

function getAllUserInfos(): UserInfoStorage {
  const infosStr = localStorage.getItem(USER_INFOS_KEY)
  if (!infosStr) return {}
  try {
    return JSON.parse(infosStr)
  } catch {
    return {}
  }
}

function saveAllUserInfos(infos: UserInfoStorage): void {
  localStorage.setItem(USER_INFOS_KEY, JSON.stringify(infos))
}

function getAllExpiredAt(): ExpiredAtStorage {
  const expiredAtStr = localStorage.getItem(TOKEN_EXPIRED_AT_KEY)
  if (!expiredAtStr) return {}
  try {
    return JSON.parse(expiredAtStr)
  } catch {
    return {}
  }
}

function saveAllExpiredAt(expiredAt: ExpiredAtStorage): void {
  localStorage.setItem(TOKEN_EXPIRED_AT_KEY, JSON.stringify(expiredAt))
}

export function getToken(): string | null {
  const site = getSite()
  if (!site) return null
  return getAllTokens()[site] || null
}

export function setToken(token: string): void {
  const site = getSite()
  if (!site) return
  const tokens = getAllTokens()
  tokens[site] = token
  saveAllTokens(tokens)
}

export function removeToken(): void {
  const site = getSite()
  if (!site) return
  const tokens = getAllTokens()
  delete tokens[site]
  saveAllTokens(tokens)
}

export function getRefreshToken(): string | null {
  const site = getSite()
  if (!site) return null
  return getAllRefreshTokens()[site] || null
}

export function setRefreshToken(token: string): void {
  const site = getSite()
  if (!site) return
  const tokens = getAllRefreshTokens()
  tokens[site] = token
  saveAllRefreshTokens(tokens)
}

export function removeRefreshToken(): void {
  const site = getSite()
  if (!site) return
  const tokens = getAllRefreshTokens()
  delete tokens[site]
  saveAllRefreshTokens(tokens)
}

export function getUserInfo(): UserInfo | null {
  const site = getSite()
  if (!site) return null
  return getAllUserInfos()[site] || null
}

export function setUserInfo(userInfo: UserInfo): void {
  const site = getSite()
  if (!site) return
  const infos = getAllUserInfos()
  infos[site] = userInfo
  saveAllUserInfos(infos)
}

export function removeUserInfo(): void {
  const site = getSite()
  if (!site) return
  const infos = getAllUserInfos()
  delete infos[site]
  saveAllUserInfos(infos)
}

export function getTokenExpiredAt(): number | null {
  const site = getSite()
  if (!site) return null
  return getAllExpiredAt()[site] || null
}

export function setTokenExpiredAt(expiredAt: number): void {
  const site = getSite()
  if (!site) return
  const expiredAtMap = getAllExpiredAt()
  expiredAtMap[site] = expiredAt
  saveAllExpiredAt(expiredAtMap)
}

export function removeTokenExpiredAt(): void {
  const site = getSite()
  if (!site) return
  const expiredAtMap = getAllExpiredAt()
  delete expiredAtMap[site]
  saveAllExpiredAt(expiredAtMap)
}

export function isTokenExpired(): boolean {
  const expiredAt = getTokenExpiredAt()
  if (!expiredAt) return false
  
  // expiredAt 是毫秒时间戳
  return Date.now() >= expiredAt
}

export function clearAllTokens(): void {
  localStorage.removeItem(TOKENS_KEY)
  localStorage.removeItem(REFRESH_TOKENS_KEY)
  localStorage.removeItem(USER_INFOS_KEY)
  localStorage.removeItem(TOKEN_EXPIRED_AT_KEY)
}

export function hasToken(): boolean {
  return !!getToken()
}

