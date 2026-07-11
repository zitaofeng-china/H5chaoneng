<template>
  <div ref="listRef" class="activation-list" @scroll="handleListScroll">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><IEpLoading /></el-icon>
      <span>{{ $t('common.loading') }}</span>
    </div>
    
    <div v-else-if="error" class="error-state">
      <el-icon :size="24"><IEpWarningFilled /></el-icon>
      <span>{{ error }}</span>
      <el-button type="primary" size="small" @click="() => fetchHostingList(true)">
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
      <div v-if="loadingMore" class="loading-more">
        <el-icon class="is-loading" :size="18"><IEpLoading /></el-icon>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from '@/utils/element'
import ActivationCard from './AddressCard.vue'
import { addressApi } from '@/api'
import { useUserStore } from '@/stores/useUserStore'
import type { HostingAddressItem } from '@/api/modules/address/types'

const { t } = useI18n()
const userStore = useUserStore()
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const hostingList = ref<HostingAddressItem[]>([])
const listRef = ref<HTMLElement>()
const pageSize = 4
const currentPage = ref(1)
const hasMore = ref(true)

function getHasMore(list: HostingAddressItem[], page: number, total?: number) {
  const totalCount = Number(total)

  if (Number.isFinite(totalCount) && totalCount > 0) {
    return page * pageSize < totalCount
  }

  return list.length >= pageSize
}

/**
 * 获取托管列表
 */
async function fetchHostingList(reset = true) {
  const page = reset ? 1 : currentPage.value + 1

  // 未登录时不调用接口
  if (!userStore.isLogin) {
    hostingList.value = []
    loading.value = false
    loadingMore.value = false
    error.value = ''
    hasMore.value = false
    return
  }
  
  if (reset) {
    loading.value = true
    currentPage.value = 1
    hasMore.value = true
    hostingList.value = []
  } else {
    loadingMore.value = true
  }
  error.value = ''
  
  try {
    const response = await addressApi.getHostingList({
      current_page: page,
      page_size: pageSize,
    })
    
    if (response.code === '000000' && response.data) {
      const list = response.data.list || []
      const pager = response.data.pager
      hostingList.value = reset ? list : [...hostingList.value, ...list]
      currentPage.value = Number(pager?.current_page) || page
      hasMore.value = getHasMore(list, currentPage.value, pager?.total)
      console.log('[托管列表] 获取成功:', response.data)
    } else {
      const message = response.msg || '获取托管列表失败'
      if (reset) {
        error.value = message
      } else {
        ElMessage.error(message)
      }
    }
  } catch (err: any) {
    console.error('[托管列表] 获取失败:', err)
    // 如果是未登录错误，不显示错误信息，只显示空状态
    if (err.message === 'NOT_LOGGED_IN') {
      hostingList.value = []
      error.value = ''
      hasMore.value = false
    } else {
      const message = err.message || '网络错误，请稍后重试'
      if (reset) {
        error.value = message
      } else {
        ElMessage.error(message)
      }
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function handleListScroll() {
  const listEl = listRef.value

  if (!listEl || loading.value || loadingMore.value || !hasMore.value) return
  if (listEl.scrollHeight <= listEl.clientHeight) return

  const isNearBottom = listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 12
  if (isNearBottom) {
    await fetchHostingList(false)
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
  fetchHostingList(true)
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
  max-height: 305px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px;
}

.activation-list::-webkit-scrollbar {
  width: 4px;
}

.activation-list::-webkit-scrollbar-thumb {
  background: var(--theme-border-light);
  border-radius: 999px;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 4px 0 10px;
  color: var(--theme-text-muted);
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

@media (max-width: 890px) {
  .activation-list {
    gap: 10px;
    max-height: 360px;
    padding-right: 2px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 32px 16px;
    font-size: 13px;
  }
}
</style>
