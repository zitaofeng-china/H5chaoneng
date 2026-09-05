import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  HASH_HEADER_OFFSET,
  cancelHashScroll,
  getHashHeaderOffset,
  hashToId,
  precedingSectionIds,
  scrollToRouteHash,
  waitForElement,
} from '@/utils/hashScroll'

describe('hashScroll helpers', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    cancelHashScroll()
    vi.restoreAllMocks()
  })

  it('parses hash ids and header offset', () => {
    expect(hashToId('#howItWorks')).toBe('howItWorks')
    expect(hashToId('feature')).toBe('feature')
    expect(getHashHeaderOffset('#howItWorks')).toBe(HASH_HEADER_OFFSET)
    expect(getHashHeaderOffset('#unknown')).toBe(0)
  })

  it('waits for preceding home sections so later blocks do not jump after insert', () => {
    expect(precedingSectionIds('#howItWorks')).toEqual(['energy', 'fee', 'howItWorks'])
    expect(precedingSectionIds('#question')).toEqual([
      'energy',
      'fee',
      'howItWorks',
      'feature',
      'question',
    ])
  })

  it('resolves waitForElement when the node is inserted later', async () => {
    const pending = waitForElement('howItWorks', 1000)
    const section = document.createElement('section')
    section.id = 'howItWorks'
    document.body.appendChild(section)
    await expect(pending).resolves.toBe(section)
  })

  it('scrolls to the target after async sections appear', async () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo

    const pending = scrollToRouteHash('#howItWorks', { behavior: 'auto' })

    for (const id of ['energy', 'fee', 'howItWorks']) {
      const el = document.createElement('section')
      el.id = id
      Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 200 })
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: id === 'howItWorks' ? 800 : 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })
      document.body.appendChild(el)
    }

    await expect(pending).resolves.toBe(true)
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        top: 800 - HASH_HEADER_OFFSET,
        behavior: 'auto',
      }),
    )
  })
})
