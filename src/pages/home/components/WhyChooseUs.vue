<template>
  <section
    id="feature"
    class="why-choose-us"
    :class="{ 'is-ready': isReady, 'is-settled': isSettled }"
  >
    <header ref="headerRef" class="feature-header">
      <div class="header-token" aria-hidden="true">
        <img class="header-token-badge" :src="featureHeaderBadge" alt="" />
      </div>
      <div class="header-copy">
        <h2 class="title">{{ t('home.whyChooseUs') }}</h2>
        <p class="subtitle">{{ t('home.subtitle') }}</p>
      </div>
    </header>

    <div class="feature-container">
      <div class="feature-showcase">
        <div class="token-art" aria-hidden="true">
          <div class="token-art-stage">
            <img class="token-art-glow" :src="featureGlow" alt="" />
            <img class="token-art-usdt" :src="featureUsdt" alt="" />
            <img class="token-art-trx" :src="featureTrx" alt="" />
          </div>
        </div>

        <div class="feature-list" @mouseleave="hoveredIndex = null">
          <span class="feature-frame" aria-hidden="true"></span>
          <article
            v-for="(item, index) in items"
            :key="item.key"
            class="feature-item"
            :class="{ featured: featuredIndex === index }"
            :style="{ '--delay': `${index * 220}ms` }"
            @mouseenter="hoveredIndex = index"
            @focusin="hoveredIndex = index"
            @click="hoveredIndex = index"
          >
            <span class="feature-dot" :class="`tone-${index + 1}`">
              <img class="feature-dot-icon" :src="featureIcons[index]" alt="" />
            </span>
            <div class="feature-copy">
              <h3>{{ t(item.titleKey) }}</h3>
              <p>
                <span class="desc-desktop">{{ t(item.descKey) }}</span>
                <span class="desc-mobile">{{ t(item.descKeyMobile ?? item.descKey) }}</span>
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import featureHeaderBadge from '@/assets/images/home/lanhu/feature-header-badge.png'
import featureGlow from '@/assets/images/home/lanhu/feature-bg.png'
import featureUsdt from '@/assets/images/home/lanhu/feature-inner-bg.png'
import featureTrx from '@/assets/images/home/lanhu/feature-coin.png'
import featureContractIcon from '@/assets/images/home/lanhu/feature-icon-contract.png'
import featureFastIcon from '@/assets/images/home/lanhu/feature-icon-fast.png'
import featureLowCostIcon from '@/assets/images/home/lanhu/feature-icon-low-cost.png'
import featureSafeIcon from '@/assets/images/home/lanhu/feature-icon-safe.png'
import featureSupportIcon from '@/assets/images/home/lanhu/feature-icon-support.png'
import featureTransparentIcon from '@/assets/images/home/lanhu/feature-icon-transparent.png'

const { t } = useI18n()
const headerRef = ref<HTMLElement | null>(null)
const isReady = ref(false)
const isSettled = ref(false)
const hoveredIndex = ref<number | null>(null)
const featuredIndex = computed(() => hoveredIndex.value ?? 0)

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

const featureIcons = [
  featureSafeIcon,
  featureFastIcon,
  featureLowCostIcon,
  featureContractIcon,
  featureTransparentIcon,
  featureSupportIcon,
]

defineOptions({
  name: 'WhyChooseUs',
})

type Item = {
  key: string
  titleKey: string
  descKey: string
  descKeyMobile?: string
}

const items: Item[] = [
  {
    key: 'safe',
    titleKey: 'home.safeAndReliable',
    descKey: 'home.safeAndReliableDesc',
    descKeyMobile: 'home.safeAndReliableDescMobile',
  },
  {
    key: 'fast',
    titleKey: 'home.fastExchange',
    descKey: 'home.fastExchangeDesc',
  },
  {
    key: 'low',
    titleKey: 'home.lowCost',
    descKey: 'home.lowCostDesc',
  },
  {
    key: 'contract',
    titleKey: 'home.smartContract',
    descKey: 'home.smartContractDesc',
  },
  {
    key: 'transparent',
    titleKey: 'home.transparent',
    descKey: 'home.transparentDesc',
  },
  {
    key: 'support',
    titleKey: 'home.support247',
    descKey: 'home.support247Desc',
  },
]
</script>

<style lang="scss" scoped>
.why-choose-us {
  overflow: hidden;
  background: #fff;
  padding: 64px 0 67px;
  scroll-margin-top: 80px;
}

