<template>
  <div class="time-rental-page">
    <div class="rental-wrapper">
      <div class="selection-grid">
        <div class="grid-row" v-for="(row, rIdx) in rows" :key="rIdx">
          <div class="row-options">
            <button
              v-for="(opt, idx) in row.options"
              :key="idx"
              :class="['pill', !isCustom && selecteIndex[0] === rIdx && selecteIndex[1] === idx ? 'active' : '']"
              @click="onSelect(rIdx, idx)"
            >
              {{ opt }}
            </button>
            <button
              :class="['pill', isCustom ? 'active' : '']"
              @click="onCustomClick"
            >
              {{ t('lease.custom') }}
            </button>
          </div>
        </div>
        
        <!-- 自定义笔数输入框 -->
        <div v-if="isCustom" class="custom-input-wrapper">
          <el-form-item :label="t('lease.customCount')" class="custom-form-item">
            <el-input
              v-model.number="customCount"
              type="number"
              :min="1"
              :max="1000"
              :placeholder="t('lease.enterCustomCount')"
              @input="handleCustomInput"
            >
              <template #suffix> {{ t('common.purchase') }} </template>
            </el-input>
          </el-form-item>
        </div>
      </div>

      <div class="details-card">
        <div class="card-title">{{ t('lease.rentalDetails') }}</div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="115px"
          label-suffix=":"
          class="details-form"
          :class="{ 'derail-form-m': isMobile }"
        >
          <el-form-item :label="t('lease.totalPrice')" prop="total">
            <el-input :model-value="totalDisplay" disabled :class="{ 'm-input': isMobile }">
              <template #prefix v-if="isMobile"> {{ t('lease.totalPrice') }} </template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="t('lease.walletAddress')" prop="wallet">
            <el-input v-model="wallet" :placeholder="t('lease.enterAddress')" />
          </el-form-item>

          <el-form-item>
            <div class="btn-wrap">
              <el-button type="primary" class="rent-btn" @click="handleRent">
                {{ t('lease.rentNowButton') }}
              </el-button>
              <el-button type="primary" class="rent-btn buy-btn" @click="handleBuy">
                {{ t('lease.usdtBuy') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <KindTips :tips="tips" />
    </div>

    <!-- 付款地址弹窗 -->
    <el-dialog
      v-model="showPaymentDialog"
      :title="t('countRental.title')"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="payment-dialog">
        <div class="payment-info">
          <div class="info-row">
            <span class="label">{{ t('lease.count') }}:</span>
            <span class="value">{{ count }} {{ t('common.purchase') }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('lease.unitPrice') }}:</span>
            <span class="value">{{ unitPrice }} {{ t('common.trx') }}</span>
          </div>
          <div class="info-row highlight">
            <span class="label">{{ t('lease.totalPrice') }}:</span>
            <span class="value">{{ totalDisplay }} {{ t('common.trx') }}</span>
          </div>
        </div>

        <div class="qr-section">
          <div class="section-title">{{ t('transferRental.walletQrcode') }}</div>
          <div class="qr-code">
            <img v-if="paymentAddress" :src="qrCode" alt="Payment QR Code" class="qr-image" />
            <el-skeleton v-else animated>
              <template #template>
                <el-skeleton-item variant="image" style="width: 192px; height: 192px" />
              </template>
            </el-skeleton>
          </div>
          <div class="wallet-address">
            <span class="address-text">{{ paymentAddress || t('common.loading') }}</span>
            <el-button
              v-if="paymentAddress"
              link
              type="primary"
              @click="copyAddress"
              class="copy-button"
              :loading="isCopying"
            >
              <SvgIcon name="transfer-copy" width="24" height="24" />
            </el-button>
          </div>
          <div class="tips-info">
            <SvgIcon name="fee-info" width="12" height="12" />
            {{ t('transferRental.addressTip') }}
          </div>
        </div>

        <div class="payment-tips">
          <div class="tip-item" v-for="(tip, idx) in paymentTips" :key="idx">
            <SvgIcon name="trumpet" width="12" height="12" />
            <span>{{ tip }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useClipboard } from '@vueuse/core'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useAddress } from '@/hooks/useAddress'
import { AddressKind } from '@/api/modules/address/types'

defineOptions({ name: 'CountRental' })

interface RentalForm {
  unitPrice: number
  count: number
  total: number
  energy: number
  validity: number
  wallet: string
}

const { t } = useI18n()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const { isMobile } = storeToRefs(commonStore)
const { fetchAddress, addressData, loading: addressLoading } = useAddress()
const { copy } = useClipboard()

// 显示付款地址弹窗
const showPaymentDialog = ref(false)
const isCopying = ref(false)

// 生成二维码
const paymentAddress = computed(() => addressData.value?.address || '')
const qrCode = useQRCode(paymentAddress)

// 动态获取按笔租赁单价
const strokePrice = computed(() => {
  const price = priceStore.priceData?.stroke || '3.5'
  return parseFloat(price)
})

const rows = computed(() => {
  const counts = [1, 3, 5, 7, 10]
  return [
    {
      options: counts.map(count => {
        const total = (count * strokePrice.value).toFixed(1)
        return `${count}${t('common.purchase')}(${total}${t('common.trx')})`
      }),
      counts: counts, // 保存原始笔数数组
    },
  ]
})

const tips = computed(() => [
  t('countRental.tips1'),
  t('countRental.tips2'),
  t('countRental.tips3'),
  t('countRental.tips4'),
])

