<template>
  <section
    v-if="showBanner"
    class="ad-banner"
    :class="{
      'is-miniapp': isMiniApp && !useCoverflow,
      'is-coverflow': useCoverflow,
    }"
    aria-label="广告"
  >
    <div
      ref="carouselRef"
      class="ad-carousel"
      :class="{
        'is-dragging': isDragging,
        'is-instant': instantSwitch,
        'is-orbiting': isOrbiting,
      }"
      tabindex="0"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
      @click="handleCarouselClick"
      @keydown="handleKeydown"
      @dragstart.prevent
      @mouseenter="pauseRotation"
      @mouseleave="resumeRotation"
    >
      <div class="ad-stage">
        <div class="ad-stage__sizer" aria-hidden="true"></div>
        <div class="ad-slides">
          <component
            :is="ad.link_url ? 'a' : 'div'"
            v-for="(ad, index) in displayAds"
            :key="getAdKey(ad, index)"
            class="ad-slide"
            :class="{
              'is-active': index === activeIndex,
              'is-link': Boolean(ad.link_url) && index === activeIndex,
            }"
            :style="getSlideStyle(index)"
            :href="ad.link_url && index === activeIndex ? resolveUrl(ad.link_url) : undefined"
            :target="ad.link_url && index === activeIndex ? '_blank' : undefined"
            :rel="ad.link_url && index === activeIndex ? 'noopener noreferrer' : undefined"
            :data-index="index"
            :tabindex="ad.link_url && index === activeIndex ? 0 : -1"
            :aria-hidden="index !== activeIndex"
            draggable="false"
            @click="handleSlideClick($event, index, ad)"
            @keydown.enter.prevent="handleSlideClick($event, index, ad)"
            @dragstart.prevent
          >
            <img
              class="ad-image"
              :src="resolveUrl(ad.image_url)"
              alt=""
              draggable="false"
              @error="handleImageError(ad)"
            />
          </component>
        </div>
      </div>

      <template v-if="displayAds.length > 1">
        <div v-if="useCoverflow" class="ad-controls">
          <div class="ad-track" aria-hidden="true">
            <span
              v-for="copy in [-1, 0, 1]"
              :key="copy"
              class="ad-track__fill"
              :class="{ 'is-instant': trackInstant }"
              :style="getTrackFillStyle(copy)"
            ></span>
          </div>
        </div>

        <div v-else class="ad-dots" role="tablist" aria-label="广告切换">
          <button
            v-for="(ad, index) in displayAds"
            :key="getAdKey(ad, index)"
            class="ad-dot"
            :class="{ 'is-active': index === activeIndex }"
            type="button"
            :aria-label="`切换到第 ${index + 1} 个广告`"
            :aria-selected="index === activeIndex"
            role="tab"
            @click="selectAd(index)"
          ></button>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { adApi } from '@/api'
import type { AdItem } from '@/api/modules/ad/types'
import { getTelegramWebApp, isMiniAppRuntime } from '@/utils/telegram'

let cachedAds: AdItem[] | null = null

defineOptions({
  name: 'AdBanner',
})

const emit = defineEmits<{
  'update:hasAd': [value: boolean]
}>()

const ads = ref<AdItem[]>(cachedAds ?? [])
const activeIndex = ref(0)
const loaded = ref(Boolean(cachedAds))
const failedImages = ref(new Set<string>())
const carouselRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isOrbiting = ref(false)
const suppressClick = ref(false)
const dragProgress = ref(0)
const visualIndex = ref(0)
const trackIndex = ref(0)
const trackInstant = ref(false)
const prefersReducedMotion = ref(false)
const isMiniApp = computed(() => isMiniAppRuntime())
const useCoverflow = computed(
  () => !prefersReducedMotion.value && displayAds.value.length > 0,
)
const instantSwitch = computed(() => !useCoverflow.value)
let pointerStartX = 0
let pointerStartY = 0
let pointerId: number | null = null
let dragOriginVisual = 0
let rotationPaused = false
let rotationTimer: ReturnType<typeof setInterval> | undefined
let trackSnapTimer: ReturnType<typeof setTimeout> | undefined
let orbitRaf = 0
let motionQuery: MediaQueryList | null = null
const ROTATION_MS = 6500
const TRACK_WRAP_MS = 460
const ORBIT_MS = 620

