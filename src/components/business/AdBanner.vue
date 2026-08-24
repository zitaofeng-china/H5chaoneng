<template>
  <section
    v-if="showBanner"
    class="ad-banner"
    :class="{
      'is-miniapp': instantSwitch,
      'is-coverflow': useCoverflow,
    }"
    aria-label="广告"
  >
    <div
      ref="carouselRef"
      class="ad-carousel"
      :class="{ 'is-dragging': isDragging, 'is-instant': instantSwitch }"
      tabindex="0"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
      @keydown="handleKeydown"
      @dragstart.prevent
      @mouseenter="pauseRotation"
      @mouseleave="resumeRotation"
    >
      <div class="ad-stage">
        <div class="ad-slides">
          <div
            v-for="(ad, index) in displayAds"
            :key="getAdKey(ad, index)"
            class="ad-slide"
            :class="{ 'is-active': index === activeIndex, 'is-link': Boolean(ad.link_url) }"
            :style="getSlideStyle(index)"
            :role="ad.link_url ? 'link' : undefined"
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
          </div>
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
const suppressClick = ref(false)
const dragProgress = ref(0)
const trackIndex = ref(0)
const trackInstant = ref(false)
const prefersReducedMotion = ref(false)
const instantSwitch = computed(() => isMiniAppRuntime())
const useCoverflow = computed(
  () =>
    !instantSwitch.value &&
    !prefersReducedMotion.value &&
    displayAds.value.length > 1,
)
let pointerStartX = 0
let pointerStartY = 0
let pointerId: number | null = null
let rotationPaused = false
let rotationTimer: ReturnType<typeof setInterval> | undefined
let trackSnapTimer: ReturnType<typeof setTimeout> | undefined
let motionQuery: MediaQueryList | null = null
const ROTATION_MS = 6500
const TRACK_WRAP_MS = 460

const displayAds = computed(() =>
  ads.value.filter((ad) => Boolean(ad.image_url) && !failedImages.value.has(String(ad.id))),
)
const showBanner = computed(() => displayAds.value.length > 0)

function emitHasAd() {
  if (!loaded.value) return
  emit('update:hasAd', showBanner.value)
}

watch(displayAds, (list) => {
  if (activeIndex.value >= list.length) {
    activeIndex.value = 0
  }
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

function getSlideStyle(index: number): Record<string, string> | undefined {
  if (!useCoverflow.value) return undefined

  const total = displayAds.value.length
  const offset = wrapOffset(index - activeIndex.value + dragProgress.value, total)
  const abs = Math.abs(offset)
  const hidden = abs > 2.15

  return {
    '--ad-offset': String(offset),
    '--ad-abs': String(abs),
    zIndex: String(Math.round(24 - abs * 6)),
    opacity: hidden ? '0' : abs > 1.15 ? String(Math.max(0.28, 0.82 - (abs - 1) * 0.38)) : '1',
    pointerEvents: hidden || abs > 1.35 ? 'none' : 'auto',
    visibility: hidden ? 'hidden' : 'visible',
  }
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

function handlePointerDown(event: PointerEvent) {
  if (displayAds.value.length < 2 || isButtonTarget(event.target)) return

  pointerId = event.pointerId
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  isDragging.value = false
  suppressClick.value = false
  dragProgress.value = 0
  stopRotation()
  carouselRef.value?.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  const deltaX = event.clientX - pointerStartX
  const deltaY = event.clientY - pointerStartY
  if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return

  isDragging.value = true
  event.preventDefault()

  if (!useCoverflow.value) return

  const width = carouselRef.value?.clientWidth || 1
  dragProgress.value = Math.max(-1.2, Math.min(1.2, deltaX / (width * 0.3)))
}

function finishPointer(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  const deltaX = event.clientX - pointerStartX
  const progress = dragProgress.value
  const shouldFlip = useCoverflow.value
    ? Math.abs(progress) >= 0.26
    : isDragging.value && Math.abs(deltaX) >= 40

  if (shouldFlip) {
    const toPrev = useCoverflow.value ? progress > 0 : deltaX > 0
    if (toPrev) {
      showPrevious()
    } else {
      showNext()
    }
    suppressClick.value = true
  }

  isDragging.value = false
  dragProgress.value = 0
  pointerId = null
  if (carouselRef.value?.hasPointerCapture(event.pointerId)) {
    carouselRef.value.releasePointerCapture(event.pointerId)
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
  const tg = getTelegramWebApp()
  if (typeof tg?.openLink === 'function') {
    tg.openLink(resolved)
    return
  }

  window.open(resolved, '_blank', 'noopener,noreferrer')
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

  openAdLink(ad.link_url)
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
  clearTrackSnap()
  motionQuery?.removeEventListener('change', syncMotionPreference)
})
</script>

<style lang="scss" scoped>
.ad-banner {
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
  aspect-ratio: 16 / 4;
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
  --ad-shift: 72%;
  --ad-tilt: -42deg;
  --ad-depth: -160px;

  .ad-carousel {
    overflow: visible;
    aspect-ratio: auto;
    height: auto;
    border-radius: 0;
    background: transparent;
  }

  .ad-stage {
    height: clamp(176px, 23vw, 248px);
    perspective: 1480px;
    perspective-origin: 50% 46%;
    transform-style: preserve-3d;
  }

  .ad-slides {
    transform-style: preserve-3d;
  }

  .ad-slide {
    --ad-offset: 0;
    --ad-abs: 0;
    inset: auto;
    top: 50%;
    left: 50%;
    width: min(480px, 42%);
    height: auto;
    aspect-ratio: 16 / 7;
    overflow: hidden;
    border-radius: 14px;
    background: #101828;
    box-shadow:
      0 22px 44px rgba(15, 23, 42, 0.18),
      0 0 0 1px rgba(15, 23, 42, 0.08);
    opacity: 1;
    transform: translate(-50%, -50%) translateX(calc(var(--ad-offset) * var(--ad-shift)))
      rotateY(calc(var(--ad-offset) * var(--ad-tilt)))
      translateZ(calc(var(--ad-abs) * var(--ad-depth)))
      scale(calc(1 - min(var(--ad-abs), 2) * 0.06));
    transform-style: preserve-3d;
    backface-visibility: hidden;
    filter: brightness(calc(1 - min(var(--ad-abs), 1.6) * 0.18));
    transition:
      transform 0.62s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.45s ease,
      filter 0.45s ease;
  }

  .ad-slide.is-active {
    position: absolute;
  }

  .ad-carousel.is-dragging .ad-slide {
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
    --ad-shift: 62%;
    --ad-tilt: -32deg;
    --ad-depth: -96px;
    margin-bottom: 8px;

    .ad-stage {
      height: clamp(148px, 42vw, 196px);
    }

    .ad-slide {
      width: min(64%, 360px);
      aspect-ratio: 16 / 8;
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
    aspect-ratio: 16 / 4;
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
