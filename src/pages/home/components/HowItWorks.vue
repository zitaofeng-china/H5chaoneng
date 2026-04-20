<template>
  <section id="howItWorks" class="how-it-works">
    <div class="container">
      <div class="header">
        <div class="title">{{ t('home.howItWorks') }}</div>
        <p class="subtitle">
          {{ t('home.howItWorksDesc') }}
        </p>
      </div>

      <div class="cards">
        <div class="card">
          <div class="card-title">{{ t('home.energyQuickRental') }}</div>
          <p class="card-description">
            {{ t('home.energyQuickRentalDesc') }}
          </p>
          <ul class="list">
            <li class="list-item">
              <SvgIcon name="how-right" width="20" height="20" />
              <span class="text">{{ t('home.chooseTransactionCount') }}</span>
            </li>
            <li class="list-item">
              <SvgIcon name="how-right" width="20" height="20" />
              <span class="text">{{ t('home.transferToAddress') }}</span>
            </li>
            <li class="list-item">
              <SvgIcon name="how-right" width="20" height="20" />
              <span class="text">{{ t('home.systemAutoInject') }}</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <div class="card-title">{{ t('home.smartContractFlash') }}</div>
          <p class="card-description">
            {{ t('home.smartContractFlashDesc') }}
          </p>
          <ul class="list">
            <li class="list-item">
              <SvgIcon name="how-right" width="20" height="20" />
              <span class="text">
                {{ t('home.usdtToTrx') }}
              </span>
            </li>
            <li class="list-item">
              <SvgIcon name="how-right" width="20" height="20" />
              <span class="text">
                {{ t('home.trxToUsdt') }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'HowItWorks',
})
</script>

<style lang="scss" scoped>
.how-it-works {
  padding: 100px 0;
  background: var(--theme-text-white);
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
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  color: var(--theme-text-black);
}

.subtitle {
  margin: 14px auto 0;
  font-size: 14px;
  color: var(--theme-text-black);
  opacity: 0.8;
}

.cards {
  margin-top: 56px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.card {
  background: var(--theme-card-bg-light);
  border-radius: 8px;
  padding: 32px;

  &:first-child {
    svg {
      color: var(--theme-text-green);
    }
  }

  &:last-child {
    svg {
      color: var(--theme-bg-blue);
    }
  }
}

.card-title {
  line-height: 1.7;
  font-size: 20px;
  font-weight: 700;
  color: var(--theme-text-black);
}

.card-description {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--theme-text-muted);
}

.list {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bullet {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;

  &::after {
    content: '✓';
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    color: var(--theme-text-white);
  }
}

.bullet-green {
  background: var(--theme-text-green);
}

.bullet-blue {
  background: var(--theme-bg-blue);
}

.text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--theme-text-muted);
}

@media (max-width: 768px) {
  .container {
    padding: 0 6px;
  }

  .how-it-works {
    padding: 40px 0;
  }

  .title {
    font-size: 20px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 13px;
    margin-top: 10px;
    line-height: 1.5;
  }

  .cards {
    margin-top: 20px;
    gap: 20px;
  }

  .card {
    padding: 18px;
    border-radius: 10px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .card-description {
    font-size: 13px;
    margin-top: 8px;
    line-height: 1.5;
  }

  .list {
    margin-top: 12px;
    gap: 8px;
  }

  .list-item {
    gap: 8px;

    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  }

  .text {
    font-size: 13px;
    line-height: 1.5;
  }
}
</style>
