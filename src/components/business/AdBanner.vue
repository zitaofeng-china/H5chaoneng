<template>
  <section v-if="hasAdImage" class="ad-banner" aria-label="广告">
    <div
      ref="carouselRef"
      class="ad-carousel"
      :class="{ 'is-dragging': isDragging }"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
    >
      <Transition name="ad-smooth" mode="out-in">
        <component
          :is="currentAd?.link_url ? 'a' : 'div'"
          :key="`${String(currentAd?.id)}-${activeIndex}`"
          class="ad-slide"
          :href="currentAd?.link_url ? resolveUrl(currentAd.link_url) : undefined"
          :target="currentAd?.link_url ? '_blank' : undefined"
          :rel="currentAd?.link_url ? 'noopener noreferrer' : undefined"
          @click="handleSlideClick"
        >
          <img
            class="ad-image"
            :src="resolveUrl(currentAd!.image_url)"
            :alt="currentAd?.title || $t('home.adBannerTitle')"
            draggable="false"
            @error="handleImageError"
          />
        </component>
      </Transition>

      <template v-if="ads.length > 1">
        <button
          class="ad-arrow ad-arrow--prev"
          type="button"
          aria-label="上一个广告"
          @click.stop="showPrevious"
        >
          <span class="ad-arrow__icon" aria-hidden="true"></span>
        </button>
        <button
          class="ad-arrow ad-arrow--next"
          type="button"
          aria-label="下一个广告"
          @click.stop="showNext"
        >
          <span class="ad-arrow__icon" aria-hidden="true"></span>
        </button>
      </template>

      <div v-if="ads.length > 1" class="ad-dots" role="tablist" aria-label="广告切换">
        <button
          v-for="(ad, index) in ads"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { adApi } from '@/api'
import type { AdItem } from '@/api/modules/ad/types'

defineOptions({
  name: 'AdBanner',
})

const emit = defineEmits<{
  'update:hasAd': [value: boolean]
}>()

const ads = ref<AdItem[]>([])
const activeIndex = ref(0)
const loading = ref(false)
const failedImages = ref(new Set<string>())
const carouselRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const suppressClick = ref(false)
let pointerStartX = 0
let pointerStartY = 0
let pointerId: number | null = null
let rotationTimer: ReturnType<typeof setInterval> | undefined

const currentAd = computed(() => ads.value[activeIndex.value] ?? null)
const currentImageFailed = computed(() => {
  const id = currentAd.value?.id
  return id !== undefined && failedImages.value.has(String(id))
})
const hasAdImage = computed(
  () => Boolean(currentAd.value?.image_url) && !currentImageFailed.value,
)

watch(
  [hasAdImage, loading],
  ([visible, isLoading]) => {
    if (!isLoading) emit('update:hasAd', visible)
  },
  { immediate: true },
)

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

function stopRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = undefined
  }
}

function startRotation() {
  stopRotation()
  if (ads.value.length < 2) return

  rotationTimer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % ads.value.length
  }, 6500)
}

function goToAd(index: number) {
  if (ads.value.length < 2) return

  activeIndex.value = (index + ads.value.length) % ads.value.length
  startRotation()
}

function selectAd(index: number) {
  goToAd(index)
}

function showPrevious() {
  goToAd(activeIndex.value - 1)
}

function showNext() {
  goToAd(activeIndex.value + 1)
}

function isButtonTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('button'))
}

function handlePointerDown(event: PointerEvent) {
  if (ads.value.length < 2 || isButtonTarget(event.target)) return

  pointerId = event.pointerId
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  isDragging.value = false
  suppressClick.value = false
  carouselRef.value?.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  const deltaX = event.clientX - pointerStartX
  const deltaY = event.clientY - pointerStartY
  if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return

  isDragging.value = true
  event.preventDefault()
}

function finishPointer(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  const deltaX = event.clientX - pointerStartX
  if (isDragging.value && Math.abs(deltaX) >= 40) {
    if (deltaX < 0) {
      showNext()
    } else {
      showPrevious()
    }
    suppressClick.value = true
  }

  isDragging.value = false
  pointerId = null
  if (carouselRef.value?.hasPointerCapture(event.pointerId)) {
    carouselRef.value.releasePointerCapture(event.pointerId)
  }
}

function handlePointerUp(event: PointerEvent) {
  finishPointer(event)
}

function handlePointerCancel(event: PointerEvent) {
  if (pointerId !== event.pointerId) return

  isDragging.value = false
  pointerId = null
}

function handleSlideClick(event: MouseEvent) {
  if (!suppressClick.value) return

  event.preventDefault()
  suppressClick.value = false
}

function handleImageError() {
  const id = currentAd.value?.id
  if (id === undefined) return

  failedImages.value = new Set(failedImages.value).add(String(id))
}

async function loadAds() {
  loading.value = true

  try {
    const response = await adApi.getAds()
    if (String(response.code) === '000000') {
      ads.value = normalizeAds(response.data)
      activeIndex.value = 0
      startRotation()
    } else if (import.meta.env.DEV) {
      console.warn('[AdBanner] 获取广告失败:', response.msg)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[AdBanner] 获取广告异常:', error)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadAds()
})

onUnmounted(() => {
  stopRotation()
})
</script>

<style lang="scss" scoped>
.ad-banner {
  width: min(100%, 896px);
  margin: 0 auto 16px;
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

  &.is-dragging {
    cursor: grabbing;
  }
}

.ad-slide {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.ad-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
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

.ad-arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  width: 34px;
  height: 54px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  color: #fff;
  background: rgba(0, 0, 0, 0.32);
  font-size: 36px;
  line-height: 1;
  opacity: 0;
  cursor: pointer;
  transform: translateY(-50%);
  transition: opacity 0.2s ease, background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}

.ad-arrow__icon {
  position: absolute;
  inset: 0;
  width: 10px;
  height: 10px;
  margin: auto;
  border-top: 2px solid #fff;
  border-right: 2px solid #fff;
}

.ad-arrow--prev .ad-arrow__icon {
  transform: translateX(2px) rotate(-135deg);
}

.ad-arrow--next .ad-arrow__icon {
  transform: translateX(-2px) rotate(45deg);
}

.ad-carousel:hover .ad-arrow,
.ad-carousel:focus-within .ad-arrow {
  opacity: 1;
}

.ad-arrow--prev {
  left: 12px;
}

.ad-arrow--next {
  right: 12px;
}

.ad-smooth-enter-active,
.ad-smooth-leave-active {
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.ad-smooth-enter-from {
  transform: translateX(18px);
}

.ad-smooth-leave-to {
  transform: translateX(-18px);
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

  .ad-carousel,
  .ad-skeleton {
    aspect-ratio: 16 / 4;
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

  .ad-arrow {
    width: 28px;
    height: 42px;
    font-size: 28px;
    opacity: 0.8;
  }

  .ad-arrow__icon {
    width: 9px;
    height: 9px;
  }

  .ad-arrow--prev {
    left: 8px;
  }

  .ad-arrow--next {
    right: 8px;
  }
}
</style>
