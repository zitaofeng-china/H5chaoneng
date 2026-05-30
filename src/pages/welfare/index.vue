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
  padding-bottom: 40px;
}
</style>
