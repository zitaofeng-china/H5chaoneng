<template>
  <div class="address-card">
    <div class="card-info">
      <div class="card-label"><span>*</span>{{ $t('hosting.managedAddress') }}</div>
      <!-- <div class="card-btn"> -->
      <div class="delete-btn" @click="onDelete?.()" v-if="isMobile">
        {{ $t('hosting.deleteHosting') }}
      </div>
      <!-- </div> -->
    </div>

    <div class="card-content">
      <div class="card-id">{{ item?.id }}</div>
      <div class="card-stats">
        <span>
          {{ $t('hosting.historyUsed') }}：{{ item?.history }} {{ $t('common.purchase') }}
        </span>
        <span class="today">
          {{ $t('hosting.todayUsed') }}：{{ item?.today }} {{ $t('common.purchase') }}
        </span>
      </div>
    </div>
    <div class="delete-btn" @click="onDelete?.()" v-if="!isMobile">
      {{ $t('hosting.deleteHosting') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores/useCommonStore'
import { storeToRefs } from 'pinia'

type Item = { id: string; history: number; today: number }

defineProps<{
  item: Item
  onDelete?: () => void
}>()

const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)
</script>

<style scoped lang="scss">
.address-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  margin-bottom: 12px;
  gap: 10px;
}

.card-label {
  width: 120px;
  text-align: right;
  color: var(--theme-text-muted);
  font-size: 14px;
  font-weight: 600;

  span {
    padding-right: 5px;
    color: var(--el-color-danger);
  }
}

.card-content {
  width: 610px;
  padding: 12px;
  font-size: 14px;
  background: var(--theme-card-bg-light);
}

.card-id {
  color: var(--theme-text-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 520px;
  margin-bottom: 12px;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  color: var(--theme-text-light-gray-muted);

  .today {
    margin-left: auto;
  }
}

.delete-btn {
  width: 100px;
  height: 64px;
  background: var(--theme-bg-red);
  color: var(--theme-text-white);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

@media (max-width: 768px) {
  .address-card {
    flex-direction: column;
  }

  .card-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .card-label {
    text-align: left;
    display: flex;
    align-items: center;
  }

  .card-content {
    width: 97%;
  }

  .delete-btn {
    height: 32px;
    font-size: 12px;
  }
}
</style>