const displayAds = computed(() =>
  ads.value.filter((ad) => Boolean(ad.image_url) && !failedImages.value.has(String(ad.id))),
)
const showBanner = computed(() => displayAds.value.length > 0)

function emitHasAd() {
  if (!loaded.value) return
  emit('update:hasAd', showBanner.value)
}

watch(displayAds, (list) => {
  stopOrbit()
  if (activeIndex.value >= list.length) {
    activeIndex.value = 0
  }
  visualIndex.value = activeIndex.value
  snapTrackIndex(activeIndex.value)
  emitHasAd()
  if (list.length < 2) stopRotation()
})

if (loaded.value) emitHasAd()

function isEnabled(ad: AdItem): boolean {
  const status = ad.status
  return status === undefined || status === null || status === true || String(status) === '1'
}

function getSortValue(ad: AdItem): number {
  const value = Number(ad.sort)
  return Number.isFinite(value) ? value : 0
}

function normalizeAds(data: unknown): AdItem[] {
  if (!Array.isArray(data)) return []

  return data
    .filter((item): item is AdItem => Boolean(item && typeof item === 'object'))
    .filter(isEnabled)
    .sort((left, right) => getSortValue(left) - getSortValue(right))
}

function resolveUrl(value: string): string {
  if (!value) return ''

  try {
    return new URL(value, window.location.origin).toString()
  } catch {
    return value
  }
}

function getAdKey(ad: AdItem, index: number): string {
  return `${String(ad.id)}-${index}`
}

function wrapOffset(offset: number, total: number): number {
  if (total <= 0) return 0
  const half = total / 2
  while (offset > half) offset -= total
  while (offset < -half) offset += total
  return offset
}

function easeCoverflow(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 1 - (1 - t) ** 4
}

function getCoverflowMetrics() {
  const banner = carouselRef.value?.closest('.ad-banner')
  if (banner) {
    const cs = getComputedStyle(banner)
    const shift = parseFloat(cs.getPropertyValue('--ad-shift'))
    const tilt = parseFloat(cs.getPropertyValue('--ad-tilt'))
    const depth = parseFloat(cs.getPropertyValue('--ad-depth'))
    if (Number.isFinite(shift) && Number.isFinite(tilt) && Number.isFinite(depth)) {
      return { shift, tilt, depth }
    }
  }

  const mobile = window.matchMedia('(max-width: 768px)').matches
  return mobile
    ? { shift: 56, tilt: -28, depth: -72 }
    : { shift: 70, tilt: -36, depth: -120 }
}

function getCoverflowTransform(offset: number, shift: number, tilt: number, depth: number): string {
  const abs = Math.abs(offset)
  const unit = Math.floor(abs)
  const frac = abs - unit
  const angle = frac * (Math.PI / 2)
  const xPct = offset * shift
  const zPx = (unit + (1 - Math.cos(angle))) * depth
  const rot = offset * tilt
  const scale = 1 - Math.min(abs, 2) * 0.06

  return `translate(-50%, -50%) translateX(${xPct}%) rotateY(${rot}deg) translateZ(${zPx}px) scale(${scale})`
}

function getSlideStyle(index: number): Record<string, string> | undefined {
  if (!useCoverflow.value) return undefined

  const total = displayAds.value.length
  const offset = wrapOffset(index - visualIndex.value, total)
  const abs = Math.abs(offset)
  const hidden = abs > 1.45
  const { shift, tilt, depth } = getCoverflowMetrics()

  return {
    '--ad-offset': String(offset),
    '--ad-abs': String(abs),
    transform: getCoverflowTransform(offset, shift, tilt, depth),
    zIndex: String(Math.round(24 - abs * 6)),
    opacity: hidden ? '0' : '1',
    pointerEvents: hidden ? 'none' : 'auto',
    visibility: hidden ? 'hidden' : 'visible',
  }
}

function stopOrbit() {
  if (orbitRaf) {
    cancelAnimationFrame(orbitRaf)
    orbitRaf = 0
  }
  isOrbiting.value = false
}

