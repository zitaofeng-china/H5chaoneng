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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { type FormInstance } from 'element-plus'
import { usePriceStore } from '@/stores/usePriceStore'
import { addressApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import WalletQrcode from './WalletQrcode.vue'
import RateCard from './RateCard.vue'

const { t } = useI18n()
const priceStore = usePriceStore()

const activeTab = ref('USDT')
const formRef = ref<FormInstance>()
const paymentAddress = ref('')

const formData = reactive({
  unitPrice: '2',
  coinAmount: '',
})

// 获取付款地址（USDT和TRX都使用同一个kind=3）
const fetchPaymentAddress = async () => {
  try {
    const response = await addressApi.getAddress({ kind: AddressKind.FLASH_EXCHANGE })
    console.log('获取付款地址响应:', response)
    
    // 检查响应数据结构
    if (response.data) {
      const data = response.data as any
      // 如果 data 是对象且有 address 字段
      if (typeof data === 'object' && !Array.isArray(data) && 'address' in data) {
        paymentAddress.value = data.address
      }
      // 如果 data 是数组，查找 addressKind=3 的项
      else if (Array.isArray(data)) {
        const addressItem = data.find((item: any) => item.addressKind === 3)
        if (addressItem?.address) {
          paymentAddress.value = addressItem.address
        }
      }
      // 如果 data 直接是地址字符串
      else if (typeof data === 'string') {
        paymentAddress.value = data
      }
    }
    
    console.log('解析后的付款地址:', paymentAddress.value)
  } catch (error) {
    console.error('获取付款地址失败:', error)
  }
}

// 处理重试
const handleRetryFetchAddress = () => {
  paymentAddress.value = '' // 清空地址，触发重新加载
  fetchPaymentAddress()
}

// 获取汇率
const exchangeRate = computed(() => {
  if (!priceStore.priceData) return { usdtToTrx: 0, trxToUsdt: 0 }
  return {
    usdtToTrx: Number.parseFloat(priceStore.priceData.usdt_2_trx) || 0,
    trxToUsdt: Number.parseFloat(priceStore.priceData.trx_2_usdt) || 0,
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
    formData.coinAmount = (amount * exchangeRate.value.usdtToTrx).toFixed(2)
  } else {
    // TRX→USDT
    formData.coinAmount = (amount * exchangeRate.value.trxToUsdt).toFixed(2)
  }
})

// 监听切换标签，重置表单
watch(activeTab, (newTab) => {
  formData.unitPrice = newTab === 'USDT' ? '2' : '10'
  formData.coinAmount = ''
})

// 失焦时检查并恢复最小值
const handleBlur = () => {
  const amount = Number.parseFloat(formData.unitPrice)
  
  if (formData.unitPrice === '' || Number.isNaN(amount) || amount < minValue.value) {
    formData.unitPrice = String(minValue.value)
  }
}

// 初始化时获取价格和付款地址
onMounted(() => {
  priceStore.fetchPrice()
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
  :deep(.el-input__inner) {
    padding-right: 15px;
  }
}
</style>
