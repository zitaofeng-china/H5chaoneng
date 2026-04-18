<template>
  <div class="contract-flash">
    <el-card class="rental-card">
      <el-tabs v-model="activeTab" class="rental-tabs">
        <el-tab-pane :label="t('contract.usdtToTrx')" name="USDT" />
        <el-tab-pane :label="t('contract.trxToUsdt')" name="TRX" />
        <el-form
          ref="formRef"
          :model="formData"
          label-position="right"
          label-suffix=":"
          class="rental-form"
        >
          <div class="form-wrap">
            <el-form-item prop="unitPrice">
              <el-input
                v-model="formData.unitPrice"
                type="number"
                :min="minValue"
                :max="maxValue"
                :placeholder="t('contract.enterAmountPlaceholder')"
                @blur="handleBlur"
              >
                <template #prefix>{{ t('contract.enterAmount') }}</template>
                <template #suffix>{{
                  activeTab === 'USDT' ? t('common.usdt') : t('common.trx')
                }}</template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="formData.coinAmount"
                :placeholder="t('contract.estimatedPlaceholder')"
                disabled
              >
                <template #prefix>{{ t('contract.estimatedGet') }}</template>
                <template #suffix>{{
                  activeTab === 'USDT' ? t('common.trx') : t('common.usdt')
                }}</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
        <RateCard :coin="activeTab" :rate="displayRate" :stock="displayStock" />
        <WalletQrcode :coin="activeTab" :payment-address="paymentAddress" @retry="handleRetryFetchAddress" />
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePriceStore } from '@/stores/usePriceStore'
import { binanceApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import { usePaymentAddress } from '@/hooks/usePaymentAddress'
import { logger } from '@/utils/logger'
import WalletQrcode from './WalletQrcode.vue'
import RateCard from './RateCard.vue'

const { t } = useI18n()
const priceStore = usePriceStore()

const activeTab = ref('USDT')

// 使用统一的地址管理 hook
const { address: paymentAddress, fetchAddress: fetchPaymentAddress } = usePaymentAddress(AddressKind.FLASH_EXCHANGE)

// 币安实时汇率
const binanceRate = ref<number>(0)

const formData = reactive({
  unitPrice: '2',
  coinAmount: '',
})

// 获取币安实时汇率
const fetchBinanceRate = async () => {
  try {
    const data = await binanceApi.getTrxUsdtPrice()
    binanceRate.value = parseFloat(data.price)
    logger.info('[Contract Flash] 币安汇率获取成功', { rate: binanceRate.value })
  } catch (error) {
    logger.error('[Contract Flash] 获取币安汇率失败', error)
    // 如果获取失败，使用后端价格作为备用
    binanceRate.value = 0
  }
}

// 处理重试
const handleRetryFetchAddress = () => {
  fetchPaymentAddress()
}

// 获取汇率（币安实时汇率 × 手续费百分比）
const exchangeRate = computed(() => {
  // 如果没有后端价格数据，返回0
  if (!priceStore.priceData) return { usdtToTrx: 0, trxToUsdt: 0 }
  
  // 获取后端手续费比例（百分比形式，如 0.06 = 6%）
  const feeRateUsdtToTrx = Number.parseFloat(priceStore.priceData.usdt_2_trx) || 0
  const feeRateTrxToUsdt = Number.parseFloat(priceStore.priceData.trx_2_usdt) || 0
  
  logger.debug('[Contract Flash] 手续费比例', { feeRateUsdtToTrx, feeRateTrxToUsdt })
  
  // 如果有币安实时汇率，使用币安汇率 × (1 - 手续费比例)
  if (binanceRate.value > 0) {
    // 币安返回的是 TRXUSDT，即 1 TRX = X USDT
    // 所以 1 USDT = 1/X TRX
    const binanceUsdtToTrx = 1 / binanceRate.value // 1 USDT = X TRX
    const binanceTrxToUsdt = binanceRate.value // 1 TRX = X USDT
    
    const calculatedRates = {
      // USDT→TRX: 币安汇率 × (1 - 手续费比例)
      // 例如: 3.0833 × (1 - 0.06) = 3.0833 × 0.94 = 2.898
      usdtToTrx: binanceUsdtToTrx * (1 - feeRateUsdtToTrx),
      
      // TRX→USDT: 币安汇率 × (1 - 手续费比例)
      // 例如: 0.3243 × (1 - 0.04) = 0.3243 × 0.96 = 0.3113
      trxToUsdt: binanceTrxToUsdt * (1 - feeRateTrxToUsdt),
    }
    
    logger.debug('[Contract Flash] 计算后的汇率', calculatedRates)
    return calculatedRates
  }
  
  // 如果没有币安汇率，使用后端价格作为汇率（假设后端返回的是实际汇率而不是手续费）
  logger.debug('[Contract Flash] 使用后端价格作为汇率')
  return {
    usdtToTrx: feeRateUsdtToTrx > 1 ? feeRateUsdtToTrx : 0,
    trxToUsdt: feeRateTrxToUsdt > 0.01 ? feeRateTrxToUsdt : 0,
  }
})

// 获取最大额度
const maxLimits = computed(() => {
  if (!priceStore.priceData) return { usdt: 70000, trx: 100000 }
  return {
    usdt: Number.parseFloat(priceStore.priceData.max_usdt_2_trx) || 70000,
    trx: Number.parseFloat(priceStore.priceData.max_trx_2_usdt) || 100000,
  }
})

// 获取最小值和最大值
const minValue = computed(() => activeTab.value === 'USDT' ? 2 : 10)
const maxValue = computed(() => activeTab.value === 'USDT' ? maxLimits.value.usdt : maxLimits.value.trx)

// 计算显示的汇率（使用最小值）
const displayRate = computed(() => {
  if (activeTab.value === 'USDT') {
    // USDT→TRX: 2 USDT 能兑换多少 TRX
    return (2 * exchangeRate.value.usdtToTrx).toFixed(2)
  } else {
    // TRX→USDT: 10 TRX 能兑换多少 USDT
    return (10 * exchangeRate.value.trxToUsdt).toFixed(2)
  }
})

// 显示库存（暂时使用固定值，后续可从接口获取）
const displayStock = computed(() => '34430.21964')

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
      formData.coinAmount = (amount * rate).toFixed(2)
    } else {
      formData.coinAmount = '0.00'
    }
  } else {
    // TRX→USDT
    const rate = exchangeRate.value.trxToUsdt
    if (rate > 0) {
      formData.coinAmount = (amount * rate).toFixed(2)
    } else {
      formData.coinAmount = '0.00'
    }
  }
}, { immediate: true }) // 添加 immediate: true，初始化时立即执行