const paymentTips = computed(() => [
  t('transferRental.walletTips'),
  t('transferRental.noUsdtTip'),
  t('transferRental.expiryTip'),
  t('transferRental.amountTip'),
])

const selecteIndex = ref<[number, number]>([0, 0])
const isCustom = ref(false)
const customCount = ref<number>(1)

// 使用动态价格
const unitPrice = computed(() => strokePrice.value)

const count = computed(() => {
  if (isCustom.value) {
    return customCount.value
  }
  // 直接从 counts 数组获取笔数，而不是从文本中提取
  const rowData = rows.value[selecteIndex.value[0]]
  if (rowData && rowData.counts) {
    return rowData.counts[selecteIndex.value[1]] || 1
  }
  return 1
})

const energy = ref(13.0)
const validity = ref(3)
const wallet = ref('')

const total = computed(() => +(unitPrice.value * count.value).toFixed(4))
const totalDisplay = computed(() => `${total.value}`)

const formRef = ref<FormInstance>()
const form = reactive<RentalForm>({
  unitPrice: 0,
  count: 0,
  total: 0,
  energy: energy.value,
  validity: validity.value,
  wallet: wallet.value,
})

const rules = computed<FormRules<RentalForm>>(() => ({
  total: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.totalMustBePositive')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  wallet: [
    { required: true, message: t('formValidation.walletRequired'), trigger: 'blur' },
    { min: 5, message: t('formValidation.walletTooShort'), trigger: 'blur' },
  ],
}))

watch([total, unitPrice, count], () => {
  form.total = total.value
  form.unitPrice = unitPrice.value
  form.count = count.value
})

watch(wallet, (v) => (form.wallet = v))

function onSelect(rowIdx: number, idx: number) {
  selecteIndex.value = [rowIdx, idx]
  isCustom.value = false
}

function onCustomClick() {
  isCustom.value = true
}

function handleCustomInput(value: string | number) {
  const num = typeof value === 'string' ? parseInt(value) : value
  if (isNaN(num) || num < 1) {
    customCount.value = 1
  } else if (num > 1000) {
    customCount.value = 1000
  } else {
    customCount.value = num
  }
}

const handleRent = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    
    // 获取付款地址
    const address = await fetchAddress(AddressKind.COUNT_RENTAL)
    if (address) {
      showPaymentDialog.value = true
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

const handleBuy = () => {}

// 复制地址
const copyAddress = async () => {
  if (!paymentAddress.value) return
  
  isCopying.value = true
  try {
    await copy(paymentAddress.value)
    ElMessage.success(t('transferRental.copyAddress'))
  } catch {
    ElMessage.error(t('transferRental.copyFailed'))
  } finally {
    setTimeout(() => {
      isCopying.value = false
    }, 1000)
  }
}

// 页面加载时获取价格
onMounted(() => {
  priceStore.fetchPrice()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/detail-form.scss';

.time-rental-page {
  padding: 18px;
  display: flex;
  justify-content: center;
}

.rental-wrapper {
  width: 856px;
  background: var(--theme-text-white);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 6px 24px rgba(16, 24, 40, 0.08);
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 6px 0 12px;
}

.selection-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}

.grid-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
}

.row-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.pill {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  background: var(--theme-time-bg-light);
  color: var(--theme-text-light-gray);
  border: none;
  cursor: pointer;

  &.active {
    background: var(--theme-bg-blue);
    color: var(--theme-text-white);
  }
}

.custom-input-wrapper {
  margin-top: 12px;
  padding: 16px;
  background: var(--theme-time-bg-light);
  border-radius: 8px;

  .custom-form-item {
    margin-bottom: 0;

    :deep(.el-form-item__label) {
      font-weight: 600;
      color: var(--theme-text-black);
    }

    :deep(.el-input__suffix) {
      color: var(--theme-text-muted);
    }
  }
}

@media (max-width: 768px) {
  .time-rental-page {
    padding: 16px;
    display: block;
  }

  .rental-wrapper {
    width: initial;
    padding: 18px;
  }

  .row-options {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .pill {
    font-size: 12px;
  }
}

.payment-dialog {
  .payment-info {
    background: var(--theme-time-bg-light);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;

      .label {
        color: var(--theme-text-muted);
      }

      .value {
        font-weight: 600;
        color: var(--theme-text-black);
      }

      &.highlight {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        margin-top: 8px;
        padding-top: 12px;

        .value {
          font-size: 18px;
          color: var(--theme-bg-blue);
        }
      }
    }
  }

  .qr-section {
    text-align: center;
    padding: 16px 0;

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--theme-text-black);
      margin-bottom: 12px;
    }

    .qr-code {
      width: 192px;
      height: 192px;
      margin: 0 auto;

      .qr-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .wallet-address {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      color: var(--theme-text-black);

      .address-text {
        font-family: 'Courier New', monospace;
        word-break: break-all;
      }

      .copy-button {
        padding: 0;
        height: 18px;
      }
    }

    .tips-info {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      margin-top: 8px;
      color: var(--theme-text-light-gray-muted);

      svg {
        color: var(--theme-text-black);
        margin-right: 4px;
      }
    }
  }

  .payment-tips {
    margin-top: 16px;
    padding: 12px;
    background: rgba(255, 243, 224, 0.5);
    border-radius: 8px;

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 12px;
      color: var(--theme-text-muted);
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      svg {
        flex-shrink: 0;
        margin-top: 2px;
      }
    }
  }
}
</style>
