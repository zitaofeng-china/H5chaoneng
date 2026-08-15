<template>
  <section id="feature" class="why-choose-us">
    <header class="feature-header">
      <h2 class="title">{{ t('home.whyChooseUs') }}</h2>
      <p class="subtitle">{{ t('home.subtitle') }}</p>
    </header>

    <div class="feature-container">
      <div class="feature-showcase">
        <div class="token-art" aria-hidden="true">
          <div class="token-art-stage">
            <img
              class="token-art-glow"
              src="@/assets/images/home/lanhu/feature-bg.png"
              alt=""
            />
            <img
              class="token-art-usdt"
              src="@/assets/images/home/lanhu/feature-inner-bg.png"
              alt=""
            />
            <img
              class="token-art-trx"
              src="@/assets/images/home/lanhu/feature-coin.png"
              alt=""
            />
          </div>
        </div>

        <div class="feature-list">
          <span class="feature-frame" aria-hidden="true"></span>
          <article
            v-for="(item, index) in items"
            :key="item.key"
            class="feature-item"
            :class="{ featured: index === 0 }"
          >
            <span class="feature-dot" :class="`tone-${index + 1}`"></span>
            <div class="feature-copy">
              <h3>{{ t(item.titleKey) }}</h3>
              <p>{{ t(item.descKey) }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'WhyChooseUs',
})

type Item = {
  key: string
  titleKey: string
  descKey: string
}

const items: Item[] = [
  {
    key: 'safe',
    titleKey: 'home.safeAndReliable',
    descKey: 'home.safeAndReliableDesc',
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
  padding: 48px 0 56px;
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

.feature-showcase {
  display: grid;
  grid-template-columns: 60.5% 39.5%;
  align-items: start;
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

.feature-list {
  --frame: #8eb4ff;
  --rail: 8px;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 560px;
  padding: 40px 32px 44px var(--rail);
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
  padding: 0;
}

.feature-dot {
  width: 11px;
  height: 11px;
  margin-top: 3px;
  margin-left: -5.5px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  background: #fff;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.feature-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.tone-1 {
  color: #5b8cff;
}

.tone-2 {
  color: #e8b84a;
}

.tone-3 {
  color: #f0a090;
}

.tone-4 {
  color: #c4a8e8;
}

.tone-5 {
  color: #e8a0b8;
}

.tone-6 {
  color: #e8d07a;
}

.feature-copy {
  max-width: 300px;
}

.feature-copy h3 {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.feature-copy p {
  margin: 4px 0 0;
  color: rgba(71, 84, 103, 0.55);
  font-size: 12px;
  line-height: 1.65;
}

.feature-item.featured .feature-copy h3,
.feature-item.featured .feature-copy p {
  color: #4a7dff;
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
  .why-choose-us {
    padding: 40px 0 32px;
  }

  .feature-container {
    padding: 0 16px;
  }

  .feature-header {
    padding: 0;
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    margin-top: 8px;
    font-size: 12px;
  }

  .feature-showcase {
    display: block;
  }

  .token-art {
    width: min(100%, 360px);
    min-height: 280px;
    margin: 0 auto 8px;
  }

  .token-art-stage {
    width: 100%;
    margin-left: 0;
  }

  .feature-list {
    min-height: 0;
    margin-top: 8px;
    padding: 22px 18px 24px var(--rail);
    gap: 18px;
    justify-content: flex-start;
  }

  .feature-copy {
    max-width: none;
  }

  .feature-copy h3 {
    font-size: 14px;
  }

  .feature-copy p {
    font-size: 11px;
    line-height: 1.55;
  }
}
</style>
