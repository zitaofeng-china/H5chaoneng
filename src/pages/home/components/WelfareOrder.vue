<template>
  <div id="welfare" class="welfare-order">
    <el-card class="welfare-card">
      <!-- 标题 -->
      <div class="welfare-header">
        {{ t('home.welfareOrder') }}
      </div>

      <!-- 提示信息 -->
      <div class="welfare-info">
        <div class="info-item">
          <span class="icon">🔥</span>
          <span class="text">{{ t('home.welfareInfo1', { price: welfarePrice }) }}</span>
        </div>
        <div class="info-item">
          <span class="icon">💎</span>
          <span class="text">{{ t('home.welfareInfo2', { price: welfarePrice }) }}</span>
        </div>
        <div class="info-item">
          <span class="icon">⚡</span>
          <span class="text">{{ t('home.welfareInfo3') }}</span>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="welfare-tips">
        <div class="tips-title">
          <span class="icon">⚠️</span>
          <span>{{ t('home.welfareTipsTitle') }}</span>
        </div>
        <div class="tips-content">
          <div class="tip-item">{{ t('home.welfareTip1') }}</div>
          <div class="tip-item">{{ t('home.welfareTip2') }}</div>
        </div>
      </div>

      <!-- 立即购买按钮 -->
      <el-button 
        class="buy-button" 
        type="primary" 
        size="large" 
        :loading="loading"
        @click="handleBuyNow"
      >
        {{ t('home.buyWelfareNow') }}
      </el-button>
    </el-card>

    <!-- 购买弹窗 -->
    <WelfarePurchaseDialog ref="purchaseDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/useUserStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { addressApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import { storeToRefs } from 'pinia'
import WelfarePurchaseDialog from '@/components/WelfarePurchaseDialog.vue'

const { t } = useI18n()
const userStore = useUserStore()
const priceStore = usePriceStore()
const { priceData } = storeToRefs(priceStore)
const purchaseDialogRef = ref<InstanceType<typeof WelfarePurchaseDialog>>()
const loading = ref(false)

// 福利地址缓存（10分钟有效，存 sessionStorage 刷新不丢失）
const CACHE_DURATION = 10 * 60 * 1000 // 10 分钟
const CACHE_KEY = 'welfare_address_cache'

function getCachedAddress(): string | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { address, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return address
    }
    sessionStorage.removeItem(CACHE_KEY)
  } catch {
    sessionStorage.removeItem(CACHE_KEY)
  }
  return null
}

function setCachedAddress(address: string) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ address, timestamp: Date.now() }))
}

defineOptions({
  name: 'WelfareOrder',
})

// 福利价格（从价格接口获取 weal 字段）
const welfarePrice = computed(() => {
  return priceData.value?.weal || '0'
})

// 获取价格数据
const fetchPriceData = async () => {
  try {
    await priceStore.fetchPrice()
    console.log('[WelfareOrder] 价格数据已更新:', priceData.value)
  } catch (error) {
    console.error('[WelfareOrder] 获取价格失败:', error)
  }
}

// 处理页面可见性变化
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 页面变为可见时，刷新价格数据
    console.log('[WelfareOrder] 页面可见，刷新价格数据')
    fetchPriceData()
  }
}

