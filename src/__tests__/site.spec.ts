import { describe, expect, it } from 'vitest'
import { getSiteFromPath } from '@/utils/site'

describe('site helpers', () => {
  it('uses the first segment after the deployment base as Site', () => {
    expect(getSiteFromPath('/h5/3tQxQEH/hosting', '/h5/')).toBe('3tQxQEH')
    expect(getSiteFromPath('/platform/h5/3tQxQEH/hosting', '/platform/h5/')).toBe('3tQxQEH')
  })

  it('returns an empty Site when the URL has no segment after the deployment base', () => {
    expect(getSiteFromPath('/h5/', '/h5/')).toBe('')
  })

  it('returns an empty Site for reserved paths', () => {
    expect(getSiteFromPath('/h5/404', '/h5/')).toBe('')
  })

  it('uses the first URL segment for root deployment', () => {
    expect(getSiteFromPath('/3tQxQEH/hosting', '/')).toBe('3tQxQEH')
  })
})
