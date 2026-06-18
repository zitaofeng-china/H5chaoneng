import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearAuthSession,
  clearRememberedLogin,
  getRememberedLogin,
  saveRememberedLogin,
} from '@/utils/session'
import { DEFAULT_SITE } from '@/utils/site'

describe('session utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores remembered username and password', () => {
    saveRememberedLogin('alice@example.com', 'pass123456')

    expect(getRememberedLogin()).toEqual({
      remember: true,
      username: 'alice@example.com',
      password: 'pass123456',
    })
    expect(localStorage.getItem('saved_password')).toBe('pass123456')
  })

  it('clears auth tokens but preserves remembered login by default', async () => {
    localStorage.setItem('tokens', JSON.stringify({ [DEFAULT_SITE]: 'token' }))
    localStorage.setItem('refresh_tokens', JSON.stringify({ [DEFAULT_SITE]: 'refresh' }))
    localStorage.setItem('user_infos', JSON.stringify({ [DEFAULT_SITE]: { id: 1 } }))
    localStorage.setItem('token_expired_at', JSON.stringify({ [DEFAULT_SITE]: Date.now() }))
    saveRememberedLogin('alice@example.com', 'pass123456')

    await clearAuthSession()

    expect(localStorage.getItem('tokens')).toBeNull()
    expect(localStorage.getItem('refresh_tokens')).toBeNull()
    expect(localStorage.getItem('user_infos')).toBeNull()
    expect(localStorage.getItem('token_expired_at')).toBeNull()
    expect(getRememberedLogin()).toEqual({
      remember: true,
      username: 'alice@example.com',
      password: 'pass123456',
    })
  })

  it('can clear remembered username and password explicitly', () => {
    saveRememberedLogin('alice@example.com', 'pass123456')

    clearRememberedLogin()

    expect(getRememberedLogin()).toBeNull()
    expect(localStorage.getItem('saved_password')).toBeNull()
  })
})
