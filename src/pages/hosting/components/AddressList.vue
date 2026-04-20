<template>
  <div class="activation-list">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><IEpLoading /></el-icon>
      <span>{{ $t('common.loading') }}</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <el-icon :size="24"><IEpWarningFilled /></el-icon>
      <span>{{ error }}</span>
      <el-button type="primary" size="small" @click="fetchHostingList">
        {{ $t('common.retry') }}
      </el-button>
    </div>
    
    <div v-else-if="hostingList.length === 0" class="empty-state">
      <el-icon :size="32"><IEpBox /></el-icon>
      <span>{{ $t('hosting.noAddresses') }}</span>
    </div>
    
    <template v-else>
      <ActivationCard
        v-for="item in hostingList"
        :key="item.id"
        :item="item"
        :onDelete="() => onDelete(item.id)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from 'element-plus'
import ActivationCard from './AddressCard.vue'
import { addressApi } from '@/api'
import type { HostingAddressItem } from '@/api/modules/address/types'

const { t } = useI18n()
const loading = ref(false)
const error = ref('')
const hostingList = ref<HostingAddressItem[]>([])

/**
 * 获取托管列表
 */
async function fetchHostingList() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await addressApi.getHostingList({ limit: 100 })
    
    if (response.code === '000000' && response.data) {
      hostingList.value = response.data.list || []
      console.log('[托管列表] 获取成功:', response.data)
    } else {
      error.value = response.msg || '获取托管列表失败'
    }
  } catch (err: any) {
    console.error('[托管列表] 获取失败:', err)
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

/**
 * 删除托管地址
 */
async function onDelete(id: number) {
  // 找到对应的地址项
  const item = hostingList.value.find(h => h.id === id)
  if (!item) {
    console.error('[删除托管地址] 未找到地址项:', id)
    return
  }

  try {
    // 使用 ElMessageBox 确认删除
    await ElMessageBox.confirm(
      t('hosting.deleteConfirmMessage', { address: item.address }),
      t('hosting.deleteConfirmTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        distinguishCancelAndClose: true,
        customClass: 'delete-hosting-dialog',
        center: false,
      }
    )

    // 用户确认删除，调用删除接口
    const response = await addressApi.deleteHostingAddress({ address: item.address })
    
    if (response.code === '000000') {
      console.log('[删除托管地址] 删除成功:', item.address)
      ElMessage.success(t('hosting.deleteSuccess'))
      // 删除成功后重新获取列表
      await fetchHostingList()
    } else {
      console.error('[删除托管地址] 删除失败:', response.msg)
      ElMessage.error(response.msg || t('hosting.deleteFailed'))
    }
  } catch (error: any) {
    // 用户取消删除或发生错误
    if (error === 'cancel' || error === 'close') {
      console.log('[删除托管地址] 用户取消删除')
      return
    }
    
    console.error('[删除托管地址] 删除失败:', error)
    ElMessage.error(error.message || t('hosting.deleteFailed'))
  }
}

/**
 * 监听刷新事件
 */
function handleRefresh() {
  fetchHostingList()
}

// 组件挂载时获取列表
onMounted(() => {
  fetchHostingList()
  // 监听刷新事件
  window.addEventListener('refresh-hosting-list', handleRefresh)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('refresh-hosting-list', handleRefresh)
})
</script>

<style scoped lang="scss">
.activation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--theme-text-muted);
  font-size: 14px;
}

.error-state {
  color: var(--el-color-danger);
}

.empty-state {
  color: var(--theme-text-light-gray-muted);
}

@media (max-width: 768px) {
  .activation-list {
    gap: 10px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 32px 16px;
    font-size: 13px;
  }
}
</style>
