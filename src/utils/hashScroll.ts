/**
 * 首页锚点滚动。
 * 手续费 / 工作原理 / 特点 / FAQ 等是 defineAsyncComponent，
 * 从其他页面跳到首页 hash 时，元素往往还没进 DOM，必须等挂载后再滚。
 */

export const HASH_HEADER_OFFSET = 100

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
  return OFFSET_IDS.has(hashToId(hash)) ? HASH_HEADER_OFFSET : 0
}

export function precedingSectionIds(hash: string): string[] {
  const id = hashToId(hash)
  const index = (HOME_SECTION_IDS as readonly string[]).indexOf(id)
  if (index === -1) return id ? [id] : []
  return HOME_SECTION_IDS.slice(0, index + 1).map(String)
}

export function cancelHashScroll() {
  scrollGeneration += 1
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
  const needed = precedingSectionIds(hash)
  const behavior = options.behavior ?? 'smooth'
  const alreadyReady = allPresent(needed)

  if (!alreadyReady) {
    await Promise.all(needed.map((sectionId) => waitForElement(sectionId)))
  }

  if (gen !== scrollGeneration) return false

  const el = getById(id)
  if (!el) return false

  // 确保目标及上方区块完成布局与尺寸稳定，避免跳跃位置偏差
  await waitForLayoutSettle(el, alreadyReady ? 300 : 1500)
  if (gen !== scrollGeneration || !el.isConnected) return false

  const getTargetTop = () =>
    Math.max(0, el.getBoundingClientRect().top + window.scrollY - getHashHeaderOffset(hash))

  const top = getTargetTop()
  window.scrollTo({ top, left: 0, behavior })

  // 平滑滚动过程中若上方异步资源加载产生位置偏移，进行二次校准确保靶向锚点精确贴合
  if (behavior === 'smooth' && typeof window !== 'undefined') {
    window.setTimeout(() => {
      if (gen !== scrollGeneration || !el.isConnected) return
      const currentOffset = el.getBoundingClientRect().top
      const expectedOffset = getHashHeaderOffset(hash)
      if (Math.abs(currentOffset - expectedOffset) > 8) {
        window.scrollTo({ top: getTargetTop(), left: 0, behavior: 'smooth' })
      }
    }, 450)
  }

  return true
}
