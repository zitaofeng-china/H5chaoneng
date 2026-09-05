<template>
  <div class="contract-flash">
    <el-card class="rental-card">
      <div class="section-label">{{ t('contract.title') }}</div>
      <div class="swap-split" role="tablist">
        <button
          type="button"
          role="tab"
          :class="{ 'is-active': activeTab === 'USDT' }"
          :aria-selected="activeTab === 'USDT'"
          @click="activeTab = 'USDT'"
        >
          {{ t('contract.usdtToTrx') }}
        </button>
        <button
          type="button"
          role="tab"
          :class="{ 'is-active': activeTab === 'TRX' }"
          :aria-selected="activeTab === 'TRX'"
          @click="activeTab = 'TRX'"
        >
          {{ t('contract.trxToUsdt') }}
        </button>
      </div>
      <el-form
          ref="formRef"
          :model="formData"
          label-position="top"
          class="rental-form"
        >
          <div class="form-wrap">
            <div class="field-label">{{ t('contract.enterAmount') }}</div>
            <el-form-item prop="unitPrice">
              <el-input
                v-model="formData.unitPrice"
                type="number"
                :min="minValue"
                :max="maxValue"
                step="0.01"
                :placeholder="t('contract.enterAmountPlaceholder')"
                @input="handleAmountInput"
                @blur="handleBlur"
              >
                <template #suffix>{{
                  activeTab === 'USDT' ? t('common.usdt') : t('common.trx')
                }}</template>
              </el-input>
            </el-form-item>

            <div class="field-label">{{ t('contract.estimatedGet') }}</div>
            <el-form-item>
              <el-input
                v-model="formData.coinAmount"
                :placeholder="t('contract.estimatedPlaceholder')"
                disabled
              >
                <template #suffix>{{
                  activeTab === 'USDT' ? t('common.trx') : t('common.usdt')
                }}</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
        <RateCard :coin="activeTab" :rate="displayRate" :stock="displayStock" />
        <WalletQrcode 
          :coin="activeTab" 
          :payment-address="paymentAddress" 
          :max-usdt="maxLimits.usdt"
          :max-trx="maxLimits.trx"
          @retry="handleRetryFetchAddress" 
        />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { exchangeApi } from '@/api'
import type { ExchangeRateData } from '@/api/modules/exchange/types'
import { AddressKind } from '@/api/modules/address/types'
import { usePaymentAddress } from '@/hooks/usePaymentAddress'
import { logger } from '@/utils/logger'
import { formatCryptoAmount } from '@/utils/number'
import { tmaHapticSelection } from '@/utils/telegram'
import WalletQrcode from './WalletQrcode.vue'
import RateCard from './RateCard.vue'

const { t } = useI18n()

const activeTab = ref('USDT')

watch(activeTab, (newTab, oldTab) => {
  if (oldTab !== undefined && newTab !== oldTab) {
    tmaHapticSelection()
  }
})

// 使用统一的地址管理 hook
const { address: paymentAddress, fetchAddress: fetchPaymentAddress } = usePaymentAddress(AddressKind.FLASH_EXCHANGE)

// 闪兑汇率数据
const exchangeRateData = ref<ExchangeRateData | null>(null)

const formData = reactive({
  unitPrice: '2.00',
  coinAmount: '',
})

// 获取闪兑汇率
const fetchExchangeRate = async () => {
  try {
    const response = await exchangeApi.getExchangeRate()
    console.log('[Contract Flash] API 响应:', response)
    
    if (response.code === '000000' && response.data) {
      // request 函数返回 ApiResponse<ExchangeRateData>
      // response.data 就是 ExchangeRateData
      exchangeRateData.value = response.data
      logger.info('[Contract Flash] 闪兑汇率获取成功', response.data)
    } else {
      logger.error('[Contract Flash] 获取闪兑汇率失败', response.msg)
    }
  } catch (error) {
    logger.error('[Contract Flash] 获取闪兑汇率失败', error)
  }
}

// 处理重试
const handleRetryFetchAddress = () => {
  fetchPaymentAddress()
}

// 获取汇率（直接使用接口返回的价格）
const exchangeRate = computed(() => {
  if (!exchangeRateData.value) return { usdtToTrx: 0, trxToUsdt: 0 }
  
  // price_trx: TRX价格（1 TRX = X USDT）
  // price_usdt: USDT价格（1 USDT = X TRX）
  const priceTrx = Number.parseFloat(exchangeRateData.value.price_trx) || 0
  const priceUsdt = Number.parseFloat(exchangeRateData.value.price_usdt) || 0
  
  logger.debug('[Contract Flash] 汇率数据', { priceTrx, priceUsdt })
  
  return {
    usdtToTrx: priceUsdt, // 1 USDT = X TRX
    trxToUsdt: priceTrx,  // 1 TRX = X USDT
  }
})

