<template>
  <section
    id="howItWorks"
    class="how-it-works"
    :class="{ 'is-ready': isReady, 'is-settled': isSettled }"
  >
    <div class="how-container">
      <header ref="headerRef" class="how-header">
        <h2 class="title">{{ t('home.howItWorks') }}</h2>
        <p class="subtitle">{{ t('home.howItWorksDesc') }}</p>
      </header>

      <div class="workflow-stage">
        <div class="workflow-top">
          <article class="workflow-primary">
            <h3>{{ t('home.energyQuickRental') }}</h3>
            <p>{{ t('home.energyQuickRentalDesc') }}</p>
            <img
              class="workflow-mark workflow-mark-pc"
              src="@/assets/images/home/lanhu/workflow-bolt.png"
              alt=""
              aria-hidden="true"
            />
            <img
              class="workflow-mark workflow-mark-mobile"
              src="@/assets/images/home/lanhu/workflow-bolt-mobile.png"
              alt=""
              aria-hidden="true"
            />
          </article>

          <ul class="workflow-points">
            <li
              v-for="(point, index) in pointKeys"
              :key="point"
              :style="{ '--delay': `${index * 220}ms` }"
            >
              <SvgIcon name="how-right" width="18" height="18" />
              <span>{{ t(point) }}</span>
            </li>
          </ul>
        </div>

        <div class="workflow-bottom">
          <div class="workflow-copy">
            <p
              v-for="(line, index) in copyKeys"
              :key="line"
              :style="{ '--delay': `${400 + index * 220}ms` }"
            >
              <SvgIcon name="how-right" width="16" height="16" />
              <span>{{ t(line) }}</span>
            </p>
          </div>

          <div class="workflow-secondary-stack">
            <article class="workflow-secondary">
              <h3>{{ t('home.smartContractFlash') }}</h3>
            </article>
            <p class="workflow-secondary-detail">{{ t('home.smartContractFlashDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'HowItWorks',
})

const headerRef = ref<HTMLElement | null>(null)
const isReady = ref(false)
const isSettled = ref(false)

const pointKeys = [
  'home.chooseTransactionCount',
  'home.transferToAddress',
  'home.systemAutoInject',
] as const

const copyKeys = ['home.usdtToTrx', 'home.trxToUsdt'] as const

let io: IntersectionObserver | null = null
let settleTimer = 0
let started = false

const markReady = () => {
  if (started) return
  started = true
  void nextTick(() => {
    requestAnimationFrame(() => {
      isReady.value = true
      settleTimer = window.setTimeout(() => {
        isSettled.value = true
      }, 1500)
    })
  })
}

onMounted(() => {
  const el = headerRef.value
  if (!el || typeof IntersectionObserver === 'undefined') {
    markReady()
    return
  }

  io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      markReady()
      io?.disconnect()
    },
    { threshold: 0.2, rootMargin: '0px' },
  )
  io.observe(el)
})

onUnmounted(() => {
  window.clearTimeout(settleTimer)
  io?.disconnect()
  io = null
})
</script>

<style lang="scss" scoped>
/**
 * 以 1200px 设计稿为基准整体等比缩放。
 * --u 表示「设计稿里的 1px」实际渲染多长：
 *   宽度 >= 1200px 时恒为 1px（还原设计稿）
 *   宽度 <  1200px 时随容器宽度线性缩小，版式比例与大屏完全一致
 * 因此 769px ~ 1200px 之间不再需要单独的中间态断点，
 * 只在 768px 及以下切换为移动端堆叠布局（与全站断点保持一致）。
 */
