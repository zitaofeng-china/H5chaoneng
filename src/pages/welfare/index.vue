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
  padding-bottom: 24px;
}
</style>
