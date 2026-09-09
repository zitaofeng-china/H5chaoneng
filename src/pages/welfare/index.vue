<template>
  <div class="welfare-page">
    <WelfareOrder />
  </div>
</template>

<script setup lang="ts">
import WelfareOrder from '@/components/business/WelfareOrder.vue'

defineOptions({
  name: 'WelfarePage',
})
</script>

<style lang="scss" scoped>
.welfare-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-bottom: 8px;
  background: #fff;

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    left: 0;
    height: calc(3 * var(--theme-home-band-height, 50px));
    pointer-events: none;
    background-color: #fff;
    background-image:
      var(--theme-home-band-2-color),
      var(--theme-home-band-3-color),
      var(--theme-home-band-4-color),
      var(--theme-home-grid-vertical);
    background-size:
      100% var(--theme-home-band-height, 50px),
      auto 300px;
    background-position:
      0 0,
      0 var(--theme-home-band-height, 50px),
      0 calc(2 * var(--theme-home-band-height, 50px)),
      0 calc(-1 * var(--theme-home-band-height, 50px));
    background-repeat: no-repeat, no-repeat, no-repeat, repeat;
    -webkit-mask-image: var(--theme-home-grid-mask);
    mask-image: var(--theme-home-grid-mask);
    -webkit-mask-size: 100% calc(3 * var(--theme-home-band-height, 50px));
    mask-size: 100% calc(3 * var(--theme-home-band-height, 50px));
    -webkit-mask-position: 0 calc(-1 * var(--theme-home-band-height, 50px));
    mask-position: 0 calc(-1 * var(--theme-home-band-height, 50px));
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}
</style>
