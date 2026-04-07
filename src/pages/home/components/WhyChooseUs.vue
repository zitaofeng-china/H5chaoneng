<template>
  <section id="feature" class="why-choose-us">
    <div class="container">
      <div class="header">
        <h2 class="title">{{ t('home.whyChooseUs') }}</h2>
        <p class="subtitle">
          {{ t('home.subtitle') }}
        </p>
      </div>

      <div class="grid">
        <div v-for="item in items" :key="item.key" class="card">
          <div class="icon">
            <SvgIcon :name="`choose-${item.icon}`" width="56" height="56" />
          </div>

          <div class="card-title">{{ t(item.titleKey) }}</div>
          <div class="card-desc">{{ t(item.descKey) }}</div>
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
  icon: 'shield' | 'bolt' | 'coins' | 'code' | 'eye' | 'headset'
}

const items: Item[] = [
  {
    key: 'safe',
    titleKey: 'home.safeAndReliable',
    descKey: 'home.safeAndReliableDesc',
    icon: 'shield',
  },
  {
    key: 'fast',
    titleKey: 'home.fastExchange',
    descKey: 'home.fastExchangeDesc',
    icon: 'bolt',
  },
  {
    key: 'low',
    titleKey: 'home.lowCost',
    descKey: 'home.lowCostDesc',
    icon: 'coins',
  },
  {
    key: 'contract',
    titleKey: 'home.smartContract',
    descKey: 'home.smartContractDesc',
    icon: 'code',
  },
  {
    key: 'transparent',
    titleKey: 'home.transparent',
    descKey: 'home.transparentDesc',
    icon: 'eye',
  },
  {
    key: 'support',
    titleKey: 'home.support247',
    descKey: 'home.support247Desc',
    icon: 'headset',
  },
]
</script>

<style lang="scss" scoped>
.why-choose-us {
  background: var(--theme-bg-light);
  padding: 20px 0 100px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.header {
  text-align: center;
}

.title {
  font-size: 40px;
  font-weight: 700;
  color: var(--theme-text-black);
  margin: 0;
}

.subtitle {
  margin: 14px auto 0;
  max-width: 820px;
  font-size: 14px;
  color: var(--theme-text-muted);
}

.grid {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.card {
  background: var(--theme-text-white);
  border-radius: 14px;
  padding: 26px;
  box-shadow: 0px 13px 22px 0px var(--theme-shadow-strong);
  border: 1px solid var(--theme-border-light);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 18px 28px 0px var(--theme-shadow-strong-hover);
  }
}

.icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  margin-top: 18px;
  font-size: 18px;
  font-weight: 700;
  color: var(--theme-text-black);
}

.card-desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--theme-text-muted);
}

.icon-blue {
  background: var(--theme-choose-blue-bg);
  color: var(--theme-choose-blue);
}

.icon-green {
  background: var(--theme-choose-green-bg);
  color: var(--theme-choose-green);
}

.icon-orange {
  background: var(--theme-choose-orange-bg);
  color: var(--theme-choose-orange);
}

.icon-purple {
  background: var(--theme-choose-purple-bg);
  color: var(--theme-choose-purple);
}

.icon-red {
  background: var(--theme-choose-red-bg);
  color: var(--theme-choose-red);
}

.icon-yellow {
  background: var(--theme-choose-yellow-bg);
  color: var(--theme-choose-yellow);
}

@media (max-width: 992px) {
  .container {
    padding: 0 20px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .why-choose-us {
    padding: 20px 0;
  }

  .title {
    font-size: 24px;
  }

  .grid {
    margin-top: 24px;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .card {
    padding: 20px;
  }
}
</style>
