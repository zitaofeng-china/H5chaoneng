<template>
  <Teleport to="body">
    <div
      ref="rootRef"
      class="telegram-float"
      :class="{
        'is-dragging': isDragging && hasMoved,
        'is-snapping': isSnapping,
      }"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      role="button"
      :aria-label="ariaLabel"
      tabindex="0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @click="handleClick"
      @keydown.enter.prevent="handleActivate"
      @keydown.space.prevent="handleActivate"
    >
      <span class="telegram-float__ripple" aria-hidden="true"></span>
      <span class="telegram-float__highlight" aria-hidden="true"></span>
      <span class="telegram-float__shine" aria-hidden="true"></span>
      <SvgIcon name="header-tg" width="34" height="34" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores/useSiteStore'
import { handleOpenToTelegram } from '@/utils'

defineOptions({
  name: 'TelegramFloat',
})

const STORAGE_KEY = 'energy_h5_tg_float_pos'
const FALLBACK_SIZE = 64
const EDGE_MARGIN = 12
const DEFAULT_BOTTOM_GAP = 80
const SNAP_DURATION = 280
const DRAG_THRESHOLD = 6

type DockSide = 'left' | 'right'

type ViewportRect = {
  left: number
  top: number
  width: number
  height: number
}

type ViewportSnapshot = ViewportRect & {
  x: number
  y: number
  size: number
  side: DockSide
}

const { t } = useI18n()
const siteStore = useSiteStore()
const { botName, tgAdmin } = storeToRefs(siteStore)

const rootRef = ref<HTMLElement | null>(null)
const position = reactive({ x: 0, y: 0 })
const dockSide = ref<DockSide>('right')
const isDragging = ref(false)
const isSnapping = ref(false)
const hasMoved = ref(false)

const ariaLabel = computed(() => t('nav.contactUs'))

let startX = 0
let startY = 0
let offsetX = 0
let offsetY = 0
let rafId = 0
let snapTimer = 0
let snapshot: ViewportSnapshot | null = null
let activePointerId: number | null = null

function getBallSize() {
  const rect = rootRef.value?.getBoundingClientRect()
  return rect && rect.width > 0 ? rect.width : FALLBACK_SIZE
}

function getVisibleRect(): ViewportRect {
  const layoutW = document.documentElement.clientWidth
  const layoutH = document.documentElement.clientHeight
  const visual = window.visualViewport

  if (!visual) {
    return { left: 0, top: 0, width: layoutW, height: layoutH }
  }

  const left = Math.max(0, visual.offsetLeft)
  const top = Math.max(0, visual.offsetTop)
  const right = Math.min(layoutW, visual.offsetLeft + visual.width)
  const bottom = Math.min(layoutH, visual.offsetTop + visual.height)

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

function getHeaderBottom() {
  const nav = document.querySelector('.navbar') as HTMLElement | null
  if (!nav) return 50
  return nav.getBoundingClientRect().bottom
}

function clampToViewport() {
  const size = getBallSize()
  const view = getVisibleRect()
  const minX = view.left + EDGE_MARGIN
  const maxX = view.left + view.width - size - EDGE_MARGIN
  const minY = Math.max(view.top + EDGE_MARGIN, getHeaderBottom() + 8)
  const maxY = view.top + view.height - size - EDGE_MARGIN

  position.x = Math.max(minX, Math.min(position.x, Math.max(minX, maxX)))
  position.y = Math.max(minY, Math.min(position.y, Math.max(minY, maxY)))
}

function takeSnapshot() {
  snapshot = {
    ...getVisibleRect(),
    x: position.x,
    y: position.y,
    size: getBallSize(),
    side: dockSide.value,
  }
}

function persist() {
  try {
    const view = getVisibleRect()
    const ratio = view.height > 0 ? (position.y - view.top) / view.height : 0.75
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        side: dockSide.value,
        yRatio: Math.min(1, Math.max(0, ratio)),
      }),
    )
  } catch {
    // 隐私模式等无法写入时忽略
  }
}

function dockX(side: DockSide, view = getVisibleRect(), size = getBallSize()) {
  return side === 'left'
    ? view.left + EDGE_MARGIN
    : view.left + view.width - size - EDGE_MARGIN
}

function snapToEdge(animate = true) {
  const size = getBallSize()
  const view = getVisibleRect()
  const centerX = position.x + size / 2
  dockSide.value = centerX < view.left + view.width / 2 ? 'left' : 'right'
  position.x = dockX(dockSide.value, view, size)
  clampToViewport()
  takeSnapshot()
  persist()

  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isSnapping.value = false
    return
  }

  isSnapping.value = true
  window.clearTimeout(snapTimer)
  snapTimer = window.setTimeout(() => {
    isSnapping.value = false
  }, SNAP_DURATION)
}

function placeDefault() {
  const size = getBallSize()
  const view = getVisibleRect()
  dockSide.value = 'right'
  position.x = dockX('right', view, size)
  position.y = view.top + view.height - size - DEFAULT_BOTTOM_GAP
  clampToViewport()
  takeSnapshot()
}

