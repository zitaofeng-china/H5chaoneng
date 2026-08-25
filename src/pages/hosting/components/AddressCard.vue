<template>
  <div class="address-card">
    <div class="address-box" :title="item.address">{{ item.address }}</div>
    <div class="address-footer">
      <div class="address-stats">
        <span>{{ $t('hosting.todayUsed') }}：{{ todayUsed }} {{ $t('common.purchase') }}</span>
        <span>{{ $t('hosting.historyUsed') }}：{{ historyUsed }} {{ $t('common.purchase') }}</span>
      </div>
      <button type="button" class="delete-btn" @click="onDelete?.()">
        {{ $t('hosting.deleteHosting') }}
      </button>
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
  min-height: var(--hosting-card-height, 88px);
  box-sizing: border-box;
}

.address-box {
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

.address-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  margin-top: 8px;
}

.address-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  color: #98a2b3;
  font-size: 12px;
  line-height: 1.4;
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

  &:hover,
  &:focus {
    background: #2d78ff;
    color: #fff;
  }

  &:active {
    background: #1766f5;
    color: #fff;
  }
}

@media (max-width: 890px) {
  .address-card {
    min-height: var(--hosting-card-height, 80px);
  }

  .address-box {
    height: 36px;
    font-size: 12px;
  }

  .address-footer {
    min-height: 36px;
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
</style>
