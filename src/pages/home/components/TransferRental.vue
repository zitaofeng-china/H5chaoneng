<template>
  <div class="transfer-rental">
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
    
    <!-- 跳转到福利订单 -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading, RefreshRight, CircleClose } from '@element-plus/icons-vue'
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

@media (max-width: 768px) {
  .transfer-rental {
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
        width: 120px;
        height: 120px;
      }
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