// 获取最大额度
const maxLimits = computed(() => {
  if (!exchangeRateData.value) return { usdt: 10000, trx: 30000 }
  return {
    usdt: Number.parseFloat(exchangeRateData.value.max_usdt2trx) || 10000,
    trx: Number.parseFloat(exchangeRateData.value.max_trx2usdt) || 30000,
  }
})

// 获取最小值和最大值
const minValue = computed(() => activeTab.value === 'USDT' ? 2 : 10)
const maxValue = computed(() => activeTab.value === 'USDT' ? maxLimits.value.usdt : maxLimits.value.trx)

// 计算显示的汇率（统一保留两位小数）
const displayRate = computed(() => {
  if (activeTab.value === 'USDT') {
    // USDT→TRX: 2 USDT 能兑换多少 TRX
    return formatCryptoAmount(2 * exchangeRate.value.usdtToTrx)
  } else {
    // TRX→USDT: 10 TRX 能兑换多少 USDT
    return formatCryptoAmount(10 * exchangeRate.value.trxToUsdt)
  }
})

// 显示库存（使用接口返回的库存数据）
const displayStock = computed(() => {
  if (!exchangeRateData.value) return '0.00'
  
  if (activeTab.value === 'USDT') {
    // USDT→TRX，显示 TRX 库存
    return formatCryptoAmount(exchangeRateData.value.stock_trx)
  } else {
    // TRX→USDT，显示 USDT 库存
    return formatCryptoAmount(exchangeRateData.value.stock_usdt)
  }
})

// 监听输入金额，计算预估获得
watch(() => formData.unitPrice, (newValue) => {
  const amount = Number.parseFloat(newValue)
  
  // 如果输入为空或无效，清空预估获得
  if (newValue === '' || Number.isNaN(amount) || amount <= 0) {
    formData.coinAmount = ''
    return
  }

  // 限制最小值和最大值
  if (amount < minValue.value) {
    formData.unitPrice = String(minValue.value)
    return
  }
  
  if (amount > maxValue.value) {
    formData.unitPrice = String(maxValue.value)
    return
  }

  if (activeTab.value === 'USDT') {
    // USDT→TRX
    const rate = exchangeRate.value.usdtToTrx
    if (rate > 0) {
      formData.coinAmount = formatCryptoAmount(amount * rate)
    } else {
      formData.coinAmount = '0.00'
    }
  } else {
    // TRX→USDT
    const rate = exchangeRate.value.trxToUsdt
    if (rate > 0) {
      formData.coinAmount = formatCryptoAmount(amount * rate)
    } else {
      formData.coinAmount = '0.00'
    }
  }
}, { immediate: true }) // 添加 immediate: true，初始化时立即执行

// 监听切换标签，重置表单并重新获取汇率
watch(activeTab, (newTab) => {
  formData.unitPrice = formatCryptoAmount(newTab === 'USDT' ? 2 : 10)
  formData.coinAmount = ''
  // 切换标签时重新获取汇率
  fetchExchangeRate()
})

// 监听汇率变化，重新计算预估获得
watch(() => exchangeRate.value, () => {
  // 触发重新计算
  const currentValue = formData.unitPrice
  if (currentValue) {
    // 强制触发 watch
    const temp = formData.unitPrice
    formData.unitPrice = ''
    nextTick(() => {
      formData.unitPrice = temp
    })
  }
}, { deep: true })

// 监听价格数据加载完成
watch(() => exchangeRateData.value, (newData) => {
  if (newData && formData.unitPrice) {
    // 价格数据加载完成后，重新计算预估获得
    const currentValue = formData.unitPrice
    formData.unitPrice = ''
    nextTick(() => {
      formData.unitPrice = currentValue
    })
  }
}, { immediate: true })

const handleAmountInput = (value: string | number) => {
  const rawValue = String(value).replace(/[^\d.]/g, '')
  const [integerPart = '', decimalPart = ''] = rawValue.split('.')
  const decimal = rawValue.includes('.') ? `.${decimalPart.slice(0, 2)}` : ''

  formData.unitPrice = `${integerPart}${decimal}`
}

