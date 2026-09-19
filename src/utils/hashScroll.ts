/**
 * 首页锚点滚动。
 * 手续费 / 工作原理 / 特点 / FAQ 等是 defineAsyncComponent，
 * 从其他页面跳到首页 hash 时，元素往往还没进 DOM，必须等挂载后再滚。
 */

export const HASH_HEADER_OFFSET = 50

export const HOME_SECTION_IDS = [
  'energy',
  'fee',
  'howItWorks',
  'feature',
  'question',
  'contact',
] as const

const OFFSET_IDS = new Set<string>(HOME_SECTION_IDS)

let scrollGeneration = 0
let activeAnchorTarget = ''
let anchorNavTimer = 0

export type HashScrollOptions = {
  behavior?: ScrollBehavior
}

export function hashToId(hash: string): string {
  if (!hash) return ''
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function getHashHeaderOffset(hash: string): number {
  if (!OFFSET_IDS.has(hashToId(hash))) return 0
  if (typeof document !== 'undefined') {
    const navbar = document.querySelector<HTMLElement>('.navbar')
    if (navbar && navbar.offsetHeight > 0) {
      return navbar.offsetHeight
    }
  }
  return HASH_HEADER_OFFSET
}

export function precedingSectionIds(hash: string): string[] {
  const id = hashToId(hash)
  const index = (HOME_SECTION_IDS as readonly string[]).indexOf(id)
  if (index === -1) return id ? [id] : []
  return HOME_SECTION_IDS.slice(0, index + 1).map(String)
}

export function setAnchorNavigating(targetId: string) {
  activeAnchorTarget = targetId
  if (typeof window !== 'undefined') {
    window.clearTimeout(anchorNavTimer)
    anchorNavTimer = window.setTimeout(() => {
      if (activeAnchorTarget === targetId) {
        activeAnchorTarget = ''
      }
    }, 1200)
  }
}

export function clearAnchorNavigating() {
  activeAnchorTarget = ''
  if (typeof window !== 'undefined') {
    window.clearTimeout(anchorNavTimer)
  }
}

export function getActiveAnchorTarget(): string {
  return activeAnchorTarget
}

export function isAnchorNavigatingPast(sectionId: string): boolean {
  if (!activeAnchorTarget) return false
  const targetIndex = (HOME_SECTION_IDS as readonly string[]).indexOf(activeAnchorTarget as (typeof HOME_SECTION_IDS)[number])
  const currentIndex = (HOME_SECTION_IDS as readonly string[]).indexOf(sectionId as (typeof HOME_SECTION_IDS)[number])
  if (targetIndex === -1 || currentIndex === -1) return false
  return targetIndex > currentIndex
}

export function cancelHashScroll() {
  scrollGeneration += 1
  clearAnchorNavigating()
}

function getById(id: string): HTMLElement | null {
  if (!id || typeof document === 'undefined') return null
  return document.getElementById(id)
}

export function waitForElement(id: string, timeoutMs = 6000): Promise<HTMLElement | null> {
  const existing = getById(id)
  if (existing) return Promise.resolve(existing)
  if (typeof document === 'undefined' || !document.body) return Promise.resolve(null)

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const el = getById(id)
      if (!el) return
      cleanup()
      resolve(el)
    })

    const timer = window.setTimeout(() => {
      cleanup()
      resolve(getById(id))
    }, timeoutMs)

    function cleanup() {
      observer.disconnect()
      window.clearTimeout(timer)
    }

    observer.observe(document.body, { childList: true, subtree: true })
  })
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      resolve()
      return
    }
    requestAnimationFrame(() => resolve())
  })
}

export function waitForLayoutSettle(el: HTMLElement, timeoutMs = 1500): Promise<void> {
  return new Promise((resolve) => {
    if (!el.isConnected) {
      resolve()
      return
    }

    const documentY = () => el.getBoundingClientRect().top + window.scrollY
    let lastY = documentY()
    let lastH = el.offsetHeight
    let stableAt = performance.now()
    const started = performance.now()
    const stableMs = 120

    const tick = () => {
      if (!el.isConnected) {
        resolve()
        return
      }

      const y = documentY()
      const h = el.offsetHeight
      const now = performance.now()

      if (Math.abs(y - lastY) < 1 && Math.abs(h - lastH) < 1) {
        if (now - stableAt >= stableMs) {
          resolve()
          return
        }
      } else {
        lastY = y
        lastH = h
        stableAt = now
      }

      if (now - started >= timeoutMs) {
        resolve()
        return
      }

      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  })
}

function allPresent(ids: string[]): boolean {
  return ids.every((id) => Boolean(getById(id)))
}

export async function scrollToRouteHash(
  hash: string,
  options: HashScrollOptions = {},
): Promise<boolean> {
  const id = hashToId(hash)
  if (!id) return false

  const gen = ++scrollGeneration
  setAnchorNavigating(id)

  const needed = precedingSectionIds(hash)
  const behavior = options.behavior ?? 'smooth'
  const alreadyReady = allPresent(needed)

  if (!alreadyReady) {
    await Promise.all(needed.map((sectionId) => waitForElement(sectionId)))
  }

  if (gen !== scrollGeneration) {
    clearAnchorNavigating()
    return false
  }

  const el = getById(id)
  if (!el) {
    clearAnchorNavigating()
    return false
  }

  if (!alreadyReady) {
    await waitForLayoutSettle(el)
    if (gen !== scrollGeneration || !el.isConnected) {
      clearAnchorNavigating()
      return false
    }
  } else {
    await nextFrame()
    if (gen !== scrollGeneration) {
      clearAnchorNavigating()
      return false
    }
  }

  const offset = getHashHeaderOffset(hash)
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset)
  window.scrollTo({ top, left: 0, behavior })

  const settleDuration = behavior === 'smooth' ? 600 : 50
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      if (gen === scrollGeneration) {
        clearAnchorNavigating()
      }
    }, settleDuration)
  }

  return true
}