const handleBuyNow = async () => {
  loading.value = true
  
  try {
    // 检查缓存是否有效（10分钟内）
    const cached = getCachedAddress()
    if (cached) {
      console.log('[WelfareOrder] 使用缓存地址:', cached)
      purchaseDialogRef.value?.open(cached)
      return
    }

    console.log('[WelfareOrder] 开始获取福利订单地址, kind=6')
    
    // 调用地址接口获取福利订单支付地址 (kind=6)
    const response = await addressApi.getAddress({ kind: AddressKind.WELFARE_ORDER })
    
    console.log('[WelfareOrder] 地址接口响应:', response)
    
    // 检查状态码 000006 - IP频率限制
    if (response.code === '000006') {
      console.warn('[WelfareOrder] IP频率限制:', response.msg)
      ElMessage({
        message: t('home.welfareRateLimit'),
        type: 'error',
        customClass: 'welfare-message-large',
      })
      return
    }
    
    if (response.code === '000000') {
      // 检查 data 是否为空
      if (!response.data) {
        console.warn('[WelfareOrder] 福利正在补充，data 为空')
        ElMessage({
          message: t('home.welfareReplenishing'),
          type: 'warning',
          customClass: 'welfare-message-large',
        })
        return
      }
      
      // 判断 data 是字符串还是对象
      const paymentAddress = typeof response.data === 'string' 
        ? response.data 
        : response.data.address
      
      console.log('[WelfareOrder] 解析的支付地址:', paymentAddress)
      
      if (paymentAddress) {
        // 缓存地址到 sessionStorage
        setCachedAddress(paymentAddress)
        console.log('[WelfareOrder] 地址已缓存，有效期10分钟')
        
        // 打开弹窗显示支付地址
        purchaseDialogRef.value?.open(paymentAddress)
      } else {
        console.error('[WelfareOrder] 支付地址为空')
        ElMessage({
          message: t('home.welfareReplenishing'),
          type: 'warning',
          customClass: 'welfare-message-large',
        })
      }
    } else {
      console.error('[WelfareOrder] 接口返回失败:', response)
      ElMessage.error(response.msg || t('home.getAddressFailed'))
    }
  } catch (error) {
    console.error('[WelfareOrder] 获取支付地址失败:', error)
    
    // 如果是未登录错误，不显示额外的错误提示（拦截器已经显示了）
    if (error instanceof Error && error.message === 'NOT_LOGGED_IN') {
      console.log('[WelfareOrder] 用户未登录，已由拦截器处理')
    } else {
      ElMessage.error(t('home.getAddressFailed'))
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取价格
onMounted(() => {
  console.log('[WelfareOrder] 组件挂载，获取价格数据')
  fetchPriceData()
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
.welfare-order {
  background: var(--theme-bg-light);
  padding: 40px 20px 40px;

  .welfare-card {
    max-width: 960px;
    margin: 0 auto;
    border-radius: 8px;
    border: none;
    box-shadow: 0px 14px 30px 0px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .welfare-header {
    background: linear-gradient(135deg, #f6a623 0%, #f77737 100%);
    color: white;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    padding: 20px;
    border-radius: 8px 8px 0 0;
  }

  .welfare-info {
    padding: 30px 40px;
    background: white;

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 16px;
      color: var(--theme-text-black);

      &:last-child {
        margin-bottom: 0;
      }

      .icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .text {
        flex: 1;
        line-height: 1.6;
      }
    }
  }

  .welfare-tips {
    padding: 24px 40px;
    background: #fff9e6;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .tips-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 700;
      color: #f6a623;
      margin-bottom: 16px;

      .icon {
        font-size: 20px;
      }
    }

    .tips-content {
      padding-left: 28px;

      .tip-item {
        position: relative;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.75);
        line-height: 1.8;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        &::before {
          content: '-';
          position: absolute;
          left: -12px;
          color: #f6a623;
        }
      }
    }
  }

  .buy-button {
    width: calc(100% - 80px);
    margin: 30px 40px;
    height: 56px;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border: none;
    border-radius: 8px;
    box-shadow: 0px 8px 20px 0px rgba(79, 172, 254, 0.4);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0px 12px 24px 0px rgba(79, 172, 254, 0.5);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@media (max-width: 768px) {
  .welfare-order {
    padding: 20px 10px 20px;

    .welfare-header {
      font-size: 18px;
      padding: 16px;
    }

    .welfare-info {
      padding: 20px 16px;

      .info-item {
        font-size: 14px;
        margin-bottom: 12px;

        .icon {
          font-size: 20px;
        }
      }
    }

    .welfare-tips {
      padding: 16px;

      .tips-title {
        font-size: 14px;
        margin-bottom: 12px;

        .icon {
          font-size: 18px;
        }
      }

      .tips-content {
        padding-left: 20px;

        .tip-item {
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 6px;
        }
      }
    }

    .buy-button {
      width: calc(100% - 32px);
      margin: 20px 16px;
      height: 48px;
      font-size: 16px;
    }
  }
}
</style>

<style lang="scss">
/* 全局样式：让福利订单的提示更明显 */
.welfare-message-large {
  min-width: 420px !important;
  padding: 20px 24px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-align: center !important;
  
  .el-message__content {
    font-size: 18px !important;
    text-align: center !important;
  }
  
  .el-message__icon {
    font-size: 28px !important;
  }
}

@media (max-width: 768px) {
  .welfare-message-large {
    min-width: 90vw !important;
    max-width: 90vw !important;
    padding: 18px 20px !important;
    font-size: 16px !important;
    
    .el-message__content {
      font-size: 16px !important;
    }
    
    .el-message__icon {
      font-size: 24px !important;
    }
  }
}
</style>