// 失焦时检查并恢复最小值
const handleBlur = () => {
  const amount = Number.parseFloat(formData.unitPrice)
  
  if (formData.unitPrice === '' || Number.isNaN(amount) || amount < minValue.value) {
    formData.unitPrice = formatCryptoAmount(minValue.value)
    return
  }

  formData.unitPrice = formatCryptoAmount(Math.min(amount, maxValue.value))
}

// 初始化时获取汇率和付款地址
onMounted(() => {
  fetchExchangeRate() // 获取闪兑汇率
  fetchPaymentAddress()
})
</script>

<style lang="scss" scoped>
.contract-flash {
  padding: 0 0 40px;

  .section-label,
  .field-label {
    display: flex;
    align-items: center;
    min-height: 17px;
    border-left: 3px solid var(--theme-bg-blue);
    padding-left: 8px;
    color: var(--theme-text-black);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
  }

  .section-label {
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
  }

  .rental-card {
    width: min(760px, calc(100% - 48px));
    max-width: 760px;
    margin: 0 auto;
    border-radius: var(--theme-radius-lg, 8px);
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    box-shadow: var(--theme-shadow-lg, 0 10px 25px -4px rgba(15, 23, 42, 0.07));
    background: #ffffff;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

    :deep(.el-card__body) {
      padding: 24px 28px 28px;
    }
  }

  .swap-split {
    display: flex;
    align-items: stretch;
    gap: 6px;
    box-sizing: border-box;
    width: 100%;
    margin: 0 0 20px;
    padding: 4px;
    border-radius: var(--theme-radius-md, 6px);
    background: rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);

    button {
      flex: 1;
      min-width: 0;
      height: 40px;
      line-height: 38px;
      padding: 0 12px;
      border: 1px solid transparent;
      border-radius: var(--theme-radius-sm, 4px);
      background: transparent;
      color: #64748b;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      appearance: none;
      box-shadow: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover:not(.is-active) {
        color: #0f172a;
        background: rgba(255, 255, 255, 0.5);
      }

      &.is-active {
        color: #0f172a;
        background: #ffffff;
        border-color: rgba(226, 232, 240, 0.9);
        box-shadow: var(--theme-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.05)), 0 1px 2px rgba(15, 23, 42, 0.03);
        font-weight: 700;
      }
    }
  }

  .form-wrap {
    .field-label {
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: 700;
    }

    :deep(.el-form-item) {
      margin-bottom: 16px;

      .el-form-item__content {
        justify-content: center;
      }

      .el-input {
        width: 100%;

        .el-input__wrapper {
          min-height: 48px;
          height: 48px;
          background: #ffffff;
          border-radius: var(--theme-radius-sm, 4px);
          box-shadow: var(--theme-shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.04));
          border: 1.5px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
          padding: 0 14px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

          &:hover {
            border-color: rgba(22, 93, 255, 0.4);
          }

          &.is-focus {
            border-color: var(--theme-primary-blue, #165dff);
            box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.12);
          }
        }

        .el-input__inner {
          text-align: left;
          height: 46px;
          line-height: 46px;
          font-size: 16px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--theme-text-black);
        }

        .el-input__suffix {
          color: #64748b;
        }

        .el-input__suffix-inner {
          display: inline-flex;
          align-items: center;
          height: 22px;
          padding: 0 0 0 12px;
          margin-left: 2px;
          border: 0;
          border-left: 1px solid rgba(148, 163, 184, 0.32);
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          line-height: 1;
        }

        &.is-disabled {
          .el-input__wrapper {
            background: #f8fafc;
            border-color: rgba(226, 232, 240, 0.8);
          }

          .el-input__inner {
            color: var(--theme-primary-blue, #165dff);
            font-weight: 800;
            -webkit-text-fill-color: initial;
          }

          .el-input__suffix-inner {
            background: transparent;
            color: #94a3b8;
            border-left-color: rgba(148, 163, 184, 0.28);
          }
        }
      }
    }
  }

  :deep(.rate-card) {
    margin: 16px 0 0;
  }

  :deep(.qr-section) {
    padding: 32px 0 0;

    .section-title {
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.3;
    }

    .qr-code,
    .status-container {
      width: 168px;
      height: 168px;
    }

    .wallet-address {
      max-width: 100%;
      margin-top: 16px;
      gap: 6px;
      font-size: 11px;

      .address-text {
        max-width: 560px;
        font-size: 11px;
      }

      .copy-button {
        width: 18px !important;
        min-width: 18px !important;
        height: 18px !important;
      }
    }

    .tips-info {
      display: none;
    }
  }

  :deep(.tips-section) {
    margin: 14px 0 0;
    padding: 14px 16px;
    border-radius: 4px;
    background: #f7faff;

    .tips-title {
      margin-bottom: 8px;
      font-size: 13px;
    }

    .tips-list {
      gap: 6px;
    }

    .tip-item {
      gap: 6px;
      line-height: 1.4;
    }

    .tip-text {
      font-size: 11px;
      line-height: 1.4;
    }
  }

  :deep(.loading-section),
  :deep(.error-section) {
    margin: 0;
    padding: 24px 0;
    border-radius: 4px;

    .loading-title,
    .error-title {
      margin-bottom: 16px;
      font-size: 14px;
    }

    .loading-placeholder,
    .error-placeholder {
      gap: 10px;
      padding: 24px 0;

      .loading-text,
      .error-text {
        font-size: 13px;
      }

      .error-hint {
        font-size: 12px;
      }

      .retry-button {
        padding: 8px 18px;
        font-size: 13px;
      }
    }
  }
}

