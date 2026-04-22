<template>
  <div class="transfer-rental">
    <div class="top-banner">
      <div class="banner-item" v-for="banner in priceBanners" :key="banner.count">
        <SvgIcon name="transfer-info" width="12" height="12" />
        <div class="text">
          {{ t('transferRental.transferTemplate', { price: banner.price, count: banner.count }) }}
        </div>
      </div>
    </div>

    <div class="instruction-note">
      <span>*</span>
      {{ t('transferRental.note') }}
    </div>

    <!-- 二维码区域 -->
    <div v-if="props.paymentAddress" class="qr-section-wrapper">
      <QrCodeWithAddress
        :address="props.paymentAddress"
        :title="t('transferRental.walletQrcode')"
        :tip="t('common.checkWalletAddress')"
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
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { Loading, RefreshRight, CircleClose } from '@element-plus/icons-vue'
import { usePriceStore } from '@/stores/usePriceStore'
import { useAddressLoading } from '@/hooks/useAddressLoading'
import KindTips from '@/components/kindTips/index.vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'

interface Props {
  paymentAddress?: string
}

const props = withDefaults(defineProps<Props>(), {
  paymentAddress: '',
})

const { t } = useI18n()
const priceStore = usePriceStore()
const { priceData } = storeToRefs(priceStore)

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

// 动态计算按1小时价格购买的价格
const hourlyPrice = computed(() => {
  return Number.parseFloat(priceData.value?.time_1h || '5')
})

// 动态生成价格横幅（基于1小时价格）
const priceBanners = computed(() => {
  const price = hourlyPrice.value
  return [
    { count: 1, price: (price * 1).toFixed(1) },
    { count: 2, price: (price * 2).toFixed(1) },
    { count: 4, price: (price * 4).toFixed(1) },
    { count: 20, price: (price * 20).toFixed(1) },
  ]
})

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

  .instruction-note {
    margin: 24px 0 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text-muted);

    span {
      color: rgba(193, 53, 53, 1);
    }
  }

  .top-banner {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 4px;
    background: rgba(22, 93, 255, 0.08);
    color: var(--theme-bg-blue);
    font-size: 14px;
    font-weight: 700;
  }

  .banner-item {
    display: flex;
    align-items: center;
    gap: 6px;
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

@media (max-width: 768px) {
  .transfer-rental {
    .top-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      font-size: 13px;
    }

    .banner-item {
      gap: 6px;
      width: 100%;

      svg {
        flex-shrink: 0;
      }

      .text {
        flex: 1;
        line-height: 1.4;
      }
    }

    .instruction-note {
      margin: 16px 0 12px;
      font-size: 13px;
      line-height: 1.5;
    }

    .qr-section-wrapper {
      margin: 12px 0;
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