@function u($n) {
  @return calc(#{$n} * var(--u));
}

.how-it-works {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  /* 背景改由父级 .fee-workflow-ambient 统一绘制的环境光渐变提供，
     避免与“手续费说明”区块的背景在拼接处出现断层空白。 */
  background: transparent;
}

.how-container {
  /* 兜底：不支持容器查询单位时退化为视口宽度 */
  --u: calc(min(100vw, 1200px) / 1200);

  width: min(100%, 1200px);
  margin: 0 auto;
  padding: u(56) u(48) u(32);
  box-sizing: border-box;
}

@supports (width: 1cqw) {
  .how-container {
    --u: calc(min(100cqw, 1200px) / 1200);
  }
}

.how-header {
  text-align: center;
}

.title {
  margin: 0;
  color: #182230;
  font-size: u(36);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.04em;
}

.subtitle {
  max-width: u(780);
  margin: u(12) auto 0;
  color: #182230;
  font-size: u(14);
  font-weight: 700;
  line-height: 1.7;
}

.workflow-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: u(32);
  margin-top: u(56);
}

.workflow-top,
.workflow-bottom {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: u(440) minmax(0, 1fr);
  column-gap: u(80);
  align-items: center;
}

.workflow-bottom {
  align-items: start;
}

.workflow-primary {
  box-sizing: border-box;
  border-radius: u(16);
}

.workflow-secondary {
  box-sizing: border-box;
  border-radius: u(8);
}

.workflow-primary {
  position: relative;
  min-height: u(248);
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 3%;
  padding: u(48) u(42);
  color: #fff;
  background: #165dff;
  box-shadow: 0 u(18) u(30) rgba(22, 93, 255, 0.1);
}

.workflow-mark {
  position: absolute;
  pointer-events: none;
  user-select: none;
  object-fit: contain;
}

.workflow-mark-pc {
  left: u(48);
  bottom: u(36);
  width: u(28);
  height: auto;
  aspect-ratio: 45 / 61;
}

.workflow-mark-mobile {
  display: none;
}

.workflow-primary h3,
.workflow-secondary h3 {
  margin: 0;
  font-size: u(14);
  font-weight: 700;
  line-height: 1.45;
}

.workflow-primary p {
  margin: u(10) 0 0;
  color: #fff;
  font-size: u(14);
  font-weight: 700;
  line-height: 1.7;
}

.workflow-points {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: u(20);
  width: min(100%, u(400));
  padding: 0;
  margin: 0 0 0 u(92);
  list-style: none;
  justify-self: start;
}

.workflow-points li,
.workflow-copy p {
  display: flex;
  align-items: flex-start;
  gap: u(8);
  margin: 0;
  color: #182230;
  font-size: u(12);
  font-weight: 700;
  line-height: 1.65;
}

.workflow-points li {
  align-items: center;
}

.workflow-points svg {
  flex: 0 0 auto;
  width: u(18);
  height: u(18);
  color: #36c99b;
}

.workflow-copy {
  width: min(100%, u(440));
  padding: u(36) u(4) 0 u(126);
  display: flex;
  flex-direction: column;
  gap: u(18);
}

.workflow-copy span {
  max-width: 28em;
}

.workflow-copy svg {
  flex: 0 0 auto;
  width: u(16);
  height: u(16);
  margin-top: u(3);
  color: #4c8eff;
}

.workflow-secondary-stack {
  position: relative;
  width: min(100%, u(420));
  justify-self: end;
  margin-left: 0;
  margin-top: u(-40);
  padding-top: u(76);
}

.workflow-secondary {
  position: absolute;
  top: 0;
  right: u(10);
  z-index: 2;
  width: u(256);
  min-height: u(136);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 18% u(16) u(16);
  color: #fff;
  text-align: center;
  background: #0b1733;
  box-shadow: 0 u(16) u(28) rgba(10, 27, 69, 0.12);
}

.workflow-secondary-detail {
  box-sizing: border-box;
  min-height: u(216);
  margin: 0;
  padding: u(108) u(32) u(28);
  color: #182230;
  background: #f2f4f7;
  border-radius: u(8);
  font-size: u(14);
  font-weight: 700;
  line-height: 1.85;
}

.how-header {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 1.5s ease-in-out,
    transform 1.5s ease-in-out;
}

.workflow-primary {
  opacity: 0;
  transform: translateX(-24px);
  transition:
    opacity 1.5s ease-in-out,
    transform 1.5s ease-in-out,
    box-shadow 0.28s ease;
}

