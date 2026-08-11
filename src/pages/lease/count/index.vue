<template>
  <div class="common-page count-rental-page">
    <div class="common-head">
      <div class="common-title">{{ t('lease.byCount') }}</div>
    </div>
    <CountRental />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CountRental from './components/CountRental.vue'

const { t } = useI18n()

defineOptions({
  name: 'CountRentalPage',
})
</script>

<style lang="scss" scoped>
.count-rental-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #fff;
  margin: 0;
  padding: calc(2 * var(--theme-home-band-height, 50px) + 8px) 0 40px;

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

  :deep(.common-title) {
    margin-bottom: 14px;
    color: var(--theme-text-black);
    font-size: 34px;
    font-weight: 700;
    line-height: 1.2;
  }
}

@media (max-width: 890px) {
  .count-rental-page {
    margin: 0;
    padding: calc(2 * var(--theme-home-band-height, 30px) + 8px) 0 24px;

    &::before {
      top: 0;
      height: calc(2 * var(--theme-home-band-height, 30px));
    }

    :deep(.common-title) {
      margin-bottom: 12px;
      font-size: 28px;
    }
  }
}
</style>
