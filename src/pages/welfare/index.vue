<template>
  <div class="welfare-page">
    <WelfareOrder />
  </div>
</template>

<script setup lang="ts">
import WelfareOrder from '@/pages/home/components/WelfareOrder.vue'

defineOptions({
  name: 'WelfarePage',
})
</script>

<style lang="scss" scoped>
.welfare-page {
  min-height: calc(100vh - 66px);
}

@media (max-width: 768px) {
  .welfare-page {
    min-height: calc(100vh - 54px);
  }
}
</style>