.workflow-points li,
.workflow-copy p {
  opacity: 0;
  transform: translateX(18px);
  transition:
    opacity 1.5s ease-in-out var(--delay, 0ms),
    transform 1.5s ease-in-out var(--delay, 0ms);
}

.workflow-secondary,
.workflow-secondary-detail {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 1.5s ease-in-out 0.2s,
    transform 1.5s ease-in-out 0.2s,
    box-shadow 0.28s ease;
}

.is-ready .how-header,
.is-ready .workflow-primary,
.is-ready .workflow-points li,
.is-ready .workflow-copy p,
.is-ready .workflow-secondary,
.is-ready .workflow-secondary-detail {
  opacity: 1;
  transform: none;
}

.is-settled .workflow-primary {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease;
}

.is-settled .workflow-primary:hover {
  transform: translateY(-6px);
  box-shadow: 0 u(22) u(36) rgba(22, 93, 255, 0.2);
}

.is-settled .workflow-points li,
.is-settled .workflow-copy p {
  cursor: default;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.25s ease;
}

.is-settled .workflow-points li:hover,
.is-settled .workflow-copy p:hover {
  transform: translateX(6px);
  color: #165dff;
}

.is-settled .workflow-points li:hover svg,
.is-settled .workflow-copy p:hover svg {
  transform: scale(1.12);
}

.workflow-points svg,
.workflow-copy svg {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.is-settled .workflow-secondary-stack {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.is-settled .workflow-secondary-stack:hover {
  transform: translateY(-5px);
}

.is-settled .workflow-secondary-stack:hover .workflow-secondary {
  box-shadow: 0 u(20) u(32) rgba(10, 27, 69, 0.2);
}

@media (prefers-reduced-motion: reduce) {
  .how-header,
  .workflow-primary,
  .workflow-points li,
  .workflow-copy p,
  .workflow-secondary,
  .workflow-secondary-detail,
  .is-ready .workflow-primary,
  .is-ready .workflow-points li,
  .is-ready .workflow-copy p,
  .is-settled .workflow-primary,
  .is-settled .workflow-points li,
  .is-settled .workflow-copy p,
  .is-settled .workflow-secondary-stack {
    opacity: 1;
    transform: none;
    transition: none;
    animation: none;
  }
}

@media (max-width: 768px) {
  .how-container {
    /* 移动端不再等比缩放，回到 1:1 的移动端设计值 */
    --u: 1px;

    padding: 48px 16px 52px;
  }

  .title {
    font-size: 24px;
    letter-spacing: 0;
  }

  .subtitle {
    margin-top: 9px;
    font-size: 14px;
  }

  .workflow-stage {
    gap: 18px;
    margin-top: 28px;
  }

  .workflow-mark-pc {
    display: none;
  }

  .workflow-mark-mobile {
    display: block;
    left: 26px;
    bottom: 24px;
    width: 18px;
    height: auto;
    aspect-ratio: 20 / 27;
  }

  .workflow-top,
  .workflow-bottom {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .workflow-primary,
  .workflow-secondary {
    width: 100%;
    min-height: 0;
    margin-left: 0;
    padding: 24px 20px;
  }

  .workflow-primary {
    padding-bottom: 44px;
  }

  .workflow-primary h3,
  .workflow-secondary h3 {
    font-size: 14px;
  }

  .workflow-points {
    width: 100%;
    margin-left: 0;
    gap: 12px;
  }

  .workflow-points li,
  .workflow-copy p {
    font-size: 12px;
  }

  .workflow-copy {
    width: 100%;
    padding: 0;
  }

  .workflow-copy span {
    max-width: none;
  }

  .workflow-secondary-stack {
    width: 100%;
    margin-left: 0;
    margin-top: 0;
    padding-top: 0;
  }

  .workflow-secondary {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    min-height: 0;
    margin-bottom: 10px;
  }

  .workflow-secondary-detail {
    min-height: 0;
    padding: 20px;
    font-size: 14px;
  }
}
</style>
