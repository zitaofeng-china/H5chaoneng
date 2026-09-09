<template>
  <div class="common-page hosting-page">
    <div class="common-head">
      <h1 class="common-title">{{ t('hosting.title') }}</h1>
    </div>
    <div class="common-body">
      <ContentMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ContentMain from './components/ContentMain.vue'

const { t } = useI18n()

defineOptions({
  name: 'HostingPage',
})
</script>

<style lang="scss" scoped>
.hosting-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 0;
  padding: calc(2 * var(--theme-home-band-height, 50px) - 8px) 20px 56px;
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

  :deep(.common-head .common-title) {
    margin: 0 0 28px;
    color: #182230;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
  }
}

@media (max-width: 890px) {
  .hosting-page {
    padding: calc(2 * var(--theme-home-band-height, 30px) + 8px) 10px 32px;

    :deep(.common-head .common-title) {
      margin-bottom: 16px;
      font-size: 26px;
    }
  }
}
</style>
