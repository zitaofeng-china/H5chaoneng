import { afterEach, describe, expect, it } from 'vitest'
import { getSite, getSiteFromBase } from '@/utils/site'

describe('site helpers', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('uses the last non-empty deployment base segment as Site', () => {
    expect(getSiteFromBase('/h5/')).toBe('h5')
    expect(getSiteFromBase('/tenant/h5/')).toBe('h5')
  })

  it('returns an empty Site for root deployment', () => {
    expect(getSiteFromBase('/')).toBe('')
  })

  it('falls back to the URL path when the deployment base is root', () => {
    window.history.replaceState({}, '', '/demo/hosting')
    expect(getSite()).toBe('demo')
  })
})