function animateVisualTo(target: number) {
  const total = displayAds.value.length
  const next = moduloIndex(target, total)

  if (total < 2 || !useCoverflow.value) {
    visualIndex.value = next
    return
  }

  stopOrbit()

  const from = visualIndex.value
  let step = next - from
  while (step > total / 2) step -= total
  while (step < -total / 2) step += total

  if (Math.abs(step) < 0.001) {
    visualIndex.value = next
    return
  }

  const to = from + step
  const duration = Math.max(280, Math.min(ORBIT_MS, ORBIT_MS * Math.abs(step)))
  const start = performance.now()
  isOrbiting.value = true

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    visualIndex.value = from + (to - from) * easeCoverflow(t)
    if (t < 1) {
      orbitRaf = requestAnimationFrame(tick)
      return
    }
    orbitRaf = 0
    isOrbiting.value = false
    const snapped = moduloIndex(Math.round(to), total)
    if (snapped !== visualIndex.value) {
      trackInstant.value = true
      visualIndex.value = snapped
      requestAnimationFrame(() => {
        trackInstant.value = false
      })
    } else {
      visualIndex.value = snapped
    }
  }

  orbitRaf = requestAnimationFrame(tick)
}

function getTrackFillStyle(copy: number): Record<string, string> {
  const total = displayAds.value.length || 1
  const position = trackIndex.value - dragProgress.value + copy * total

  return {
    width: `${100 / total}%`,
    transform: `translateX(${position * 100}%)`,
  }
}

function clearTrackSnap() {
  if (trackSnapTimer) {
    clearTimeout(trackSnapTimer)
    trackSnapTimer = undefined
  }
}

function snapTrackIndex(index = activeIndex.value) {
  const total = displayAds.value.length
  clearTrackSnap()
  trackInstant.value = true
  trackIndex.value = total > 0 ? ((index % total) + total) % total : 0
  requestAnimationFrame(() => {
    trackInstant.value = false
  })
}

function moduloIndex(value: number, total: number): number {
  if (total <= 0) return 0
  return ((value % total) + total) % total
}

function circularStep(from: number, to: number, total: number): number {
  if (total <= 0) return 0
  let step = to - from
  while (step > total / 2) step -= total
  while (step < -total / 2) step += total
  return step
}

function advanceTrack(step: number) {
  const total = displayAds.value.length
  if (total < 2 || step === 0) return

  const run = () => {
    trackIndex.value += step
    if (trackIndex.value < 0 || trackIndex.value >= total) {
      trackSnapTimer = setTimeout(() => {
        snapTrackIndex(moduloIndex(trackIndex.value, total))
      }, TRACK_WRAP_MS)
    }
  }

  clearTrackSnap()
  if (trackIndex.value < 0 || trackIndex.value >= total) {
    snapTrackIndex(moduloIndex(trackIndex.value, total))
    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
    return
  }

  run()
}

function applyActiveIndex(index: number, step?: number) {
  const total = displayAds.value.length
  if (total < 2) return

  const next = moduloIndex(index, total)
  const from = moduloIndex(Math.round(trackIndex.value), total)
  const delta = step ?? circularStep(from, next, total)
  activeIndex.value = next
  advanceTrack(delta)
  animateVisualTo(next)
}

function stopRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = undefined
  }
}

function startRotation() {
  stopRotation()
  if (rotationPaused || displayAds.value.length < 2) return

  rotationTimer = setInterval(() => {
    const total = displayAds.value.length
    if (total < 2) {
      stopRotation()
      return
    }
    applyActiveIndex(activeIndex.value + 1, 1)
  }, ROTATION_MS)
}

function pauseRotation() {
  if (instantSwitch.value) return
  rotationPaused = true
  stopRotation()
}

function resumeRotation() {
  rotationPaused = false
  if (isDragging.value) return
  startRotation()
}

function goToAd(index: number) {
  applyActiveIndex(index)
  startRotation()
}

function selectAd(index: number) {
  goToAd(index)
}

function showPrevious() {
  applyActiveIndex(activeIndex.value - 1, -1)
  startRotation()
}

