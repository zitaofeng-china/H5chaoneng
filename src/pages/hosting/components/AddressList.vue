<template>
  <div class="address-list-wrapper">
    <!-- 快捷搜索与统计过滤栏 -->
    <div v-if="hostingList.length > 0" class="list-filter-bar">
      <div class="search-box">
        <SvgIcon name="choose-search" width="14" height="14" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="快速搜索已托管地址..."
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search-btn"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>
      <span class="count-pill">
        {{ filteredList.length }} / {{ hostingList.length }} 个
      </span>
    </div>

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
        <div class="empty-subtitle">输入 TRON 地址并点击立即托管即可开启全自动监控</div>
      </div>

      <div v-else-if="filteredList.length === 0" class="empty-filter-wrap">
        <span class="empty-filter-text">未检索到匹配的托管地址</span>
      </div>
      
      <template v-else>
        <ActivationCard
          v-for="item in filteredList"
          :key="item.id"
          :item="item"
          :onDelete="() => onDelete(item.id)"
        />
        <div v-if="loadingMore" class="loading-more">
          <el-icon class="is-loading" :size="18"><IEpLoading /></el-icon>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from '@/utils/element'
import ActivationCard from './AddressCard.vue'
import { addressApi } from '@/api'
import { useUserStore } from '@/stores/useUserStore'
import type { HostingAddressItem } from '@/api/modules/address/types'

const emit = defineEmits<{
  (e: 'update:count', count: number): void
}>()

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
const searchQuery = ref('')

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return hostingList.value
  return hostingList.value.filter((item) =>
    (item.address || '').toLowerCase().includes(q)
  )
})

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
    emit('update:count', 0)
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
    emit('update:count', hostingList.value.length)
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
.address-list-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.list-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;

  .search-box {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    .search-icon {
      position: absolute;
      left: 10px;
      color: var(--theme-text-muted-gray, #94a3b8);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      height: 34px;
      padding: 0 28px 0 32px;
      border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
      border-radius: var(--theme-radius-sm, 6px);
      background: #f8fafc;
      color: var(--theme-text-black, #182230);
      font-size: 12px;
      outline: none;
      transition: all 0.2s ease;

      &::placeholder {
        color: var(--theme-text-muted-gray, #94a3b8);
      }

      &:focus {
        background: #ffffff;
        border-color: var(--theme-primary-blue, #165dff);
        box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 11px;
      cursor: pointer;
      padding: 2px 4px;

      &:hover {
        color: #64748b;
      }
    }
  }

  .count-pill {
    flex-shrink: 0;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(15, 23, 42, 0.04);
    color: var(--theme-text-gray, #64748b);
    font-size: 11px;
    font-weight: 600;
  }
}

.empty-filter-wrap {
  padding: 32px 16px;
  text-align: center;
  color: var(--theme-text-muted-gray, #94a3b8);
  font-size: 13px;
  background: #f8fafc;
  border-radius: var(--theme-radius-sm, 6px);
  border: 1px dashed rgba(203, 213, 225, 0.8);
}

.activation-list {
  --hosting-visible-count: 4;
  --hosting-card-height: 94px;
  --hosting-list-gap: 10px;
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
    --hosting-card-height: 80px;
    --hosting-list-gap: 12px;
    padding-right: 0;
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
