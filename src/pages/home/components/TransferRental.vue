<template>
  <div class="transfer-rental">
    <div v-if="isMobile" class="transfer-explain">
      <div class="explain-label">{{ t('transferRental.explain') }}</div>
      <div class="explain-grid">
        <div v-for="item in transferPackages" :key="item.count" class="explain-card">
          <span class="explain-price">{{ item.price }} {{ t('common.trx') }}</span>
          <span class="explain-count">{{ t('transferRental.buyCount', { count: item.count }) }}</span>
        </div>
      </div>
    </div>

    <div class="instruction-note">
      <SvgIcon name="transfer-info" width="12" height="12" />
      {{ t('transferRental.note') }}
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

const handleRetry = () => {
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
    position: relative;
    display: flex;
    align-items: center;
    min-height: 20px;
    padding-left: 12px;
    color: #000;
    font-size: 13px;
    font-weight: 900;
    line-height: 14px;
  }

  .explain-label::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 0;
    width: 2px;
    height: 16px;
    border-radius: 2px;
    background: #165dff;
  }

  .explain-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
  }

  .explain-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 58px;
    padding: 8px 6px;
    box-sizing: border-box;
    border: 1px solid rgba(22, 93, 255, 0.16);
    border-radius: 4px;
    background: #eef4ff;
  }

  .explain-price {
    color: #165dff;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
  }

  .explain-count {
    color: rgba(30, 41, 59, 0.55);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
  }

  .instruction-note {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    margin: 16px 0 14px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid #ffd3d9;
    border-radius: 4px;
    background: #fff1f2;
    color: #c13555;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;

    :deep(svg) {
      flex-shrink: 0;
      color: #d94d70;
    }
  }

  .qr-section-wrapper :deep(.qr-section) {
    padding: 8px 0 14px;
  }

  .qr-section-wrapper :deep(.section-title) {
    margin-bottom: 10px;
    font-size: 14px;
  }

  .qr-section-wrapper :deep(.qr-code),
  .qr-section-wrapper :deep(.status-container) {
    width: 192px;
    height: 192px;
  }

  .qr-section-wrapper :deep(.wallet-address) {
    margin-top: 10px;
    font-size: 12px;
  }

  .qr-section-wrapper :deep(.tips-info) {
    display: none;
  }

  :deep(.tips-section) {
    margin: 8px 0 20px;
    padding: 14px 16px;
  }

  :deep(.tips-section .tips-title) {
    margin-bottom: 10px;
    font-size: 12px;
  }

  :deep(.tips-section .tips-list) {
    gap: 6px;
  }

  :deep(.tips-section .tip-text) {
    font-size: 12px;
    line-height: 1.5;
  }

  .loading-section {
    text-align: center;
    padding: 32px 0;
    background: rgba(2, 15, 45, 0.02);
    border-radius: 8px;
    margin: 16px 0;

    .loading-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 24px;
    }

    .loading-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 0;

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
    background: rgba(245, 108, 108, 0.05);
    border-radius: 8px;
    border: 1px dashed rgba(245, 108, 108, 0.3);
    margin: 16px 0;

    .error-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 24px;
    }

    .error-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 0;

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
    @media (min-width: 560px) {
      .explain-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .instruction-note {
      min-height: 32px;
      margin: 12px 0 10px;
      padding: 4px 10px;
      font-size: 11px;
      line-height: 1.5;
    }

    .qr-section-wrapper {
      margin: 0;

      :deep(.qr-section) {
        padding: 8px 0 12px;
      }

      :deep(.section-title) {
        font-size: 14px;
      }

      :deep(.qr-code),
      :deep(.status-container) {
        width: 148px;
        height: 148px;
      }

      :deep(.wallet-address) {
        margin-top: 8px;
        font-size: 11px;
        word-break: break-all;
      }
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