function showNext() {
  applyActiveIndex(activeIndex.value + 1, 1)
  startRotation()
}

function isButtonTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('button'))
}

function isActiveSlideTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('.ad-slide.is-active'))
}

function handlePointerDown(event: PointerEvent) {
  if (displayAds.value.length < 2 || isButtonTarget(event.target)) return
  if (useCoverflow.value && isActiveSlideTarget(event.target)) return

  stopOrbit()
  pointerId = event.pointerId
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  dragOriginVisual = visualIndex.value
  isDragging.value = false
  suppressClick.value = false
  dragProgress.value = 0
  stopRotation()
}

function handlePointerMove(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  const deltaX = event.clientX - pointerStartX
  const deltaY = event.clientY - pointerStartY
  if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return

  if (!isDragging.value) {
    isDragging.value = true
    carouselRef.value?.setPointerCapture(event.pointerId)
  }
  event.preventDefault()

  if (!useCoverflow.value) return

  const width = carouselRef.value?.clientWidth || 1
  const progress = Math.max(-1.2, Math.min(1.2, deltaX / (width * 0.3)))
  dragProgress.value = progress
  visualIndex.value = dragOriginVisual - progress
}

function finishPointer(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  const deltaX = event.clientX - pointerStartX
  const shouldFlip = useCoverflow.value
    ? Math.abs(visualIndex.value - activeIndex.value) >= 0.26
    : isDragging.value && Math.abs(deltaX) >= 40

  isDragging.value = false
  dragProgress.value = 0
  pointerId = null
  if (carouselRef.value?.hasPointerCapture(event.pointerId)) {
    carouselRef.value.releasePointerCapture(event.pointerId)
  }

  if (shouldFlip) {
    const toPrev = useCoverflow.value ? visualIndex.value < activeIndex.value : deltaX > 0
    if (toPrev) {
      showPrevious()
    } else {
      showNext()
    }
    suppressClick.value = true
  } else if (useCoverflow.value) {
    animateVisualTo(activeIndex.value)
  }

  if (!rotationPaused) startRotation()
}

function handlePointerUp(event: PointerEvent) {
  finishPointer(event)
}

function handlePointerCancel(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  isDragging.value = false
  dragProgress.value = 0
  pointerId = null
  if (carouselRef.value?.hasPointerCapture(event.pointerId)) {
    carouselRef.value.releasePointerCapture(event.pointerId)
  }
  if (useCoverflow.value) animateVisualTo(activeIndex.value)
  if (!rotationPaused) startRotation()
}

function handleKeydown(event: KeyboardEvent) {
  if (displayAds.value.length < 2) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPrevious()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNext()
  }
}

function openAdLink(url: string) {
  if (!url) return

  const resolved = resolveUrl(url)
  if (isMiniAppRuntime()) {
    const tg = getTelegramWebApp()
    if (typeof tg?.openLink === 'function') {
      tg.openLink(resolved)
      return
    }
  }

  const opened = window.open(resolved, '_blank', 'noopener,noreferrer')
  if (!opened) {
    window.location.assign(resolved)
  }
}

function findAdAtPoint(clientX: number, clientY: number): { index: number; ad: AdItem } | null {
  const hit = document.elementFromPoint(clientX, clientY)
  const slide = hit instanceof Element ? hit.closest('.ad-slide') : null
  if (!slide || !carouselRef.value?.contains(slide)) return null

  const index = Number(slide.getAttribute('data-index'))
  const ad = displayAds.value[index]
  if (!Number.isInteger(index) || !ad) return null

  return { index, ad }
}

