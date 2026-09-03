<template>
  <div class="transfer-rental">
    <div class="transfer-explain">
      <div class="explain-label">
        <span>{{ t('transferRental.explain') }}</span>
        <span class="explain-subhint">转账对应 TRX 即可自动到账能量</span>
      </div>
      <div class="explain-grid">
        <div
          v-for="item in transferPackages"
          :key="item.count"
          class="explain-card tactile-btn"
          role="button"
          tabindex="0"
          @click="handlePackageClick"
        >
          <div class="explain-price tabular-nums">
            {{ item.price }} <span class="price-unit">{{ t('common.trx') }}</span>
          </div>
          <div class="explain-count">
            {{ t('transferRental.buyCount', { count: item.count }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="instruction-note">
      <SvgIcon name="transfer-info" width="14" height="14" />
      <span>{{ t('transferRental.note') }}</span>
    </div>

    <!-- 二维码区域 -->
    <div v-if="props.paymentAddress" class="qr-section-wrapper">
      <QrCodeWithAddress
        :address="props.paymentAddress"
        :title="t('transferRental.walletQrcode')"
      />
    </div>
    <div v-else-if="loadingTimeout" class="error-section">
      <div class="error-title">{{ t('transferRental.walletQrcode') }}</div>
      <div class="error-placeholder">
        <el-icon class="error-icon" :size="48">
          <CircleClose />
        </el-icon>
        <div class="error-text">{{ t('common.loadFailed') }}</div>
        <div class="error-hint">{{ t('common.loadFailedHint') }}</div>
        <el-button type="primary" @click="handleRetry" class="retry-button">
          <el-icon class="mr-2"><RefreshRight /></el-icon>
          {{ t('common.retry') }}
        </el-button>
      </div>
    </div>
    <div v-else class="loading-section">
      <div class="loading-title">{{ t('transferRental.walletQrcode') }}</div>
      <div class="loading-placeholder">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
        <div class="loading-text">{{ t('common.loading') }}...</div>
      </div>
    </div>

    <KindTips :tips="tips" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Loading, RefreshRight, CircleClose } from '@element-plus/icons-vue'
import { useAddressLoading } from '@/hooks/useAddressLoading'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { formatCryptoAmount } from '@/utils/number'
import { tmaHapticSelection, tmaHapticImpact } from '@/utils/telegram'
import KindTips from '@/components/kindTips/index.vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'

const TRANSFER_COUNTS = [1, 2, 4, 20]

interface Props {
  paymentAddress?: string
}

const props = withDefaults(defineProps<Props>(), {
  paymentAddress: '',
})

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)
const priceStore = usePriceStore()
const { priceData } = storeToRefs(priceStore)

const transferPackages = computed(() => {
  const unit = Number.parseFloat(priceData.value?.stroke || '3.5')
  return TRANSFER_COUNTS.map((count) => ({
    count,
    price: formatCryptoAmount(unit * count),
  }))
})

const { loadingTimeout, resetTimer } = useAddressLoading({
  address: () => props.paymentAddress,
})

const emit = defineEmits<{
  retry: []
}>()

const handlePackageClick = () => {
  tmaHapticSelection()
}

const handleRetry = () => {
  tmaHapticImpact('light')
  resetTimer()
  emit('retry')
}

const tips = computed(() => [
  t('transferRental.walletTips'),
  t('transferRental.noUsdtTip'),
  t('transferRental.expiryTip'),
  t('transferRental.amountTip'),
  t('transferRental.addressTip'),
])

</script>

<style lang="scss" scoped>
.transfer-rental {
  padding: 0;

  .transfer-explain {
    margin: 16px 0 0;
  }

  .explain-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 20px;
    padding-left: 10px;
    position: relative;
    color: var(--theme-text-black);
    font-size: 13px;
    font-weight: 700;

    &::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 0;
      width: 3px;
      height: 15px;
      border-radius: 2px;
      background: var(--theme-primary-blue, #165dff);
    }

    .explain-subhint {
      font-size: 11px;
      font-weight: 500;
      color: var(--theme-text-light-gray-muted);
    }
  }

  .explain-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .explain-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-height: 62px;
    padding: 8px 6px;
    box-sizing: border-box;
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    border-radius: var(--theme-radius-md, 6px);
    background: var(--theme-card-bg-gradient, linear-gradient(180deg, #ffffff 0%, #f8fafc 100%));
    box-shadow: var(--theme-shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.04));
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      border-color: var(--theme-primary-blue, #165dff);
      box-shadow: var(--theme-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.05));
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.975);
    }
  }

  .explain-price {
    color: var(--theme-primary-blue, #165dff);
    font-size: 16px;
    font-weight: 800;
    line-height: 1.2;

    .price-unit {
      font-size: 11px;
      font-weight: 600;
      color: rgba(22, 93, 255, 0.7);
    }
  }

  .explain-count {
    color: var(--theme-text-muted);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
  }

  .instruction-note {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    margin: 14px 0 10px;
    padding: 6px 12px;
    box-sizing: border-box;
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: var(--theme-radius-sm, 4px);
    background: rgba(245, 158, 11, 0.08);
    color: #b45309;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;

    :deep(svg) {
      flex-shrink: 0;
      color: #f59e0b;
    }
  }

  .qr-section-wrapper {
    margin: 4px 0;
  }

  :deep(.tips-section) {
    margin: 10px 0 16px;
    padding: 14px 16px;
    border-radius: var(--theme-radius-md, 6px);
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  }

  :deep(.tips-section .tips-title) {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
  }

  :deep(.tips-section .tips-list) {
    gap: 8px;
  }

  :deep(.tips-section .tip-text) {
    font-size: 12px;
    line-height: 1.5;
  }

  .loading-section {
    text-align: center;
    padding: 32px 0;
    background: rgba(22, 93, 255, 0.02);
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    border-radius: var(--theme-radius-md, 12px);
    margin: 16px 0;

    .loading-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 20px;
    }

    .loading-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 32px 0;

      .el-icon {
        color: var(--theme-bg-blue);
      }

      .loading-text {
        font-size: 14px;
        color: var(--theme-text-muted);
      }
    }
  }

  .error-section {
    text-align: center;
    padding: 32px 0;
    background: rgba(245, 108, 108, 0.04);
    border-radius: var(--theme-radius-md, 12px);
    border: 1px dashed rgba(245, 108, 108, 0.3);
    margin: 16px 0;

    .error-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 20px;
    }

    .error-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 32px 0;

      .error-icon {
        color: #F56C6C;
        margin-bottom: 8px;
      }

      .error-text {
        font-size: 16px;
        font-weight: 600;
        color: #F56C6C;
      }

      .error-hint {
        font-size: 14px;
        color: var(--theme-text-muted);
        margin-bottom: 8px;
      }

      .retry-button {
        margin-top: 8px;
        border-radius: 6px;
        padding: 10px 24px;
        font-weight: 600;

        .mr-2 {
          margin-right: 6px;
        }
      }
    }
  }
}

