<template>
  <div
    class="telegram-float"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="onDragStart"
    @touchstart="onDragStart"
    @click="handleClick"
  >
    <SvgIcon name="header-tg" width="28" height="28" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteStore } from '@/stores/useSiteStore'
import { handleOpenToTelegram } from '@/utils'

defineOptions({
  name: 'TelegramFloat',
})

const siteStore = useSiteStore()
const { botName } = storeToRefs(siteStore)

const position = reactive({ x: 0, y: 0 })
let isDragging = false
let hasMoved = false
let startX = 0
let startY = 0
let offsetX = 0
let offsetY = 0

const SIZE = 52

onMounted(() => {
  // 初始位置：右下角
  position.x = window.innerWidth - SIZE - 20
  position.y = window.innerHeight - SIZE - 80
})

const onDragStart = (e: MouseEvent | TouchEvent) => {
  isDragging = true
  hasMoved = false

  const event = 'touches' in e ? e.touches[0] : e
  startX = event.clientX
  startY = event.clientY
  offsetX = event.clientX - position.x
  offsetY = event.clientY - position.y

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

const onDragMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging) return
  e.preventDefault()

  const event = 'touches' in e ? e.touches[0] : e
  const dx = event.clientX - startX
  const dy = event.clientY - startY

  // 移动超过 5px 才算拖拽
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
    hasMoved = true
  }

  let newX = event.clientX - offsetX
  let newY = event.clientY - offsetY

  // 边界限制
  newX = Math.max(0, Math.min(newX, window.innerWidth - SIZE))
  newY = Math.max(0, Math.min(newY, window.innerHeight - SIZE))

  position.x = newX
  position.y = newY
}

const onDragEnd = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
}

const handleClick = () => {
  // 拖拽过程中不触发点击
  if (hasMoved) return
  handleOpenToTelegram(botName.value)
}
</script>

<style lang="scss" scoped>
.telegram-float {
  position: fixed;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc 0%, #00aaff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 4px 16px rgba(0, 136, 204, 0.4);
  z-index: 1001;
  transition: box-shadow 0.3s ease;
  user-select: none;
  touch-action: none;

  &:active {
    cursor: grabbing;
    box-shadow: 0 6px 20px rgba(0, 136, 204, 0.5);
  }

  :deep(svg) {
    color: #fff;
    filter: brightness(10);
    pointer-events: none;
  }
}

@media (max-width: 768px) {
  .telegram-float {
    width: 46px;
    height: 46px;

    :deep(svg) {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
