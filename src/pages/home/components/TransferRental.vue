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

    <QrCodeWithAddress
      :address="walletAddress"
      :title="t('transferRental.walletQrcode')"
    />

    <KindTips :tips="tips" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { usePriceStore } from '@/stores/usePriceStore'
import KindTips from '@/components/kindTips/index.vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'

const { t } = useI18n()
const priceStore = usePriceStore()
const { priceData } = storeToRefs(priceStore)

const walletAddress = ref('TMpHUncdDoCmaAADteBvSGBzRjAbXiB2pE')

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
}

@media (max-width: 768px) {
  .transfer-rental {
    .top-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}
</style>
