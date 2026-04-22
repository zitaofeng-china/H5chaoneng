<template>
  <div class="rate-card">
    <!-- 实时汇率显示 -->
    <div class="rate-section">
      <div class="rate-main">
        <span class="rate-label-inline">{{ t('contract.realtimeRate') }}</span>
        <span class="rate-text" v-if="coin.toUpperCase() === 'USDT'">
          2 <span class="rate-unit">{{ t('common.usdt') }}</span>
          <span class="rate-symbol">≈</span>
          <span class="rate-value">{{ rate }}</span>
          <span class="rate-unit">{{ t('common.trx') }}</span>
        </span>
        <span class="rate-text" v-else>
          10 <span class="rate-unit">{{ coin.toUpperCase() }}</span>
          <span class="rate-symbol">≈</span>
          <span class="rate-value">{{ rate }}</span>
          <span class="rate-unit">{{ t('common.usdt') }}</span>
        </span>
      </div>
    </div>
    
    <!-- 交易说明 -->
    <div class="note-section">
      <div class="note-text">{{ t('contract.rateNote') }}</div>
      <div class="limits-row">
        <span class="limit-item">
          <span class="rate-unit">{{ t('common.usdt') }}</span> ≥ 2
        </span>
        <span class="limit-item">
          <span class="rate-unit">{{ t('common.trx') }}</span> ≥ 10
        </span>
      </div>
    </div>
    
    <!-- 剩余库存 -->
    <div class="stock-section">
      <span class="stock-label">{{ t('contract.remainingStock') }}</span>
      <span class="stock-value">{{ stock }}</span>
      <span class="rate-unit">{{
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
  padding: 16px;
  background: var(--theme-card-bg-light);
  border-radius: 4px;
  color: var(--theme-text-mute);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  // 实时汇率区域
  .rate-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .rate-main {
      display: flex;
      align-items: center;
      gap: 8px;

      .rate-label-inline {
        font-size: 13px;
        color: var(--theme-text-mute);
        font-weight: 500;
        white-space: nowrap;
      }

      .rate-text {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--theme-text-black);
        font-weight: 500;
      }

      .rate-unit {
        color: var(--theme-text-mute);
        font-weight: 400;
      }

      .rate-symbol {
        margin: 0 4px;
        color: var(--theme-text-mute);
      }

      .rate-value {
        color: var(--theme-bg-blue);
        font-weight: 600;
      }
    }
  }

  // 交易说明区域
  .note-section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .note-text {
      font-size: 13px;
      color: var(--theme-text-mute);
      line-height: 1.5;
    }

    .limits-row {
      display: flex;
      gap: 16px;

      .limit-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--theme-text-mute);

        .rate-unit {
          font-weight: 500;
        }
      }
    }
  }

  // 库存区域
  .stock-section {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--theme-text-mute);

    .stock-label {
      color: var(--theme-text-mute);
    }

    .stock-value {
      color: var(--theme-text-black);
      font-weight: 500;
    }

    .rate-unit {
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .rate-card {
    padding: 10px;
    gap: 12px;
    border-radius: 6px;

    // 实时汇率区域 - 移动端优化
    .rate-section {
      flex-direction: row;
      align-items: center;
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);

      .rate-main {
        flex-direction: row;
        align-items: center;
        gap: 6px;

        .rate-label-inline {
          font-size: 12px;
          font-weight: 500;
          color: var(--theme-text-mute);
        }

        .rate-text {
          font-size: 14px;
          gap: 3px;
          font-weight: 600;
        }

        .rate-unit {
          font-size: 13px;
        }

        .rate-symbol {
          margin: 0 3px;
          font-size: 13px;
        }

        .rate-value {
          font-size: 14px;
          color: var(--theme-bg-blue);
        }
      }
    }

    // 交易说明区域 - 移动端优化
    .note-section {
      gap: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);

      .note-text {
        font-size: 12px;
        line-height: 1.6;
        color: var(--theme-text-mute);
      }

      .limits-row {
        display: flex;
        gap: 20px;
        margin-top: 2px;

        .limit-item {
          font-size: 12px;
          gap: 3px;
          font-weight: 500;

          .rate-unit {
            font-weight: 600;
            color: var(--theme-text-black);
          }
        }
      }
    }

    // 库存区域 - 移动端优化
    .stock-section {
      gap: 5px;
      font-size: 12px;

      .stock-label {
        color: var(--theme-text-mute);
      }

      .stock-value {
        font-weight: 600;
        color: var(--theme-text-black);
      }

      .rate-unit {
        font-weight: 600;
        color: var(--theme-text-black);
      }
    }
  }
}
</style>
