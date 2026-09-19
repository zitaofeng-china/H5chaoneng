<template>
  <div class="time-page">
    <div class="time-head">
      <div class="time-title">{{ t('lease.byTime') }}</div>
    </div>
    <TimeRental />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TimeRental from './components/TimeRental.vue'
import { usePriceStore } from '@/stores/usePriceStore'

const { t } = useI18n()
const priceStore = usePriceStore()

defineOptions({
  name: 'TimeRentPage',
})

onMounted(async () => {
  await priceStore.fetchPrice()
})
</script>

<style lang="scss" scoped>
.time-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 0;
  padding: calc(2 * var(--theme-home-band-height, 50px) + 8px) 0 40px;
  background: #fff;

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    left: 0;
    height: calc(2 * var(--theme-home-band-height, 50px));
    pointer-events: none;
    background-color: #fff;
    background-image:
      var(--theme-home-band-2-color),
      var(--theme-home-band-3-color),
      var(--theme-home-grid-vertical);
    background-size:
      100% var(--theme-home-band-height, 50px),
      100% var(--theme-home-band-height, 50px),
      auto 300px;
    background-position:
      0 0,
      0 var(--theme-home-band-height, 50px),
      0 calc(-1 * var(--theme-home-band-height, 50px));
    background-repeat: no-repeat, no-repeat, repeat;
    -webkit-mask-image: var(--theme-home-grid-mask);
    mask-image: var(--theme-home-grid-mask);
    -webkit-mask-size: 100% calc(6 * var(--theme-home-band-height, 50px));
    mask-size: 100% calc(6 * var(--theme-home-band-height, 50px));
    -webkit-mask-position: 0 calc(-1 * var(--theme-home-band-height, 50px));
    mask-position: 0 calc(-1 * var(--theme-home-band-height, 50px));
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  .time-head {
    .time-title {
      margin-bottom: 14px;
      display: flex;
      justify-content: center;
      color: var(--theme-text-black);
      font-size: 34px;
      font-weight: 700;
      line-height: 1.2;
    }
  }
}

@media (max-width: 890px) {
  .time-page {
    padding: calc(2 * var(--theme-home-band-height, 30px) + 8px) 0 24px;

    .time-head {
      .time-title {
        margin-bottom: 12px;
        font-size: 28px;
      }
    }
  }
}
</style>
