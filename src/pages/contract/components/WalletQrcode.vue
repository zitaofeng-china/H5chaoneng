<template>
  <div class="transfer-rental">
    <div class="instruction-note">
      <span>*</span>
      {{ t('transferRental.note') }}
    </div>

    <div class="qr-section">
      <div class="section-title">{{ t('contract.flashWalletQrcode') }}</div>
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
      <div class="tips-info">
        <SvgIcon name="fee-info" width="12" height="12" />
        {{ t('contract.checkAddress') }}
      </div>
    </div>

    <KindTips :tips="getCoinTips" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import KindTips from '@/components/kindTips/index.vue'

const { t } = useI18n()

interface Props {
  coin: string
}

const props = withDefaults(defineProps<Props>(), {
  coin: 'USDT',
})

const walletAddress = ref('TMpHUncdDoCmaAADteBvSGBzRjAbXiB2pE')
const isCopying = ref(false)

const tips = computed(() => [
  t('contract.tips1'),
  t('contract.tips2'),
  t('contract.tips3'),
  t('contract.tips4'),
  t('contract.tips5'),
])

const getCoinTips = computed(() =>
  props.coin.toUpperCase() === 'USDT'
    ? [t('contract.usdtMinTip')].concat(tips.value)
    : [t('contract.trxMinTip')].concat(tips.value),
)

const qrCode = useQRCode(walletAddress)
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

    .tips-info {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      margin-top: 6px;
      color: var(--theme-text-light-gray-muted);

      svg {
        color: var(--theme-text-black);
        padding-right: 2px;
      }
    }
  }
}

@media (max-width: 768px) {
  .transfer-rental {
    .top-banner {
      gap: 10px;
    }

    .qr-section {
      padding: 12px 0 16px;

      .wallet-address {
        display: block;
        flex-direction: column;
        gap: 8px;

        .address-text {
          text-align: center;
        }
      }
    }
  }
}
</style>