// 监听切换标签，重置表单
watch(activeTab, (newTab) => {
  formData.unitPrice = newTab === 'USDT' ? '2' : '10'
  formData.coinAmount = ''
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
watch(() => priceStore.priceData, (newData) => {
  if (newData && formData.unitPrice) {
    // 价格数据加载完成后，重新计算预估获得
    const currentValue = formData.unitPrice
    formData.unitPrice = ''
    nextTick(() => {
      formData.unitPrice = currentValue
    })
  }
}, { immediate: true })

// 监听币安汇率加载完成
watch(() => binanceRate.value, (newRate) => {
  if (newRate > 0 && formData.unitPrice) {
    // 币安汇率加载完成后，重新计算预估获得
    const currentValue = formData.unitPrice
    formData.unitPrice = ''
    nextTick(() => {
      formData.unitPrice = currentValue
    })
  }
})

// 失焦时检查并恢复最小值
const handleBlur = () => {
  const amount = Number.parseFloat(formData.unitPrice)
  
  if (formData.unitPrice === '' || Number.isNaN(amount) || amount < minValue.value) {
    formData.unitPrice = String(minValue.value)
  }
}

// 初始化时获取价格、币安汇率和付款地址
onMounted(() => {
  priceStore.fetchPrice()
  fetchBinanceRate() // 获取币安实时汇率
  fetchPaymentAddress()
})
</script>

<style lang="scss" scoped>
.contract-flash {
  padding: 0 0 80px;

  .header {
    text-align: center;
    padding-bottom: 40px;
  }

  .title {
    font-size: 40px;
    font-weight: 700;
    color: var(--theme-text-black);
  }

  .rental-card {
    max-width: 896px;
    margin: 0 auto;
    border-radius: 8px;
    border: none;
    box-shadow: 0px 14px 30px 0px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .rental-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 22px;
    }

    :deep(.el-tabs__content) {
      overflow: initial;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__nav-scroll) {
      overflow: visible;
    }

    :deep(.el-tabs__nav) {
      width: 100%;
      display: flex;
      background: rgba(2, 15, 45, 0.03);
      border-radius: 4px;
      padding: 3px;
      box-sizing: border-box;
    }

    :deep(.el-tabs__item) {
      flex: 1;
      height: 44px;
      line-height: 44px;
      padding: 0;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      color: rgba(30, 41, 59, 0.6);
      border-radius: 4px;
      transition:
        background-color 0.2s ease,
        color 0.2s ease;

      &.is-active {
        color: var(--theme-text-white);
        background: var(--theme-bg-blue);
        box-shadow: 0px 4px 10px 0px rgba(22, 93, 255, 0.25);
      }
    }

    :deep(.el-tabs__active-bar) {
      display: none;
    }
  }

  .form-wrap {
    :deep(.el-form-item) {
      margin-bottom: 18px;

      .el-form-item__content {
        justify-content: center;
      }

      .el-input {
        font-size: 14px;
        .el-input__wrapper {
          background: rgba(2, 15, 45, 0.03);
          border-radius: 4px;
          box-shadow: none;
          border: 1px solid rgba(2, 15, 45, 0.08);
          padding: 0 12px;
        }

        .el-input__inner {
          text-align: right;
          height: 44px;
          line-height: 44px;
          color: var(--theme-text-black);
        }

        .el-input__prefix,
        .el-input__suffix-inner {
          font-weight: 600;
          color: var(--theme-text-black);
        }

        .el-input__inner {
          cursor: auto;

          &::placeholder {
            color: var(--theme-text-light-gray);
            -webkit-text-fill-color: var(--theme-text-light-gray);
          }
        }

        &.is-disabled {
          .el-input__inner {
            padding-right: 15px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .contract-flash {
    padding: 0 0 60px;

    .rental-card {
      border-radius: 6px;
      box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.06);

      :deep(.el-card__body) {
        padding: 16px;
      }
    }

    .rental-tabs {
      :deep(.el-tabs__header) {
        margin: 0 0 18px;
      }

      :deep(.el-tabs__nav) {
        padding: 2px;
      }

      :deep(.el-tabs__item) {
        height: 40px;
        line-height: 40px;
        font-size: 13px;
      }
    }

    .form-wrap {
      :deep(.el-form-item) {
        margin-bottom: 14px;

        .el-input {
          font-size: 13px;

          .el-input__wrapper {
            padding: 0 10px;
          }

          .el-input__inner {
            height: 40px;
            line-height: 40px;
            font-size: 13px;
          }

          .el-input__prefix,
          .el-input__suffix-inner {
            font-size: 13px;
            font-weight: 600;
          }

          &.is-disabled {
            .el-input__wrapper {
              background: rgba(2, 15, 45, 0.02);
            }

            .el-input__inner {
              padding-right: 10px;
              color: var(--theme-text-gray);
            }
          }
        }
      }
    }
  }
}

</style>
