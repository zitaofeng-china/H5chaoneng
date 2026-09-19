<template>
  <EnergyRental />
  <div class="fee-workflow-ambient">
    <img
      class="ambient-side-glow"
      :src="workflowSideBg"
      alt=""
      aria-hidden="true"
    />
    <FeeDescription />
    <HowItWorks :force-ready="bottomTriggered" />
  </div>
  <WhyChooseUs :force-ready="bottomTriggered" />
  <div ref="bottomSentinelRef" class="home-bottom-sentinel" aria-hidden="true"></div>
  <FaqSection />
  <HelpSection />
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EnergyRental from './components/EnergyRental.vue'
import { cancelHashScroll, hashToId, scrollToRouteHash } from '@/utils/hashScroll'
import workflowSideBg from '@/assets/images/home/lanhu/workflow-side-bg.png'

// 首屏主转化区同步加载；下方营销区块异步分包
const FeeDescription = defineAsyncComponent(() => import('./components/FeeDescription.vue'))
const HowItWorks = defineAsyncComponent(() => import('./components/HowItWorks.vue'))
const WhyChooseUs = defineAsyncComponent(() => import('./components/WhyChooseUs.vue'))
const FaqSection = defineAsyncComponent(() => import('./components/FaqSection.vue'))
const HelpSection = defineAsyncComponent(() => import('./components/HelpSection.vue'))

defineOptions({
  name: 'HomePage',
})

const route = useRoute()
const bottomTriggered = ref(false)
const bottomSentinelRef = ref<HTMLElement | null>(null)
let bottomIo: IntersectionObserver | null = null

const triggerReveal = () => {
  if (bottomTriggered.value) return
  bottomTriggered.value = true
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('energy-reveal-sections'))
  }
}

const checkHashReveal = (hash: string) => {
  if (!hash) return
  const id = hashToId(hash)
  // 若跳转到 question (常见问题)、contact (联系我们) 或 feature (为什么选择我们)
  // 提前激活触发能力，平衡上方所有区块的就绪状态
  if (id === 'question' || id === 'contact' || id === 'feature') {
    triggerReveal()
  }
}

// 从其他页点导航锚点、或带着 hash 进入首页时，等异步区块进 DOM 再滚。
watch(
  () => route.hash,
  (hash) => {
    if (!hash) return
    checkHashReveal(hash)
    const exists = Boolean(document.getElementById(hashToId(hash)))
    void scrollToRouteHash(hash, { behavior: exists ? 'smooth' : 'auto' })
  },
  { immediate: true, flush: 'post' },
)

onMounted(() => {
  if (route.hash) {
    checkHashReveal(route.hash)
  }

  // 底部视窗进入侦测（平衡机制）：
  // 当视窗滚动接近或到达底部区域时，激活触发能力确保上方所有区块就绪
  const sentinel = bottomSentinelRef.value
  if (sentinel && typeof IntersectionObserver !== 'undefined') {
    bottomIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight) {
            triggerReveal()
            bottomIo?.disconnect()
            bottomIo = null
            break
          }
        }
      },
      { rootMargin: '200px 0px 0px 0px' },
    )
    bottomIo.observe(sentinel)
  }
})

onUnmounted(() => {
  cancelHashScroll()
  bottomIo?.disconnect()
  bottomIo = null
})
</script>

<style lang="scss" scoped>
/**
 * “手续费说明”与“工作原理”在原型稿中共用同一片连续背景，
 * 装饰图 workflow-side-bg 也是横跨两个区块的同一张图。
 * 用公共父容器统一铺白色背景 + 底层装饰图，两个子组件的内容各自浮在上层，
 * 避免各自绘制背景/装饰在拼接处出现断层空白。
 */
.fee-workflow-ambient {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #fff;
}

.ambient-side-glow {
  position: absolute;
  z-index: 0;
  top: 220px;
  /* 蓝湖代码：left:1333px, width:587px，画布宽 1920px → 1333+587=1920，
     即图片右边缘贴住画布右边缘，对应 right: 0。 */
  right: 0;
  width: 587px;
  height: 663px;
  max-width: none;
  pointer-events: none;
  object-fit: contain;
}

.fee-workflow-ambient :deep(.fee-description),
.fee-workflow-ambient :deep(.how-it-works) {
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .ambient-side-glow {
    top: 112px;
    right: -230px;
    width: 440px;
    height: auto;
    opacity: 0.55;
  }
}

.home-bottom-sentinel {
  position: relative;
  width: 100%;
  height: 1px;
  pointer-events: none;
  visibility: hidden;
}
</style>
