<template>
  <div class="common-page">
    <div class="common-head">
      <div class="common-title">{{ t('hosting.title') }}</div>
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
@media (max-width: 768px) {
  .common-page {
    padding: 0 16px 50px;

    .common-body {
      margin-top: 24px;
    }

    .common-head {
      .common-title {
        margin-bottom: 0;
      }
    }
  }
}
</style>
