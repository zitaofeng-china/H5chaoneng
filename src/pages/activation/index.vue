<template>
  <div class="common-page">
    <div class="common-head">
      <div class="common-title">{{ t('activation.title') }}</div>
    </div>
    <div class="common-body">
      <ContentMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ContentMain from './components/ContentMain.vue'

defineOptions({
  name: 'ActivationPage',
})

const { t } = useI18n()
</script>

<style lang="scss" scoped>
@media (max-width: 768px) {
  .common-page {
    padding: 0 6px 40px;

    .common-head {
      .common-title {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
