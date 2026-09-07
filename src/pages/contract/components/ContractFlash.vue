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
            <div class="field-header">
              <div class="field-label">{{ t('contract.enterAmount') }}</div>
              <div class="quick-presets">
                <span class="preset-title">{{ t('contract.quickAmount') }}</span>
                <button
                  v-for="preset in quickAmounts"
                  :key="preset.label"
                  type="button"
                  class="preset-pill tactile-btn"
                  :class="{ 'is-active': formData.unitPrice === preset.value }"
                  @click="applyQuickAmount(preset.value)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
            <el-form-item prop="unitPrice" class="pay-form-item">
              <el-input
                v-model="formData.unitPrice"
                type="text"
                inputmode="decimal"
                :placeholder="t('contract.enterAmountPlaceholder')"
                @input="handleAmountInput"
                @blur="handleBlur"
              >
                <template #suffix>
                  <div class="token-badge">
                    <SvgIcon :name="activeTab === 'USDT' ? 'header-USDT' : 'trx'" width="18" height="18" class="token-icon" />
                    <span class="token-name">{{ activeTab === 'USDT' ? t('common.usdt') : t('common.trx') }}</span>
                  </div>
                </template>
              </el-input>
            </el-form-item>

            <div class="swap-divider">
              <button
                type="button"
                class="swap-switch-btn tactile-btn"
                :class="{ 'is-flipping': isFlipping }"
                :title="t('contract.switchDirection')"
                :aria-label="t('contract.switchDirection')"
                @click="handleToggleTab"
              >
                <el-icon class="switch-icon"><Sort /></el-icon>
              </button>
            </div>

            <div class="field-header">
              <div class="field-label">{{ t('contract.estimatedGet') }}</div>
              <span class="estimate-rate-tip">
                1 {{ activeTab === 'USDT' ? 'USDT' : 'TRX' }} ≈ {{ baseUnitRate }} {{ activeTab === 'USDT' ? 'TRX' : 'USDT' }}
              </span>
            </div>
            <el-form-item class="receive-form-item">
              <el-input
                v-model="formData.coinAmount"
                :placeholder="t('contract.estimatedPlaceholder')"
                disabled
              >
                <template #suffix>
                  <div class="token-badge is-receive">
                    <SvgIcon :name="activeTab === 'USDT' ? 'trx' : 'header-USDT'" width="18" height="18" class="token-icon" />
                    <span class="token-name">{{ activeTab === 'USDT' ? t('common.trx') : t('common.usdt') }}</span>
                  </div>
                </template>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
        <RateCard :coin="activeTab" :rate="displayRate" :stock="displayStock" />

        <!-- 极简 3 步操作向导 -->
        <div class="steps-guide-row">
          <div class="step-item">
            <span class="step-idx">1</span>
            <span class="step-text">{{ t('contract.step1') }}</span>
          </div>
          <span class="step-arrow">➔</span>
          <div class="step-item">
            <span class="step-idx">2</span>
            <span class="step-text">{{ t('contract.step2') }}</span>
          </div>
          <span class="step-arrow">➔</span>
          <div class="step-item">
            <span class="step-idx">3</span>
            <span class="step-text">{{ t('contract.step3') }}</span>
          </div>
        </div>

        <!-- 核心风控：严禁交易所充币防呆警示横幅 -->
        <div class="risk-warning-banner">
          <el-icon class="warning-icon"><WarningFilled /></el-icon>
          <div class="warning-body">
            <div class="warning-title">{{ t('contract.warningTitle') }}</div>
            <div class="warning-desc">{{ t('contract.warningDesc') }}</div>
          </div>
        </div>

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
import { Sort, WarningFilled } from '@element-plus/icons-vue'
import { exchangeApi } from '@/api'
import type { ExchangeRateData } from '@/api/modules/exchange/types'
import { AddressKind } from '@/api/modules/address/types'
import { usePaymentAddress } from '@/hooks/usePaymentAddress'
import { logger } from '@/utils/logger'
import { formatCryptoAmount } from '@/utils/number'
import { tmaHapticSelection, tmaHapticImpact, tmaHapticNotification } from '@/utils/telegram'
import WalletQrcode from './WalletQrcode.vue'
import RateCard from './RateCard.vue'

const { t } = useI18n()

const activeTab = ref('USDT')

