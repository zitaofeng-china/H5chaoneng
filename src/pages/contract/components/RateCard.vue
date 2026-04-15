<template>
  <div class="rate-card">
    <div class="rate-item">
      <span class="rate-coin" v-if="coin.toUpperCase() === 'USDT'">
        2<span class="rate-coin-symbol">{{ t('common.usdt') }}≈{{ rate }}</span>
        <span class="rate-coin-symbol">{{ t('common.trx') }}</span>
      </span>
      <span class="rate-coin" v-else>
        10<span class="rate-coin-symbol">{{ coin.toUpperCase() }}≈{{ rate }}</span>
        <span class="rate-coin-symbol">{{ t('common.usdt') }}</span>
      </span>
      <div class="rate-label">{{ t('contract.realtimeRate') }}</div>
    </div>
    <div class="rate-item">
      {{ t('contract.rateNote') }}
      <span class="rate-desc-coin">{{ t('common.usdt') }}</span> ≥ 10
      <span class="rate-desc-coin">{{ t('common.trx') }}</span> ≥ 30
    </div>
    <div class="rate-item">
      {{ t('contract.remainingStock') }}{{ stock }}
      <span class="rate-coin-symbol">{{
        coin.toUpperCase() === 'USDT' ? t('common.trx') : t('common.usdt')
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({ name: 'RateCard' })

interface Props {
  coin: string
  rate?: string
  stock?: string
}

withDefaults(defineProps<Props>(), {
  coin: 'USDT',
  rate: '6.34',
  stock: '34430.21964',
})
</script>

<style scoped lang="scss">
.rate-card {
  padding: 12px;
  background: var(--theme-card-bg-light);
  border-radius: 4px;
  color: var(--theme-text-mute);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .rate-item {
    display: flex;
    align-items: center;
  }

  .rate-label {
    margin-left: 12px;
    font-size: 12px;
    color: var(--theme-text-light-gray-muted);
  }

  .rate-desc-coin {
    margin-left: 15px;
    margin-right: 5px;
  }

  .rate-coin-symbol {
    padding-left: 10px;
  }
}

@media (max-width: 768px) {
  .rate-card {
    .rate-item {
      &:nth-of-type(2) {
        display: initial;
      }
    }
  }
}
</style>