function restorePosition() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      placeDefault()
      return
    }
    const saved = JSON.parse(raw) as { side?: DockSide; yRatio?: number }
    const view = getVisibleRect()
    const size = getBallSize()
    dockSide.value = saved.side === 'left' ? 'left' : 'right'
    position.x = dockX(dockSide.value, view, size)
    const ratio = typeof saved.yRatio === 'number' ? saved.yRatio : 0.75
    position.y = view.top + ratio * view.height
    clampToViewport()
    takeSnapshot()
  } catch {
    placeDefault()
  }
}

function syncToViewport() {
  const view = getVisibleRect()
  const size = getBallSize()

  if (isDragging.value) {
    clampToViewport()
    return
  }

  if (snapshot && snapshot.width > 0 && snapshot.height > 0) {
    position.x = dockX(snapshot.side, view, size)
    const distTop = snapshot.y - snapshot.top
    const distBottom = snapshot.top + snapshot.height - snapshot.size - snapshot.y
    position.y =
      distBottom <= distTop
        ? view.top + view.height - size - distBottom
        : view.top + distTop
    dockSide.value = snapshot.side
  }

  clampToViewport()
  takeSnapshot()
}

function onViewportChange() {
  if (rafId) return
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    syncToViewport()
  })
}

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return

  isDragging.value = true
  isSnapping.value = false
  hasMoved.value = false
  activePointerId = e.pointerId

  startX = e.clientX
  startY = e.clientY
  offsetX = e.clientX - position.x
  offsetY = e.clientY - position.y

  rootRef.value?.setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value || e.pointerId !== activePointerId) return
  e.preventDefault()

  if (Math.abs(e.clientX - startX) > DRAG_THRESHOLD || Math.abs(e.clientY - startY) > DRAG_THRESHOLD) {
    hasMoved.value = true
  }

  if (!hasMoved.value) return

  position.x = e.clientX - offsetX
  position.y = e.clientY - offsetY
  clampToViewport()
}

const onPointerUp = (e: PointerEvent) => {
  if (e.pointerId !== activePointerId) return
  finishDrag()
}

function finishDrag() {
  if (!isDragging.value) return
  isDragging.value = false
  activePointerId = null

  if (hasMoved.value) snapToEdge(true)
  else clampToViewport()
}

function openTelegram() {
  handleOpenToTelegram(tgAdmin.value || botName.value)
}

const handleClick = () => {
  if (hasMoved.value) return
  openTelegram()
}

const handleActivate = () => {
  openTelegram()
}

function bindViewportListeners() {
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('orientationchange', onViewportChange)
  window.visualViewport?.addEventListener('resize', onViewportChange)
  window.visualViewport?.addEventListener('scroll', onViewportChange)
}

function unbindViewportListeners() {
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('orientationchange', onViewportChange)
  window.visualViewport?.removeEventListener('resize', onViewportChange)
  window.visualViewport?.removeEventListener('scroll', onViewportChange)
  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
}

onMounted(async () => {
  await nextTick()
  restorePosition()
  bindViewportListeners()
})

onUnmounted(() => {
  unbindViewportListeners()
  isDragging.value = false
  activePointerId = null
  window.clearTimeout(snapTimer)
})
</script>

<style lang="scss" scoped>
.telegram-float {
  position: fixed;
  width: 64px;
  height: 64px;
  box-sizing: border-box;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc 0%, #00aaff 100%);
  border: 2px solid rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 3px 10px rgba(0, 136, 204, 0.18);
  z-index: 1001;
  isolation: isolate;
  user-select: none;
  touch-action: none;
  outline: none;
  transition: box-shadow 0.3s ease;

  &:active,
  &.is-dragging {
    cursor: grabbing;
    box-shadow: 0 4px 12px rgba(0, 136, 204, 0.24);
  }

  &.is-dragging {
    transition: none;
  }

  &.is-snapping {
    transition:
      left 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      top 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.3s ease;
  }

  &.is-dragging .telegram-float__ripple {
    opacity: 0;
  }

  :deep(svg) {
    position: relative;
    z-index: 1;
    color: #fff;
    filter: brightness(10);
    pointer-events: none;
  }
}

.telegram-float__ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      transparent 46%,
      rgba(110, 210, 255, 0.55) 54%,
      rgba(120, 215, 255, 0.22) 64%,
      transparent 74%
    );
    animation: telegram-float-ripple 2.8s ease-out infinite;
  }

  &::after {
    animation-delay: 1.4s;
  }
}

.telegram-float__highlight {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.5), transparent 58%);
}

.telegram-float__shine {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -35%;
    left: -80%;
    width: 36%;
    height: 170%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 28%,
      rgba(255, 255, 255, 0.38) 50%,
      rgba(255, 255, 255, 0.08) 72%,
      transparent 100%
    );
    transform: rotate(24deg);
    animation: telegram-float-shine 2.5s linear infinite;
  }
}

@media (max-width: 768px) {
  .telegram-float {
    width: 56px;
    height: 56px;

    :deep(svg) {
      width: 30px;
      height: 30px;
    }
  }
}

@keyframes telegram-float-ripple {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

@keyframes telegram-float-shine {
  0% {
    left: -80%;
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  78% {
    opacity: 1;
  }
  90% {
    left: 130%;
    opacity: 0;
  }
  100% {
    left: 130%;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .telegram-float,
  .telegram-float.is-snapping {
    transition: none;
    animation: none;
  }

  .telegram-float__shine::after,
  .telegram-float__ripple::before,
  .telegram-float__ripple::after {
    animation: none;
  }
}
</style>
