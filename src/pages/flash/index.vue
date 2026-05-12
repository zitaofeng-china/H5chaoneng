<template>
  <div class="flash-page">
    <EnergyRental />
  </div>
</template>

<script setup lang="ts">
import EnergyRental from '@/pages/home/components/EnergyRental.vue'

defineOptions({
  name: 'FlashPage',
})
</script>

<style lang="scss" scoped>
.flash-page {
  min-height: calc(100vh - 66px);
}

@media (max-width: 768px) {
  .flash-page {
    min-height: calc(100vh - 54px);
  }
}
</style>
