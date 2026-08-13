<template>
  <div class="address-card">
    <div class="address-row">
      <div class="address-box" :title="item.address">{{ item.address }}</div>
      <button type="button" class="delete-btn" @click="onDelete?.()">
        {{ $t('hosting.deleteHosting') }}
      </button>
    </div>
    <div class="address-stats">
      <span>{{ $t('hosting.historyUsed') }}：{{ historyUsed }} {{ $t('common.purchase') }}</span>
      <span>{{ $t('hosting.todayUsed') }}：{{ todayUsed }} {{ $t('common.purchase') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HostingAddressItem } from '@/api/modules/address/types'

const props = defineProps<{
  item: HostingAddressItem
  onDelete?: () => void
}>()

const historyUsed = computed(() => Number(props.item.count ?? 0))
const todayUsed = computed(() => Number(props.item.today_count ?? 0))
</script>

<style scoped lang="scss">
.address-card {
  width: 100%;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-box {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  background: #f3f5f8;
  color: #344054;
  font-size: 13px;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  flex-shrink: 0;
  width: 92px;
  height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: #1766f5;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #2d78ff;
  }
}

.address-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #98a2b3;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 890px) {
  .address-box {
    height: 36px;
    font-size: 12px;
  }

  .delete-btn {
    width: 80px;
    height: 36px;
    font-size: 12px;
  }

  .address-stats {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .address-stats {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