// 切换按钮旋转动效与触感
const isFlipping = ref(false)
const handleToggleTab = () => {
  tmaHapticImpact('medium')
  isFlipping.value = true
  activeTab.value = activeTab.value === 'USDT' ? 'TRX' : 'USDT'
  setTimeout(() => {
    isFlipping.value = false
  }, 400)
}

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

// 基准单价计算（1 单位换算）
const baseUnitRate = computed(() => {
  if (activeTab.value === 'USDT') {
    return formatCryptoAmount(exchangeRate.value.usdtToTrx || 0)
  }
  return formatCryptoAmount(exchangeRate.value.trxToUsdt || 0)
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

// 快捷预设金额胶囊
const quickAmounts = computed(() => {
  if (activeTab.value === 'USDT') {
    return [
      { label: 'Min', value: '2.00' },
      { label: '50', value: '50.00' },
      { label: '100', value: '100.00' },
      { label: '500', value: '500.00' },
      { label: 'Max', value: formatCryptoAmount(maxValue.value) },
    ]
  }
  return [
    { label: 'Min', value: '10.00' },
    { label: '500', value: '500.00' },
    { label: '1000', value: '1000.00' },
    { label: '5000', value: '5000.00' },
    { label: 'Max', value: formatCryptoAmount(maxValue.value) },
  ]
})

const applyQuickAmount = (val: string) => {
  tmaHapticImpact('light')
  formData.unitPrice = val
}

// 监听输入金额，计算预估获得（非阻塞平滑输入）
watch(() => formData.unitPrice, (newValue) => {
  const amount = Number.parseFloat(newValue)
  
  // 如果输入为空或无效，清空预估获得
  if (newValue === '' || Number.isNaN(amount) || amount <= 0) {
    formData.coinAmount = ''
    return
  }

  if (activeTab.value === 'USDT') {
    // USDT→TRX
    const rate = exchangeRate.value.usdtToTrx
    formData.coinAmount = rate > 0 ? formatCryptoAmount(amount * rate) : '0.00'
  } else {
    // TRX→USDT
    const rate = exchangeRate.value.trxToUsdt
    formData.coinAmount = rate > 0 ? formatCryptoAmount(amount * rate) : '0.00'
  }
}, { immediate: true })

// 监听切换标签，重置表单并重新获取汇率
watch(activeTab, (newTab, oldTab) => {
  if (oldTab !== undefined && newTab !== oldTab) {
    tmaHapticSelection()
  }
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

// 失焦时检查并恢复合规范围
const handleBlur = () => {
  const amount = Number.parseFloat(formData.unitPrice)
  
  if (formData.unitPrice === '' || Number.isNaN(amount) || amount < minValue.value) {
    formData.unitPrice = formatCryptoAmount(minValue.value)
    tmaHapticNotification('warning')
    return
  }

  if (amount > maxValue.value) {
    formData.unitPrice = formatCryptoAmount(maxValue.value)
    tmaHapticNotification('warning')
    return
  }

  formData.unitPrice = formatCryptoAmount(amount)
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
    .field-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 8px;
      flex-wrap: wrap;

      .field-label {
        margin-bottom: 0;
      }

      .estimate-rate-tip {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        font-variant-numeric: tabular-nums;
      }

      .quick-presets {
        display: flex;
        align-items: center;
        gap: 5px;

        .preset-title {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          margin-right: 2px;
        }

        .preset-pill {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          font-family: inherit;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1.3;

          &:hover {
            color: #0f172a;
            border-color: #cbd5e1;
            background: #ffffff;
          }

          &.is-active {
            color: #165dff;
            border-color: rgba(22, 93, 255, 0.35);
            background: rgba(22, 93, 255, 0.08);
            font-weight: 700;
          }
        }
      }
    }

    .swap-divider {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 2px 0 12px;
      z-index: 2;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8) 20%, rgba(226, 232, 240, 0.8) 80%, transparent);
        z-index: 1;
      }

      .swap-switch-btn {
        position: relative;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
        color: #165dff;
        cursor: pointer;
        padding: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          background: #f8fafc;
          border-color: #165dff;
          color: #0047eb;
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(22, 93, 255, 0.18);
        }

        &:active {
          transform: scale(0.95);
        }

        &.is-flipping .switch-icon {
          transform: rotate(180deg);
        }

        .switch-icon {
          font-size: 16px;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 14px;

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
          padding: 0 12px;
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

        .token-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 4px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;

          .token-icon {
            flex-shrink: 0;
          }

          .token-name {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 0.2px;
          }

          &.is-receive {
            background: rgba(22, 93, 255, 0.06);
            border-color: rgba(22, 93, 255, 0.2);

            .token-name {
              color: #165dff;
            }
          }
        }

        .el-input__suffix-inner {
          display: inline-flex;
          align-items: center;
          height: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          box-shadow: none;
        }

        &.is-disabled {
          .el-input__wrapper {
            background: #f8faff;
            border-color: rgba(22, 93, 255, 0.22);
          }

          .el-input__inner {
            color: var(--theme-primary-blue, #165dff);
            font-weight: 800;
            -webkit-text-fill-color: var(--theme-primary-blue, #165dff);
          }
        }
      }
    }
  }

  :deep(.rate-card) {
    margin: 16px 0 0;
  }

  .steps-guide-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 12px;
    padding: 10px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: var(--theme-radius-md, 6px);
    gap: 6px;

    .step-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .step-idx {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #165dff;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        flex-shrink: 0;
      }

      .step-text {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
      }
    }

    .step-arrow {
      color: #94a3b8;
      font-size: 11px;
      opacity: 0.7;
      flex-shrink: 0;
    }
  }

  .risk-warning-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 0 0 8px;
    padding: 12px 14px;
    background: rgba(245, 158, 11, 0.07);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: var(--theme-radius-md, 6px);

    .warning-icon {
      font-size: 18px;
      color: #d97706;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .warning-body {
      flex: 1;
      min-width: 0;

      .warning-title {
        font-size: 13px;
        font-weight: 700;
        color: #b45309;
        margin-bottom: 3px;
        line-height: 1.3;
      }

      .warning-desc {
        font-size: 11px;
        line-height: 1.5;
        color: #92400e;
      }
    }
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
      .field-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        gap: 6px;

        .field-label {
          margin-bottom: 0;
        }

        .estimate-rate-tip {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }

        .quick-presets {
          display: flex;
          align-items: center;
          gap: 4px;

          .preset-title {
            display: none;
          }

          .preset-pill {
            padding: 1px 6px;
            font-size: 10px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            color: #64748b;
            font-family: inherit;
            line-height: 1.3;

            &.is-active {
              color: #165dff;
              border-color: rgba(22, 93, 255, 0.35);
              background: rgba(22, 93, 255, 0.08);
              font-weight: 700;
            }
          }
        }
      }

      .swap-divider {
        margin: 2px 0 10px;

        .swap-switch-btn {
          width: 32px;
          height: 32px;

          .switch-icon {
            font-size: 14px;
          }
        }
      }

      :deep(.el-form-item) {
        margin-bottom: 10px;

        .el-input {
          font-size: 13px;

          .el-input__wrapper {
            padding: 0 10px;
            min-height: 42px;
            height: 42px;
          }

          .el-input__inner {
            height: 40px;
            line-height: 40px;
            font-size: 14px;
          }

          .token-badge {
            padding: 2px 6px;
            gap: 4px;

            .token-icon {
              width: 16px;
              height: 16px;
            }

            .token-name {
              font-size: 12px;
            }
          }

          .el-input__suffix-inner {
            height: 100%;
            padding: 0;
            border: 0;
            background: transparent;
          }

          &.is-disabled {
            .el-input__wrapper {
              background: #f8faff;
              border-color: rgba(22, 93, 255, 0.2);
            }

            .el-input__inner {
              color: #165dff;
              font-weight: 800;
              -webkit-text-fill-color: #165dff;
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

    .steps-guide-row {
      padding: 8px 10px;
      margin: 12px 0 10px;
      gap: 4px;

      .step-item {
        gap: 4px;

        .step-idx {
          width: 16px;
          height: 16px;
          font-size: 10px;
        }

        .step-text {
          font-size: 10px;
        }
      }

      .step-arrow {
        font-size: 10px;
      }
    }

    .risk-warning-banner {
      padding: 10px 12px;
      gap: 8px;
      margin-bottom: 10px;

      .warning-icon {
        font-size: 16px;
      }

      .warning-body {
        .warning-title {
          font-size: 12px;
        }

        .warning-desc {
          font-size: 10px;
          line-height: 1.4;
        }
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
