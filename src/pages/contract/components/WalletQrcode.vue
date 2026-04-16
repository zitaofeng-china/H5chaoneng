<template>
  <div class="transfer-rental">
    <div class="instruction-note">
      <span>*</span>
      {{ t('transferRental.note') }}
    </div>

    <!-- 二维码区域 -->
    <div v-if="props.paymentAddress" class="qr-section-wrapper">
      <QrCodeWithAddress
        :address="props.paymentAddress"
        :title="t('contract.flashWalletQrcode')"
        :tip="t('contract.checkAddress')"
      />
    </div>
    <div v-else-if="loadingTimeout" class="error-section">
      <div class="error-title">{{ t('contract.flashWalletQrcode') }}</div>
      <div class="error-placeholder">
        <el-icon class="error-icon" :size="48">
          <CircleClose />
        </el-icon>
        <div class="error-text">{{ t('common.loadFailed') }}</div>
        <div class="error-hint">{{ t('common.loadFailedHint') }}</div>
        <el-button type="primary" @click="handleRetry" class="retry-button">
          <el-icon class="mr-2"><RefreshRight /></el-icon>
          {{ t('common.retry') }}
        </el-button>
      </div>
    </div>
    <div v-else class="loading-section">
      <div class="loading-title">{{ t('contract.flashWalletQrcode') }}</div>
      <div class="loading-placeholder">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
        <div class="loading-text">{{ t('common.loading') }}...</div>
      </div>
    </div>

    <KindTips :tips="getCoinTips" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading, RefreshRight, CircleClose } from '@element-plus/icons-vue'
import { usePriceStore } from '@/stores/usePriceStore'
import KindTips from '@/components/kindTips/index.vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'

const { t } = useI18n()
const priceStore = usePriceStore()

interface Props {
  coin: string
  paymentAddress?: string
}

const props = withDefaults(defineProps<Props>(), {
  coin: 'USDT',
  paymentAddress: '',
})

// 加载超时检测
const loadingTimeout = ref(false)
let timeoutTimer: ReturnType<typeof setTimeout> | null = null

const startLoadingTimer = () => {
  // 清除之前的定时器
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
  }
  
  // 重置超时状态
  loadingTimeout.value = false
  
  // 10秒后如果还没有地址，显示错误提示
  timeoutTimer = setTimeout(() => {
    if (!props.paymentAddress) {
      loadingTimeout.value = true
    }
  }, 10000)
}

// 监听 paymentAddress 变化
watch(() => props.paymentAddress, (newAddress) => {
  if (newAddress) {
    // 如果有地址了，清除定时器
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
    }
    loadingTimeout.value = false
  }
})

onMounted(() => {
  startLoadingTimer()
})

onUnmounted(() => {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
  }
})

// 重新加载 - 触发父组件重新获取地址
const emit = defineEmits<{
  retry: []
}>()

const handleRetry = () => {
  loadingTimeout.value = false
  // 重新启动定时器
  startLoadingTimer()
  // 通知父组件重新获取地址
  emit('retry')
}

// 获取最大额度
const maxLimits = computed(() => {
  if (!priceStore.priceData) return { usdt: 70000, trx: 100000 }
  return {
    usdt: Number.parseFloat(priceStore.priceData.max_usdt_2_trx) || 70000,
    trx: Number.parseFloat(priceStore.priceData.max_trx_2_usdt) || 100000,
  }
})

const tips = computed(() => [
  t('contract.tips1'),
  t('contract.tips2'),
  t('contract.tips3'),
  t('contract.tips4'),
  t('contract.tips5'),
])

const getCoinTips = computed(() => {
  const maxUsdt = maxLimits.value.usdt
  const maxTrx = maxLimits.value.trx
  
  return props.coin.toUpperCase() === 'USDT'
    ? [`${t('contract.minExchange', { min: 2 })} USDT，${t('contract.maxExchange', { max: maxUsdt })} USDT`].concat(tips.value)
    : [`${t('contract.minExchange', { min: 10 })} TRX，${t('contract.maxExchange', { max: maxTrx })} TRX`].concat(tips.value)
})
</script>

<style lang="scss" scoped>
.transfer-rental {
  padding: 0;

  .instruction-note {
    margin: 24px 0 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text-muted);

    span {
      color: rgba(193, 53, 53, 1);
    }
  }

  .loading-section {
    text-align: center;
    padding: 32px 0;
    background: rgba(2, 15, 45, 0.02);
    border-radius: 8px;
    margin: 16px 0;

    .loading-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 24px;
    }

    .loading-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 0;

      .el-icon {
        color: var(--theme-bg-blue);
      }

      .loading-text {
        font-size: 14px;
        color: var(--theme-text-muted);
      }
    }
  }

  .error-section {
    text-align: center;
    padding: 32px 0;
    background: rgba(245, 108, 108, 0.05);
    border-radius: 8px;
    border: 1px dashed rgba(245, 108, 108, 0.3);
    margin: 16px 0;

    .error-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 24px;
    }

    .error-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 0;

      .error-icon {
        color: #F56C6C;
        margin-bottom: 8px;
      }

      .error-text {
        font-size: 16px;
        font-weight: 600;
        color: #F56C6C;
      }

      .error-hint {
        font-size: 14px;
        color: var(--theme-text-muted);
        margin-bottom: 8px;
      }

      .retry-button {
        margin-top: 8px;
        border-radius: 6px;
        padding: 10px 24px;
        font-weight: 600;

        .mr-2 {
          margin-right: 6px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .transfer-rental {
    .top-banner {
      gap: 10px;
    }
  }
}
</style>
