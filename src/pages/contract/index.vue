<template>
  <div class="common-page">
    <div class="common-head">
      <div class="common-title">{{ t('contract.title') }}</div>
    </div>
    <ContractFlash />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ContractFlash from './components/ContractFlash.vue'

const { t } = useI18n()

defineOptions({
  name: 'ContractPage',
})
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
