<template>
  <section id="feature" class="why-choose-us">
    <div class="feature-container">
      <header class="feature-header">
        <h2 class="title">{{ t('home.whyChooseUs') }}</h2>
        <p class="subtitle">{{ t('home.subtitle') }}</p>
      </header>

      <div class="feature-showcase">
        <div class="token-art" aria-hidden="true">
          <span class="feature-visual feature-visual-base"></span>
          <span class="feature-visual feature-visual-inner"></span>
          <span class="feature-visual feature-visual-token"></span>
        </div>

        <div class="feature-list">
          <article v-for="(item, index) in items" :key="item.key" class="feature-item">
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
  padding: 72px 0 8px;
}

.feature-container {
  width: min(100%, 1360px);
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.feature-header {
  text-align: center;
  margin-bottom: 28px;
}

.title {
  margin: 0;
  color: #182230;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
}

.subtitle {
  max-width: 720px;
  margin: 12px auto 0;
  color: rgba(71, 84, 103, 0.72);
  font-size: 13px;
  line-height: 1.7;
}

.feature-showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 560px);
  align-items: center;
  gap: 8px 12px;
}

.token-art {
  position: relative;
  width: 100%;
  max-width: 720px;
  aspect-ratio: 896 / 780;
  margin-left: -6%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, #000 78%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 78%, transparent 100%);
}

.feature-visual {
  position: absolute;
  display: block;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  pointer-events: none;
}

.feature-visual-base {
  top: -6%;
  left: -4%;
  width: 118%;
  height: 128%;
  background-image: url('@/assets/images/home/lanhu/feature-bg.png');
}

.feature-visual-inner {
  top: 4%;
  left: 42%;
  width: 46%;
  height: 52%;
  background-image: url('@/assets/images/home/lanhu/feature-inner-bg.png');
}

.feature-visual-token {
  top: 32%;
  left: 16%;
  width: 30%;
  height: 34%;
  background-image: url('@/assets/images/home/lanhu/feature-coin.png');
}

.feature-list {
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 28px 36px;
  background: #fff;
  border: 1px solid rgba(22, 93, 255, 0.42);
  border-radius: 4px;
  box-sizing: border-box;
}

.feature-item {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  gap: 12px;
  padding: 16px 0;

  & + .feature-item {
    border-top: 1px solid rgba(224, 229, 236, 0.62);
  }
}

.feature-dot {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 12%, transparent);
}

.tone-1 {
  color: #2588ff;
  background: #2588ff;
}

.tone-2 {
  color: #ffb547;
  background: #ffb547;
}

.tone-3 {
  color: #ff7b6b;
  background: #ff7b6b;
}

.tone-4 {
  color: #a27cff;
  background: #a27cff;
}

.tone-5 {
  color: #f06a9a;
  background: #f06a9a;
}

.tone-6 {
  color: #f0b735;
  background: #f0b735;
}

.feature-copy h3 {
  margin: 0;
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.feature-copy p {
  margin: 5px 0 0;
  color: rgba(71, 84, 103, 0.68);
  font-size: 12px;
  line-height: 1.65;
}

@media (max-width: 1200px) and (min-width: 769px) {
  .feature-container {
    padding: 0 32px;
  }

  .feature-showcase {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 48%);
  }

  .token-art {
    margin-left: -4%;
  }

  .feature-list {
    padding: 22px 24px;
  }

  .feature-item {
    gap: 11px;
    padding: 13px 0;
  }

  .feature-copy h3 {
    font-size: 14px;
  }

  .feature-copy p {
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .why-choose-us {
    padding: 48px 0 8px;
  }

  .feature-container {
    padding: 0 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.6;
  }

  .feature-showcase {
    display: block;
    margin-top: 12px;
  }

  .token-art {
    width: min(100%, 340px);
    margin: 0 auto;
  }

  .feature-list {
    margin-top: 8px;
    padding: 16px 18px;
    border: 1px solid rgba(2, 15, 45, 0.06);
  }

  .feature-item {
    grid-template-columns: 10px minmax(0, 1fr);
    gap: 10px;
    padding: 11px 0;
  }

  .feature-copy h3 {
    font-size: 14px;
  }

  .feature-copy p {
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.55;
  }
}
</style>
