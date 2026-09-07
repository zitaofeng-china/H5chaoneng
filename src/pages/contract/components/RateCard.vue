<template>
  <div class="rate-card">
    <!-- 实时汇率头部与状态指示 -->
    <div class="rate-header">
      <div class="rate-header-left">
        <span class="live-pill">
          <span class="live-pulse"></span>
          <span class="live-text">{{ t('contract.liveRateTag') }}</span>
        </span>
        <span class="rate-label-inline">{{ t('contract.realtimeRate') }}</span>
      </div>
      <div class="rate-header-right">
        <span class="slippage-badge">{{ t('contract.lowSlippage') }}</span>
      </div>
    </div>

    <!-- 汇率主体展示 -->
    <div class="rate-body">
      <div class="rate-main" v-if="coin.toUpperCase() === 'USDT'">
        <div class="rate-unit-row">
          <span class="base-amount">1</span>
          <span class="token-sym">{{ t('common.usdt') }}</span>
          <span class="rate-eq">≈</span>
          <span class="rate-val">{{ unitRate }}</span>
          <span class="target-sym">{{ t('common.trx') }}</span>
        </div>
        <div class="rate-threshold-tip">
          ({{ formatCryptoAmount(2) }} {{ t('common.usdt') }} ≈ {{ displayRate }} {{ t('common.trx') }})
        </div>
      </div>
      <div class="rate-main" v-else>
        <div class="rate-unit-row">
          <span class="base-amount">1</span>
          <span class="token-sym">{{ coin.toUpperCase() }}</span>
          <span class="rate-eq">≈</span>
          <span class="rate-val">{{ unitRate }}</span>
          <span class="target-sym">{{ t('common.usdt') }}</span>
        </div>
        <div class="rate-threshold-tip">
          ({{ formatCryptoAmount(10) }} {{ coin.toUpperCase() }} ≈ {{ displayRate }} {{ t('common.usdt') }})
        </div>
      </div>
    </div>
    
    <!-- 交易说明与限额胶囊 -->
    <div class="note-section">
      <div class="note-text">{{ t('contract.rateNote') }}</div>
      <div class="limits-row">
        <span class="limit-item">
          <SvgIcon name="header-USDT" width="13" height="13" />
          <span class="rate-unit">{{ t('common.usdt') }}</span>
          <span class="limit-val">≥ {{ formatCryptoAmount(2) }}</span>
        </span>
        <span class="limit-item">
          <SvgIcon name="trx" width="13" height="13" />
          <span class="rate-unit">{{ t('common.trx') }}</span>
          <span class="limit-val">≥ {{ formatCryptoAmount(10) }}</span>
        </span>
      </div>
    </div>
    
    <!-- 剩余库存深度 -->
    <div class="stock-section">
      <div class="stock-left">
        <span class="stock-label">{{ t('contract.remainingStock') }}</span>
        <span class="stock-value">{{ displayStock }}</span>
        <span class="rate-unit">{{
          coin.toUpperCase() === 'USDT' ? t('common.trx') : t('common.usdt')
        }}</span>
      </div>
      <div class="stock-right">
        <span class="depth-badge">
          <span class="depth-dot"></span>
          {{ t('contract.poolDepth') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCryptoAmount } from '@/utils/number'

const { t } = useI18n()

defineOptions({ name: 'RateCard' })

interface Props {
  coin: string
  rate?: string
  stock?: string
}

const props = withDefaults(defineProps<Props>(), {
  coin: 'USDT',
  rate: '6.34',
  stock: '34430.21964',
})

const displayRate = computed(() => formatCryptoAmount(props.rate))
const displayStock = computed(() => formatCryptoAmount(props.stock))

// 基准单价（1 单位计算）
const unitRate = computed(() => {
  const numRate = Number(props.rate) || 0
  const divisor = props.coin.toUpperCase() === 'USDT' ? 2 : 10
  return formatCryptoAmount(numRate / divisor)
})
</script>

<style scoped lang="scss">
@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.rate-card {
  padding: 14px 18px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  border-radius: var(--theme-radius-md, 6px);
  box-shadow: var(--theme-shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.04));
  color: var(--theme-text-mute);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  // 头部状态
  .rate-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .rate-header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .live-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 7px;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);

        .live-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-ring 1.8s infinite;
        }

        .live-text {
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          letter-spacing: 0.2px;
        }
      }

      .rate-label-inline {
        font-size: 12px;
        color: #64748b;
        font-weight: 600;
      }
    }

    .rate-header-right {
      .slippage-badge {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        background: rgba(15, 23, 42, 0.04);
        border: 1px solid rgba(226, 232, 240, 0.8);
        padding: 2px 8px;
        border-radius: 4px;
      }
    }
  }

  // 汇率数值主体
  .rate-body {
    .rate-main {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .rate-unit-row {
        display: flex;
        align-items: baseline;
        gap: 5px;
        font-variant-numeric: tabular-nums;

        .base-amount {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .token-sym {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }

        .rate-eq {
          font-size: 15px;
          font-weight: 600;
          color: #94a3b8;
          margin: 0 2px;
        }

        .rate-val {
          font-size: 22px;
          font-weight: 800;
          color: #10b981;
          letter-spacing: -0.5px;
        }

        .target-sym {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
      }

      .rate-threshold-tip {
        font-size: 11px;
        color: #94a3b8;
        font-variant-numeric: tabular-nums;
      }
    }
  }

  // 交易说明区域
  .note-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px dashed rgba(226, 232, 240, 0.9);

    .note-text {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }

    .limits-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .limit-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: #334155;
        background: #ffffff;
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        font-weight: 600;
        font-variant-numeric: tabular-nums;

        .rate-unit {
          font-weight: 700;
          color: #0f172a;
        }

        .limit-val {
          color: #475569;
        }
      }
    }
  }

  // 库存区域
  .stock-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px dashed rgba(226, 232, 240, 0.9);
    font-size: 12px;

    .stock-left {
      display: flex;
      align-items: baseline;
      gap: 5px;

      .stock-label {
        color: #64748b;
        font-weight: 500;
        font-size: 11px;
      }

      .stock-value {
        color: #0f172a;
        font-weight: 700;
        font-size: 13px;
        font-variant-numeric: tabular-nums;
      }

      .rate-unit {
        font-weight: 600;
        color: #64748b;
        font-size: 11px;
      }
    }

    .stock-right {
      .depth-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #0369a1;
        background: rgba(14, 165, 233, 0.08);
        border: 1px solid rgba(14, 165, 233, 0.2);
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 600;

        .depth-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #0284c7;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .rate-card {
    padding: 10px 12px;
    gap: 8px;

    .rate-header {
      .rate-header-left {
        gap: 6px;

        .live-pill {
          padding: 1px 6px;

          .live-text {
            font-size: 10px;
          }
        }

        .rate-label-inline {
          font-size: 11px;
        }
      }

      .rate-header-right {
        .slippage-badge {
          font-size: 10px;
          padding: 1px 6px;
        }
      }
    }

    .rate-body {
      .rate-main {
        .rate-unit-row {
          .base-amount {
            font-size: 16px;
          }

          .rate-val {
            font-size: 19px;
          }
        }
      }
    }

    .note-section {
      gap: 6px;
      padding-top: 6px;

      .note-text {
        font-size: 10px;
      }

      .limits-row {
        gap: 6px;

        .limit-item {
          font-size: 10px;
          padding: 2px 6px;
        }
      }
    }

    .stock-section {
      padding-top: 6px;

      .stock-left {
        .stock-label {
          font-size: 10px;
        }

        .stock-value {
          font-size: 12px;
        }
      }

      .stock-right {
        .depth-badge {
          font-size: 10px;
          padding: 1px 6px;
        }
      }
    }
  }
}
</style>
