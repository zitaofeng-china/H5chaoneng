<template>
  <div class="transfer-rental">
    <div class="instruction-note">
      <span>*</span>
      {{ t('transferRental.note') }}
    </div>

    <QrCodeWithAddress
      :address="walletAddress"
      :title="t('contract.flashWalletQrcode')"
      :tip="t('contract.checkAddress')"
    />

    <KindTips :tips="getCoinTips" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePriceStore } from '@/stores/usePriceStore'
import KindTips from '@/components/kindTips/index.vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'

const { t } = useI18n()
const priceStore = usePriceStore()

interface Props {
  coin: string
}

const props = withDefaults(defineProps<Props>(), {
  coin: 'USDT',
})

const walletAddress = ref('TMpHUncdDoCmaAADteBvSGBzRjAbXiB2pE')

// 获取最大额度
const maxLimits = computed(() => {
  if (!priceStore.priceData) return { usdt: 70000, trx: 100000 }
  return {
    usdt: Number.parseFloat(priceStore.priceData.max_usdt_2_trx) || 70000,
    trx: Number.parseFloat(priceStore.priceData.max_trx_2_usdt) || 100000,
  }
})

const tips = computed(() => [
  t('contract.tips1'),
  t('contract.tips2'),
  t('contract.tips3'),
  t('contract.tips4'),
  t('contract.tips5'),
])

const getCoinTips = computed(() => {
  const maxUsdt = maxLimits.value.usdt
  const maxTrx = maxLimits.value.trx
  
  return props.coin.toUpperCase() === 'USDT'
    ? [`${t('contract.minExchange', { min: 2 })} USDT，${t('contract.maxExchange', { max: maxUsdt })} USDT`].concat(tips.value)
    : [`${t('contract.minExchange', { min: 10 })} TRX，${t('contract.maxExchange', { max: maxTrx })} TRX`].concat(tips.value)
})
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
}

@media (max-width: 768px) {
  .transfer-rental {
    .top-banner {
      gap: 10px;
    }
  }
}
</style>