function isModifiedClick(event: Event): boolean {
  return (
    event instanceof MouseEvent &&
    (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
  )
}

function openCenterLink(ad: AdItem, event?: Event) {
  if (!ad.link_url) return

  if (event && isModifiedClick(event)) return

  if (isMiniAppRuntime() || event instanceof KeyboardEvent) {
    event?.preventDefault()
    openAdLink(ad.link_url)
    return
  }

  if (event instanceof MouseEvent) {
    const target = event.target
    const onSlideLink = target instanceof Element && Boolean(target.closest('a.ad-slide'))
    if (onSlideLink) return
  }

  event?.preventDefault()
  openAdLink(ad.link_url)
}

function activateAd(index: number, ad: AdItem, event?: Event) {
  if (useCoverflow.value && index !== activeIndex.value) {
    event?.preventDefault()
    goToAd(index)
    return
  }

  openCenterLink(ad, event)
}

function handleCarouselClick(event: MouseEvent) {
  if (suppressClick.value) {
    event.preventDefault()
    suppressClick.value = false
    return
  }

  const target = event.target
  if (target instanceof Element && target.closest('.ad-slide')) return

  const found = findAdAtPoint(event.clientX, event.clientY)
  if (!found) return
  activateAd(found.index, found.ad, event)
}

function handleSlideClick(event: MouseEvent | KeyboardEvent, index: number, ad: AdItem) {
  if (suppressClick.value) {
    event.preventDefault()
    suppressClick.value = false
    return
  }

  if (useCoverflow.value && index !== activeIndex.value) {
    event.preventDefault()
    goToAd(index)
    return
  }

  openCenterLink(ad, event)
}

function handleImageError(ad: AdItem) {
  failedImages.value = new Set(failedImages.value).add(String(ad.id))
}

function syncMotionPreference() {
  prefersReducedMotion.value = Boolean(motionQuery?.matches)
}

async function loadAds() {
  if (cachedAds?.length) {
    ads.value = cachedAds
    loaded.value = true
    emitHasAd()
    startRotation()
  }

  try {
    const response = await adApi.getAds()
    if (String(response.code) === '000000') {
      ads.value = normalizeAds(response.data)
      cachedAds = ads.value
      activeIndex.value = 0
      visualIndex.value = 0
      stopOrbit()
      snapTrackIndex(0)
      startRotation()
    } else if (import.meta.env.DEV) {
      console.warn('[AdBanner] 获取广告失败:', response.msg)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[AdBanner] 获取广告异常:', error)
    }
  } finally {
    loaded.value = true
    emitHasAd()
  }
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMotionPreference()
  motionQuery.addEventListener('change', syncMotionPreference)
  void loadAds()
})

onUnmounted(() => {
  stopRotation()
  stopOrbit()
  clearTrackSnap()
  motionQuery?.removeEventListener('change', syncMotionPreference)
})
</script>

<style lang="scss" scoped>
.ad-banner {
  --ad-image-ratio: 16 / 7;
  --ad-card-width: min(46%, 500px);
  width: min(100%, 896px);
  margin: 0 auto 16px;

  &.is-miniapp {
    width: 100%;
    max-width: none;
    margin: 0;

    .ad-carousel,
    .ad-skeleton {
      width: 100%;
      border-radius: 0;
    }
  }

  &.is-coverflow {
    width: min(100%, 1120px);
    margin: 0 auto 10px;
  }
}

.ad-carousel,
.ad-skeleton {
  position: relative;
  overflow: hidden;
  aspect-ratio: var(--ad-image-ratio);
  border-radius: 6px;
  background: rgba(2, 15, 45, 0.05);
}

.ad-carousel {
  touch-action: pan-y;
  cursor: grab;
  outline: none;

  &.is-dragging {
    cursor: grabbing;
  }
}

.ad-stage,
.ad-slides {
  position: relative;
  width: 100%;
  height: 100%;
}

.ad-stage__sizer {
  display: none;
}

.ad-slide {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
  user-select: none;
  -webkit-user-drag: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;

  &.is-active {
    position: relative;
    z-index: 1;
    opacity: 1;
    pointer-events: auto;
  }

  &.is-link {
    cursor: pointer;
  }
}

.ad-carousel.is-instant .ad-slide {
  transition: none;
}

.ad-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.ad-fallback {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 0 32px;
  color: #fff;
  background: linear-gradient(110deg, #2457d6 0%, #2d9bd2 50%, #42c6b5 100%);
}

.ad-fallback__eyebrow {
  font-size: 13px;
  opacity: 0.85;
}

.ad-fallback__title {
  margin-top: 4px;
  font-size: 21px;
  font-weight: 700;
}

.ad-dots {
  position: absolute;
  right: 0;
  bottom: 8px;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 5px;
}

.ad-dot {
  width: 28px;
  height: 4px;
  padding: 0;
  border: 0;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.65);
  cursor: pointer;

  &.is-active {
    background: #fff;
  }
}