.feature-container {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 17.3% 0 0;
  box-sizing: border-box;
}

.feature-header {
  width: min(100%, 1440px);
  margin: 0 auto 20px;
  padding: 0 24px;
  text-align: center;
  box-sizing: border-box;
}

.title {
  margin: 0;
  color: #182230;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
}

.subtitle {
  max-width: 640px;
  margin: 8px auto 0;
  color: rgba(71, 84, 103, 0.58);
  font-size: 12px;
  line-height: 1.6;
}

.header-token {
  display: none;
}

.desc-mobile {
  display: none;
}

.feature-showcase {
  display: grid;
  grid-template-columns: 60.5% 39.5%;
  align-items: end;
  min-height: 560px;
}

.token-art {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 560px;
  padding-top: 12px;
  overflow: visible;
}

.token-art-stage {
  position: relative;
  width: 88%;
  max-width: none;
  margin-left: -2%;
  aspect-ratio: 896 / 891;
}

.token-art-stage img {
  position: absolute;
  display: block;
  height: auto;
  pointer-events: none;
  user-select: none;
}

.token-art-glow {
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100% !important;
  object-fit: fill;
}

.token-art-usdt {
  z-index: 2;
  top: 3.25%;
  left: 46.65%;
  width: 39.62%;
}

.token-art-trx {
  z-index: 3;
  top: 30.3%;
  left: 70.42%;
  width: 25.56%;
  transform: translateY(-10px);
}

.feature-header {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 1.5s ease-in-out,
    transform 1.5s ease-in-out;
}

.token-art {
  opacity: 0;
  transform: translateX(-24px);
  transition:
    opacity 1.5s ease-in-out,
    transform 1.5s ease-in-out;
}

.is-ready .feature-header,
.is-ready .token-art {
  opacity: 1;
  transform: none;
}

.is-ready .token-art-glow {
  animation: feature-glow-pulse 6s ease-in-out infinite;
}

.is-ready .token-art-usdt {
  animation: feature-usdt-float 5.2s ease-in-out infinite;
}

.is-ready .token-art-trx {
  animation: feature-trx-float 4.6s ease-in-out 0.35s infinite;
}

.feature-list {
  --frame: #8eb4ff;
  --rail: 8px;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 560px;
  padding: 0 32px 0 var(--rail);
  background: transparent;
  border: 0;
  box-sizing: border-box;
}

.feature-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.feature-frame::before,
.feature-frame::after {
  content: '';
  position: absolute;
  left: 0;
  right: 8px;
  height: 1px;
}

.feature-frame::before {
  top: 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    transparent 45%,
    color-mix(in srgb, var(--frame) 35%, transparent) 54%,
    var(--frame) 68%,
    var(--frame) 100%
  );
}

.feature-frame::after {
  bottom: 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    transparent 30%,
    color-mix(in srgb, var(--frame) 35%, transparent) 40%,
    var(--frame) 54%,
    var(--frame) 100%
  );
}

.feature-list::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 9px;
  border: 1px solid var(--frame);
  border-left: 0;
  border-radius: 0 8px 8px 0;
  pointer-events: none;
}

.feature-list::after {
  content: '';
  position: absolute;
  left: var(--rail);
  top: 15%;
  bottom: 15%;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--frame) 22%,
    var(--frame) 78%,
    transparent 100%
  );
  pointer-events: none;
}

.feature-item {
  position: relative;
  display: grid;
  grid-template-columns: 0 minmax(0, 1fr);
  column-gap: 26px;
  padding: 30px 0;
  cursor: pointer;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 1.5s ease-in-out var(--delay, 0ms),
    transform 1.5s ease-in-out var(--delay, 0ms);
}

.is-ready .feature-item {
  opacity: 1;
  transform: none;
}

.feature-dot {
  display: grid;
  width: 32px;
  height: 32px;
  margin-top: -6px;
  margin-left: -16px;
  border-radius: 50%;
  place-items: center;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease;
}

.feature-item.featured .feature-dot {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(74, 125, 255, 0.18);
}

.feature-dot-icon {
  display: block;
  max-width: 20px;
  max-height: 20px;
}

.tone-1 {
  background: #dbeafe;
}

.tone-2 {
  background: rgba(220, 252, 231, 0.5);
}

.tone-3 {
  background: rgba(255, 237, 213, 0.5);
}

.tone-4 {
  background: rgba(243, 232, 255, 0.5);
}

