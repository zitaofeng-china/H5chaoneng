<template>
  <div class="time-page">
    <div class="time-head">
      <div class="time-title">{{ t('lease.byTime') }}</div>
    </div>
    <TimeRental />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TimeRental from './components/TimeRental.vue'
import { usePriceStore } from '@/stores/usePriceStore'

const { t } = useI18n()
const priceStore = usePriceStore()

defineOptions({
  name: 'TimeRentPage',
})

onMounted(async () => {
  await priceStore.fetchPrice()
})
</script>

<style lang="scss" scoped>
.time-page {
  margin: 50px 0;

  .time-head {
    .time-title {
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
      color: var(--theme-text-black);
      font-size: 40px;
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .time-page {
    margin: 0;

    .time-head {
      .time-title {
        font-size: 24px;
        margin-bottom: 2px;
      }
    }
  }
}
</style>
