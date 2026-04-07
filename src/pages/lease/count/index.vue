<template>
  <div class="common-page">
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

<style lang="scss" scoped></style>
