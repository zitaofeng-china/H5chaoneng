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
    
    <div v-else-if="hostingList.length === 0" class="empty-state-wrap">
      <div class="empty-icon-circle">
        <SvgIcon name="choose-shield" width="26" height="26" class="empty-icon" />
      </div>
      <div class="empty-title">{{ $t('hosting.noAddresses') }}</div>
      <div class="empty-subtitle">在上方输入 TRON 地址并点击立即托管即可开启全自动托管</div>
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from '@/utils/element'
import ActivationCard from './AddressCard.vue'
import { addressApi } from '@/api'
import { useUserStore } from '@/stores/useUserStore'
import type { HostingAddressItem } from '@/api/modules/address/types'

const { t } = useI18n()
const userStore = useUserStore()
const { isLogin } = storeToRefs(userStore)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const hostingList = ref<HostingAddressItem[]>([])
const listRef = ref<HTMLElement>()
const pageSize = 6
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

// App 在子组件 mounted 之后才 init token，刷新时需等登录态就绪再请求
watch(
  isLogin,
  (loggedIn) => {
    if (loggedIn) {
      fetchHostingList(true)
      return
    }

    hostingList.value = []
    error.value = ''
    hasMore.value = false
    loading.value = false
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('refresh-hosting-list', handleRefresh)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('refresh-hosting-list', handleRefresh)
})
</script>

<style scoped lang="scss">
.activation-list {
  --hosting-visible-count: 3;
  --hosting-card-height: 88px;
  --hosting-list-gap: 12px;
  display: flex;
  flex-direction: column;
  gap: var(--hosting-list-gap);
  max-height: calc(
    var(--hosting-visible-count) * var(--hosting-card-height) +
      (var(--hosting-visible-count) - 1) * var(--hosting-list-gap)
  );
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
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
.error-state {
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

.empty-state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  background: #f8fafc;
  border: 1.5px dashed rgba(203, 213, 225, 0.85);
  border-radius: var(--theme-radius-sm, 6px);
  text-align: center;
  transition: all 0.2s ease;

  .empty-icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(22, 93, 255, 0.08);
    color: var(--theme-primary-blue, #165dff);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text-black, #182230);
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 12px;
    color: var(--theme-text-muted-gray, #94a3b8);
  }
}

@media (max-width: 890px) {
  .activation-list {
    --hosting-visible-count: 1;
    --hosting-card-height: 160px;
    --hosting-list-gap: 12px;
    max-height: 160px;
    padding-right: 0;
    scroll-snap-type: y mandatory;

    :deep(.address-card) {
      scroll-snap-align: start;
    }
  }

  .loading-state,
  .error-state {
    padding: 32px 16px;
    font-size: 13px;
  }

  .empty-state-wrap {
    padding: 28px 14px;

    .empty-icon-circle {
      width: 44px;
      height: 44px;
      margin-bottom: 10px;
    }

    .empty-title {
      font-size: 13px;
    }

    .empty-subtitle {
      font-size: 11px;
    }
  }
}
</style>