.ad-banner.is-coverflow {
  --ad-shift: 70%;
  --ad-tilt: -36deg;
  --ad-depth: -120px;

  .ad-carousel {
    overflow: visible;
    aspect-ratio: auto;
    height: auto;
    border-radius: 0;
    background: transparent;
  }

  .ad-stage {
    height: auto;
    perspective: 1480px;
    perspective-origin: 50% 46%;
    transform-style: preserve-3d;
  }

  .ad-stage__sizer {
    display: block;
    width: var(--ad-card-width);
    aspect-ratio: var(--ad-image-ratio);
    margin-inline: auto;
    visibility: hidden;
    pointer-events: none;
  }

  .ad-slides {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }

  .ad-slide {
    --ad-offset: 0;
    --ad-abs: 0;
    inset: auto;
    top: 50%;
    left: 50%;
    width: var(--ad-card-width);
    height: auto;
    aspect-ratio: var(--ad-image-ratio);
    overflow: hidden;
    border-radius: 14px;
    background: #101828;
    box-shadow:
      0 22px 44px rgba(15, 23, 42, 0.18),
      0 0 0 1px rgba(15, 23, 42, 0.08);
    opacity: 1;
    transform: translate(-50%, -50%);
    transform-style: preserve-3d;
    backface-visibility: hidden;
    filter: brightness(calc(1 - min(var(--ad-abs), 1.6) * 0.18));
    transition: opacity 0.45s ease;
    will-change: transform;
  }

  .ad-slide.is-active {
    position: absolute;
  }

  .ad-slide:not(.is-active) {
    cursor: pointer;
  }

  .ad-carousel.is-dragging .ad-slide,
  .ad-carousel.is-orbiting .ad-slide {
    transition: none;
  }

  .ad-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
  }

  .ad-track {
    position: relative;
    overflow: hidden;
    width: min(168px, 36vw);
    height: 2px;
    border-radius: 99px;
    background: rgba(22, 93, 255, 0.14);
  }

  .ad-track__fill {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #165dff;
    transform-origin: left center;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);

    &.is-instant {
      transition: none;
    }
  }

  .ad-carousel.is-dragging .ad-track__fill {
    transition: none;
  }
}

.ad-skeleton {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 32px;
  background: linear-gradient(100deg, #e9edf5 20%, #f8fafc 40%, #e9edf5 60%);
  background-size: 200% 100%;
  animation: ad-skeleton-shimmer 1.4s linear infinite;
}

.ad-skeleton__line {
  display: block;
  height: 14px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.75);
}

.ad-skeleton__line--title {
  width: 42%;
  height: 22px;
}

.ad-skeleton__line--text {
  width: 30%;
}

@keyframes ad-skeleton-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .ad-banner {
    width: 100%;
    margin-bottom: 12px;
  }

  .ad-banner.is-coverflow {
    --ad-shift: 56%;
    --ad-tilt: -28deg;
    --ad-depth: -72px;
    --ad-card-width: min(72%, 360px);
    margin-bottom: 8px;

    .ad-slide {
      border-radius: 12px;
    }

    .ad-controls {
      margin-top: 12px;
    }
  }

  @media (max-width: 400px) {
    .ad-banner:not(.is-miniapp):not(.is-coverflow) {
      width: 100%;
      max-width: none;
      margin-right: 0;
      margin-left: 0;

      .ad-carousel,
      .ad-skeleton {
        border-radius: 0;
      }
    }
  }

  .ad-carousel,
  .ad-skeleton {
    aspect-ratio: var(--ad-image-ratio);
  }

  .ad-banner.is-coverflow .ad-carousel {
    aspect-ratio: auto;
  }

  .ad-fallback {
    padding: 0 18px;
  }

  .ad-fallback__eyebrow {
    font-size: 11px;
  }

  .ad-fallback__title {
    font-size: 16px;
  }

  .ad-skeleton {
    padding: 0 18px;
  }

  .ad-dot {
    width: 20px;
    height: 3px;
  }
}
</style>
