<template>
  <div id="welfare" class="welfare-order">
    <div class="page-title">{{ t('home.welfareOrder') }}</div>
    <el-card class="welfare-card">
      <div class="section-label">{{ t('home.welfareOrder') }}说明</div>

      <div class="welfare-info">
        <div class="info-item">
          <img class="icon" :src="welfareFlameImage" alt="" />
          <span class="text">{{ t('home.welfareInfo1', { price: welfarePrice }) }}</span>
        </div>
        <div class="info-item">
          <img class="icon" :src="welfareTelegramImage" alt="" />
          <span class="text">{{ t('home.welfareInfo2', { price: welfarePrice }) }}</span>
        </div>
        <div class="info-item">
          <img class="icon" :src="welfareBoltImage" alt="" />
          <span class="text">{{ t('home.welfareInfo3') }}</span>
        </div>
      </div>

      <div class="welfare-tips">
        <div class="tips-copy">
          <div class="tips-title">
            <span>{{ t('home.welfareTipsTitle') }}</span>
          </div>
          <div class="tips-content">
            <div class="tip-item">{{ t('home.welfareTip1') }}</div>
            <div class="tip-item">{{ t('home.welfareTip2') }}</div>
          </div>
        </div>
        <img class="tips-gift" :src="welfareGiftImage" alt="" />
      </div>

      <el-button 
        class="buy-button" 
        type="primary" 
        size="large" 
        :loading="loading"
        @click="handleBuyNow"
      >
        {{ t('home.buyWelfareNow') }}
      </el-button>

      <div class="page-link-section">
        <el-button type="primary" plain size="large" class="page-link-btn" @click="goToFlashRent">
          {{ t('home.goToNormalEnergy') }}
          <img class="link-arrow" :src="welfareArrowImage" alt="" />
        </el-button>
      </div>
    </el-card>

    <!-- 购买弹窗 -->
    <WelfarePurchaseDialog ref="purchaseDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/element'
import { useUserStore } from '@/stores/useUserStore'
import { useSiteStore } from '@/stores/useSiteStore'
import { addressApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import WelfarePurchaseDialog from '@/components/WelfarePurchaseDialog.vue'
import { formatCryptoAmount } from '@/utils/number'
import { withSitePrefix } from '@/utils/site'
import welfareArrowImage from '@/assets/images/welfare/welfare-arrow.png'
import welfareBoltImage from '@/assets/images/welfare/welfare-bolt.png'
import welfareFlameImage from '@/assets/images/welfare/welfare-flame.png'
import welfareGiftImage from '@/assets/images/welfare/welfare-gift.png'
import welfareTelegramImage from '@/assets/images/welfare/welfare-telegram.png'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const siteStore = useSiteStore()
const purchaseDialogRef = ref<InstanceType<typeof WelfarePurchaseDialog>>()
const loading = ref(false)

// 福利价格（取站点信息的 weal_price 字段）
const welfarePrice = computed(() => formatCryptoAmount(siteStore.wealPrice))

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

// 获取站点信息（含福利价格 weal_price）
const fetchPriceData = async () => {
  try {
    await siteStore.fetchSiteInfo()
  } catch (error) {
    console.error('[WelfareOrder] 获取福利价格失败:', error)
  }
}

// 处理页面可见性变化：页面变为可见时刷新价格
const handleVisibilityChange = () => {
  if (!document.hidden) {
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

const goToFlashRent = () => {
  router.push(withSitePrefix('/'))
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
  padding: 44px 20px 16px;

  .page-title {
    margin-bottom: 16px;
    color: var(--theme-text-black);
    font-size: 36px;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
  }

  .welfare-card {
    max-width: 980px;
    margin: 0 auto;
    border-radius: 8px;
    border: none;
    box-shadow: 0px 14px 30px 0px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 26px 28px 28px;
    }
  }

  .section-label {
    display: flex;
    align-items: center;
    min-height: 20px;
    padding-left: 10px;
    border-left: 3px solid var(--theme-bg-blue);
    color: var(--theme-text-black);
    font-size: 14px;
    font-weight: 600;
  }

  .welfare-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 18px;
    padding: 16px 18px;
    background: linear-gradient(90deg, #eef6ff 0%, #fff8f3 52%, #fbf2ff 100%);
    border-radius: 4px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 0 18px;
      font-size: 14px;
      color: var(--theme-text-black);
      border-right: 1px solid rgba(15, 23, 42, 0.12);

      &:last-child {
        border-right: 0;
      }

      .icon {
        width: 37px;
        height: 37px;
        flex-shrink: 0;
      }

      .text {
        flex: 1;
        line-height: 1.4;
      }
    }
  }

  .welfare-tips {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 124px;
    margin-top: 16px;
    padding: 16px 20px;
    background: #f7faff;
    border-radius: 4px;

    .tips-copy {
      min-width: 0;
      padding-right: 20px;
    }

    .tips-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 10px;
    }

    .tips-content {
      .tip-item {
        position: relative;
        padding-left: 18px;
        font-size: 13px;
        color: var(--theme-text-muted);
        line-height: 1.7;

        &::before {
          content: '';
          position: absolute;
          top: 0.52em;
          left: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #46d39a;
        }
      }
    }

    .tips-gift {
      width: 200px;
      height: 100px;
      flex: 0 0 auto;
      object-fit: contain;
    }
  }

  .buy-button {
    width: 100%;
    height: 48px;
    margin: 16px 0 12px;
    font-size: 16px;
    font-weight: 600;
    background: #ff5a1f;
    border: none;
    border-radius: 3px;
    box-shadow: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      background: #f04f17;
      box-shadow: 0 5px 12px rgba(255, 90, 31, 0.25);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .page-link-section {
    padding: 0;
    text-align: center;

    .page-link-btn {
      width: 100%;
      height: 42px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 3px;
      background: #f0f6ff;
      border-color: #c7dcff;

      .link-arrow {
        width: 20px;
        height: 20px;
        margin-left: 8px;
      }
    }
  }
}

@media (max-width: 768px) {
  .welfare-order {
    padding: 32px 12px 36px;

    .page-title {
      margin-bottom: 14px;
      font-size: 24px;
    }

    .welfare-card {
      :deep(.el-card__body) {
        padding: 14px 12px;
      }
    }

    .welfare-info {
      display: flex;
      align-items: stretch;
      padding: 8px 4px;

      .info-item {
        flex: 1;
        gap: 5px;
        padding: 0 6px;
        font-size: 10px;

        .icon {
          width: 23px;
          height: 23px;
        }
      }
    }

    .welfare-tips {
      min-height: 84px;
      padding: 10px;

      .tips-title {
        font-size: 12px;
        margin-bottom: 5px;
      }

      .tips-content {
        .tip-item {
          padding-left: 12px;
          font-size: 10px;
          line-height: 1.55;

          &::before {
            width: 7px;
            height: 7px;
          }
        }
      }

      .tips-gift {
        width: 105px;
        height: 53px;
      }
    }

    .buy-button {
      height: 38px;
      margin: 10px 0 8px;
      font-size: 12px;
    }

    .page-link-section {
      padding: 0;

      .page-link-btn {
        height: 32px;
        font-size: 11px;
      }
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