@media (max-width: 890px) {
  .transfer-rental {
    .explain-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 560px) {
      .explain-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .instruction-note {
      min-height: 32px;
      margin: 12px 0 10px;
      padding: 6px 10px;
      font-size: 11px;
      line-height: 1.5;
    }

    .qr-section-wrapper {
      margin: 0;
    }

    :deep(.tips-section) {
      margin: 8px 0 12px;
      padding: 12px;
    }

    .loading-section {
      padding: 24px 16px;
      margin: 12px 0;

      .loading-title {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .loading-placeholder {
        padding: 32px 0;
        gap: 12px;

        .el-icon {
          font-size: 36px;
        }

        .loading-text {
          font-size: 13px;
        }
      }
    }

    .error-section {
      padding: 24px 16px;
      margin: 12px 0;

      .error-title {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .error-placeholder {
        padding: 32px 0;
        gap: 10px;

        .error-icon {
          font-size: 40px;
          margin-bottom: 6px;
        }

        .error-text {
          font-size: 15px;
        }

        .error-hint {
          font-size: 13px;
          margin-bottom: 6px;
        }

        .retry-button {
          margin-top: 6px;
          padding: 8px 20px;
          font-size: 14px;

          .mr-2 {
            margin-right: 4px;
          }
        }
      }
    }
  }
}
</style>
