<template>
  <div class="activation-list">
    <ActivationCard
      v-for="(item, idx) in internalItems"
      :key="item.id"
      :item="item"
      :onDelete="() => onDelete(idx)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ActivationCard from './AddressCard.vue'
import { useUserStore } from '@/stores/useUserStore'

type Item = { id: string; history: number; today: number }

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 从用户信息中获取地址列表
const internalItems = computed<Item[]>(() => {
  const addressList = userInfo.value?.address_list
  if (!addressList || addressList.length === 0) {
    return []
  }
  
  // 将地址列表转换为显示格式
  return addressList.map(address => ({
    id: address,
    history: 0, // TODO: 从后端获取实际的历史使用次数
    today: 0,   // TODO: 从后端获取实际的今日使用次数
  }))
})

function onDelete(index: number) {
  // TODO: 调用后端接口删除托管地址
  console.log('删除地址索引:', index)
}
</script>

<style scoped lang="scss">
.activation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 270px; // 显示约 3 条地址 (64px + 12px) * 3
  overflow-y: auto;
  padding-right: 4px;

  // 滚动条样式优化
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--theme-card-bg-light);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--theme-text-muted);
    border-radius: 3px;
    
    &:hover {
      background: var(--theme-text-light-gray-muted);
    }
  }

  // Firefox 滚动条样式
  scrollbar-width: thin;
  scrollbar-color: var(--theme-text-muted) var(--theme-card-bg-light);
}

@media (max-width: 768px) {
  .activation-list {
    max-height: 300px; // 移动端调整高度
  }
}
</style>