@media (max-width: 768px) {
  .contract-flash {
    padding: 0 0 24px;

    .rental-card {
      width: 100%;
      max-width: none;
      border-radius: 4px;
      box-shadow: 0 5px 15px rgba(15, 23, 42, 0.08);

      :deep(.el-card__body) {
        padding: 12px;
      }
    }

    .section-label,
    .field-label {
      min-height: 14px;
      font-size: 11px;
    }

    .swap-split {
      gap: 8px;
      margin-bottom: 12px;
      padding: 4px;
      border-radius: 8px;

      button {
        height: 38px;
        line-height: 36px;
        font-size: 12px;
        border-radius: 6px;
      }
    }

    .form-wrap {
      .field-label {
        margin-bottom: 5px;
      }

      :deep(.el-form-item) {
        margin-bottom: 11px;

        .el-input {
          font-size: 13px;

          .el-input__wrapper {
            padding: 0 10px;
            min-height: 38px;
            height: 38px;
          }

          .el-input__inner {
            height: 36px;
            line-height: 36px;
            font-size: 13px;
          }

          .el-input__suffix-inner {
            height: 18px;
            padding: 0 0 0 10px;
            font-size: 12px;
            font-weight: 600;
            background: transparent;
          }

          &.is-disabled {
            .el-input__wrapper {
              background: rgba(2, 15, 45, 0.02);
            }

            .el-input__inner {
              padding-right: 10px;
              color: var(--theme-text-gray);
            }

            .el-input__suffix-inner {
              background: transparent;
            }
          }
        }
      }
    }

    :deep(.rate-card) {
      padding: 12px;
      gap: 8px;

      .rate-section {
        .rate-main {
          gap: 5px;

          .rate-label-inline,
          .rate-text {
            font-size: 11px;
          }
        }
      }

      .note-section {
        gap: 4px;

        .note-text,
        .limits-row .limit-item {
          font-size: 11px;
        }

        .limits-row {
          gap: 14px;
        }
      }

      .stock-section {
        font-size: 11px;
      }
    }

    :deep(.qr-section) {
      padding: 16px 0 10px;

      .section-title {
        font-size: 14px;
      }

      .qr-code,
      .status-container {
        width: 150px;
        height: 150px;
      }

      .wallet-address {
        font-size: 11px;

        .address-text {
          max-width: 270px;
          font-size: 10px;
        }

        .copy-button {
          width: 18px !important;
          min-width: 18px !important;
          height: 18px !important;
        }
      }

      .tips-info {
        font-size: 10px;
      }
    }

    :deep(.tips-section) {
      margin-top: 10px;
      padding: 12px;

      .tips-title {
        margin-bottom: 8px;
        font-size: 12px;
      }

      .tips-list {
        gap: 6px;
      }

      .tip-text {
        font-size: 11px;
      }
    }

    :deep(.loading-section),
    :deep(.error-section) {
      padding: 24px 12px;
      border-radius: 4px;

      .loading-title,
      .error-title {
        margin-bottom: 16px;
        font-size: 14px;
      }

      .loading-placeholder,
      .error-placeholder {
        padding: 24px 0;
        gap: 10px;

        .loading-text,
        .error-text {
          font-size: 13px;
        }

        .error-hint {
          font-size: 12px;
        }

        .retry-button {
          padding: 8px 18px;
          font-size: 13px;
        }
      }
    }
  }
}

</style>
