import { removeRefreshToken, removeToken, removeTokenExpiredAt, removeUserInfo } from './token'
import { useUserStore } from '@/stores/useUserStore'

const REMEMBER_LOGIN_KEY = 'remember_password'
const SAVED_USERNAME_KEY = 'saved_username'
const SAVED_PASSWORD_KEY = 'saved_password'

export interface RememberedLogin {
  remember: boolean
  username: string
  password: string
}

function getStorage(): Storage | null {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }

  return globalThis.localStorage
}

export function getRememberedLogin(): RememberedLogin | null {
  const storage = getStorage()
  if (!storage || storage.getItem(REMEMBER_LOGIN_KEY) !== 'true') {
    return null
  }

  return {
    remember: true,
    username: storage.getItem(SAVED_USERNAME_KEY) || '',
    password: storage.getItem(SAVED_PASSWORD_KEY) || '',
  }
}

export function saveRememberedLogin(username: string, password: string): void {
  const storage = getStorage()
  if (!storage) return

  storage.setItem(REMEMBER_LOGIN_KEY, 'true')
  storage.setItem(SAVED_USERNAME_KEY, username)
  storage.setItem(SAVED_PASSWORD_KEY, password)
}

export function clearRememberedLogin(): void {
  const storage = getStorage()
  if (!storage) return

  storage.removeItem(REMEMBER_LOGIN_KEY)
  storage.removeItem(SAVED_USERNAME_KEY)
  storage.removeItem(SAVED_PASSWORD_KEY)
}

export async function resetUserSessionState(): Promise<void> {
  try {
    const userStore = useUserStore()
    userStore.token = ''
    userStore.userInfo = null
  } catch {
    // Swallow store reset errors so auth cleanup never fails mid-flight.
  }
}

export async function clearAuthSession(options?: {
  clearRememberedLogin?: boolean
}): Promise<void> {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
  removeTokenExpiredAt()

  if (options?.clearRememberedLogin) {
    clearRememberedLogin()
  }

  resetUserSessionState()
}
