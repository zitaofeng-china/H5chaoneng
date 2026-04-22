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
      <div class="card-id">
        <span class="label">{{ $t('hosting.address') }}：</span>{{ item?.address }}
      </div>
      <div class="card-stats">
        <span>
          {{ $t('hosting.orderId') }}：{{ item?.order_id }}
        </span>
        <span class="today">
          {{ $t('hosting.createdAt') }}：{{ formatDate(item?.created_at) }}
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
import type { HostingAddressItem } from '@/api/modules/address/types'

defineProps<{
  item: HostingAddressItem
  onDelete?: () => void
}>()

const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

/**
 * 格式化日期时间
 * @param timestamp Unix时间戳（秒）
 */
function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return '-'
  
  try {
    // 将秒级时间戳转换为毫秒级
    const date = new Date(timestamp * 1000)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '-'
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return '-'
  }
}
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

  .label {
    font-weight: 600;
    color: var(--theme-text-muted);
  }
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
    gap: 8px;
    margin-bottom: 10px;
  }

  .card-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-label {
    width: auto;
    text-align: left;
    display: flex;
    align-items: center;
    font-size: 13px;
  }

  .card-content {
    width: 100%;
    padding: 10px 12px;
    font-size: 13px;
  }

  .card-id {
    max-width: 100%;
    margin-bottom: 10px;
    font-size: 13px;
    word-break: break-all;
    white-space: normal;
  }

  .card-stats {
    flex-direction: column;
    gap: 6px;
    font-size: 12px;

    .today {
      margin-left: 0;
    }
  }

  .delete-btn {
    width: 80px;
    height: 30px;
    font-size: 12px;
    border-radius: 4px;
  }
}
</style>