.tone-5 {
  background: rgba(254, 226, 226, 0.5);
}

.tone-6 {
  background: rgba(254, 249, 195, 0.5);
}

.feature-copy {
  max-width: 300px;
}

.feature-copy h3 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  transition: color 0.28s ease;
}

.feature-copy p {
  margin: 4px 0 0;
  color: rgba(71, 84, 103, 0.55);
  font-size: 12px;
  line-height: 1.65;
  transition: color 0.28s ease;
}

.feature-item.featured .feature-copy h3,
.feature-item.featured .feature-copy p {
  color: #4a7dff;
}

@keyframes feature-glow-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.78;
  }
}

@keyframes feature-usdt-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(-1.4deg);
  }
}

@keyframes feature-trx-float {
  0%,
  100% {
    transform: translateY(-10px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(1.6deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-header,
  .token-art,
  .feature-item,
  .feature-dot,
  .feature-copy h3,
  .feature-copy p {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .is-ready .token-art-glow,
  .is-ready .token-art-usdt,
  .is-ready .token-art-trx {
    animation: none;
  }

  .token-art-trx {
    transform: translateY(-10px);
  }
}

@media (max-width: 1200px) and (min-width: 769px) {
  .feature-container {
    padding: 0 48px 0 24px;
  }

  .feature-showcase {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 42%);
  }

  .token-art {
    padding-top: 0;
  }

  .token-art-stage {
    width: 100%;
    margin-left: 0;
  }

  .feature-list {
    min-height: 500px;
    padding: 28px 22px 32px var(--rail);
  }
}

@media (max-width: 768px) {
  /* 蓝湖 375 稿：币标 71×70，文案 291×58 从 x=42 叠入，底对齐。 */
  .feature-header,
  .feature-item {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .why-choose-us {
    overflow: visible;
    padding: 28px 0 32px;
  }

  .feature-container {
    padding: 0 12px;
  }

  /* 蓝湖 375：image32 71×70 @x=0；文案框 291×58 @x=42 底对齐，标题/副标题在框内居中。 */
  .feature-header {
    display: flex;
    align-items: flex-end;
    position: relative;
    gap: 0;
    width: 100%;
    height: 70px;
    margin: 0 0 18px;
    padding: 0 12px 0 0;
    box-sizing: border-box;
    text-align: left;
  }

  .header-token {
    display: block;
    flex: 0 0 71px;
    width: 71px;
    height: 70px;
    margin-right: -29px;
    overflow: visible;
    pointer-events: none;
    z-index: 0;
  }

  .header-token-badge {
    display: block;
    width: 71px;
    height: 70px;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }

  .header-copy {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: space-between;
    width: 291px;
    max-width: 291px;
    min-width: 0;
    height: 58px;
    z-index: 1;
  }

  .title {
    margin: 0;
    color: rgb(30, 41, 59);
    font-size: 24px;
    font-weight: 900;
    line-height: 24px;
    text-align: center;
    white-space: nowrap;
  }

  .subtitle {
    max-width: none;
    margin: 0;
    color: rgba(96, 96, 96, 0.8);
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;
    text-align: center;
  }

  .feature-showcase {
    display: block;
    min-height: 0;
  }

  .token-art {
    display: none;
  }

  .feature-list {
    --rail: 0px;
    min-height: 0;
    margin-top: 0;
    padding: 0;
    gap: 28px;
    justify-content: flex-start;
  }

  .feature-frame,
  .feature-list::before,
  .feature-list::after {
    content: none;
    display: none;
  }

  .feature-item {
    padding: 0;
    grid-template-columns: 32px minmax(0, 1fr);
    column-gap: 12px;
  }

  .feature-dot {
    width: 32px;
    height: 32px;
    margin: 0;
  }

  .feature-item.featured .feature-dot {
    transform: none;
    box-shadow: none;
  }

  .feature-dot-icon {
    max-width: 18px;
    max-height: 18px;
  }

  .feature-copy {
    max-width: none;
  }

  .feature-copy h3 {
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    color: #1e293b;
  }

  .feature-copy p {
    margin-top: 4px;
    color: #667085;
    font-size: 12px;
    line-height: 18px;
  }

  .feature-item.featured .feature-copy h3 {
    color: #1e293b;
  }

  .feature-item.featured .feature-copy p {
    color: #165dff;
  }

  .desc-desktop {
    display: none;
  }

  .desc-mobile {
    display: inline;
  }
}
</style>
