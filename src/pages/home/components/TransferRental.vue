<template>
  <div class="transfer-rental">
    <div class="top-banner">
      <div class="banner-item">
        <SvgIcon name="transfer-info" width="12" height="12" />
        <div class="text">{{ t('transferRental.transfer35') }}</div>
      </div>
      <div class="banner-item">
        <SvgIcon name="transfer-info" width="12" height="12" />
        <div class="text">{{ t('transferRental.transfer7') }}</div>
      </div>
      <div class="banner-item">
        <SvgIcon name="transfer-info" width="12" height="12" />
        <div class="text">{{ t('transferRental.transfer14') }}</div>
      </div>
      <div class="banner-item">
        <SvgIcon name="transfer-info" width="12" height="12" />
        <div class="text">{{ t('transferRental.transfer70') }}</div>
      </div>
    </div>

    <div class="instruction-note">
      <span>*</span>
      {{ t('transferRental.note') }}
    </div>

    <div class="qr-section">
      <div class="section-title">{{ t('transferRental.walletQrcode') }}</div>
      <div class="qr-code">
        <img :src="qrCode" alt="Wallet QR Code" class="qr-image" />
      </div>
      <div class="wallet-address">
        <span class="address-text">{{ walletAddress }}</span>
        <el-button
          link
          type="primary"
          @click="copyAddress"
          class="copy-button"
          :loading="isCopying"
        >
          <SvgIcon name="transfer-copy" width="24" height="24" />
        </el-button>
      </div>
    </div>

    <KindTips :tips="tips" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import KindTips from '@/components/kindTips/index.vue'

const { t } = useI18n()

const walletAddress = ref('TMpHUncdDoCmaAADteBvSGBzRjAbXiB2pE')
const isCopying = ref(false)

const qrCode = useQRCode(walletAddress)

const tips = computed(() => [
  t('transferRental.walletTips'),
  t('transferRental.noUsdtTip'),
  t('transferRental.expiryTip'),
  t('transferRental.amountTip'),
  t('transferRental.addressTip'),
])

const { copy } = useClipboard()

const copyAddress = async () => {
  isCopying.value = true
  try {
    await copy(walletAddress.value)
    ElMessage.success(t('transferRental.copyAddress'))
  } catch {
    ElMessage.error(t('transferRental.copyFailed'))
  } finally {
    setTimeout(() => {
      isCopying.value = false
    }, 1000)
  }
}
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

  .qr-section {
    text-align: center;
    padding: 16px 0 18px;

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-black);
      // margin-bottom: 14px;
    }

    .qr-code {
      width: 192px;
      height: 192px;
      margin: 0 auto;

      .qr-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .wallet-address {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      color: var(--theme-text-black);
    }

    .address-text {
      font-family: 'Courier New', monospace;
    }

    .copy-button {
      padding: 0;
      height: 18px;

      :deep(svg) {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .transfer-rental {
    .top-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .qr-section {
      padding: 12px 0 16px;
    }

    .qr-section {
      .wallet-address {
        display: initial;
      }
    }

    .wallet-address {
      flex-direction: column;
      gap: 8px;

      .address-text {
        text-align: center;
      }
    }
  }
}
</style>
