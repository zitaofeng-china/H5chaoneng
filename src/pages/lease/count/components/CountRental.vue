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
              :max="maxCount"
              :placeholder="t('lease.enterCustomCount')"
              @input="handleCustomInput"
            >
              <template #suffix> {{ t('common.purchase') }} </template>
            </el-input>
            <div class="max-count-hint">
              {{ t('lease.maxCountHint', { max: maxCount }) }}
            </div>
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
          <el-form-item :label="$t('home.savedAddress')" prop="selectedAddress">
            <el-select
              v-model="selectedAddress"
              :placeholder="$t('home.selectSavedAddress')"
              style="width: 100%"
              :class="{ 'm-input': isMobile }"
            >
              <template #empty>
                <div class="custom-empty">
                  {{ $t('home.noSavedAddress') }}
                </div>
              </template>
              <el-option
                v-for="addr in addressOptions"
                :key="addr.value"
                :label="addr.label"
                :value="addr.value"
              >
                <div class="address-option">
                  <span class="address-text">{{ addr.label }}</span>
                  <svg
                    class="delete-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    @click.stop="handleDeleteAddress(addr.value)"
                  >
                    <rect opacity="0.1" width="24" height="24" rx="4.5" fill="#020F2D"/>
                    <g opacity="0.6" clip-path="url(#count-rental-delete-icon)">
                      <path d="M12.0002 11.1161L8.46101 7.57695C8.22392 7.33985 7.82483 7.3365 7.58076 7.58057C7.33498 7.82635 7.33506 8.21876 7.57713 8.46083L11.1163 12L7.57713 15.5391C7.34003 15.7762 7.33668 16.1753 7.58076 16.4194C7.82654 16.6652 8.21894 16.6651 8.46102 16.423L12.0002 12.8839L15.5393 16.423C15.7764 16.6601 16.1755 16.6635 16.4196 16.4194C16.6654 16.1736 16.6653 15.7812 16.4232 15.5392L12.8841 12L16.4232 8.46083C16.6603 8.22373 16.6637 7.82465 16.4196 7.58057C16.1738 7.33479 15.7814 7.33487 15.5393 7.57695L12.0002 11.1161Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="count-rental-delete-icon">
                        <rect width="10" height="10" fill="white" transform="translate(7 7)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <div class="tip-row">
            <SvgIcon name="fee-info" width="12" height="12" />
            <span class="tip-text">
              {{ $t('home.saveTip') }}
            </span>
          </div>

          <el-form-item>
            <div class="btn-wrap">
              <el-button type="primary" class="rent-btn" @click="handleSaveAddress">
                {{ $t('home.saveAddress') }}
              </el-button>
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

    <!-- USDT 付款地址弹窗 -->
    <el-dialog
      v-model="showPaymentDialog"
      :title="t('countRental.usdtPaymentTitle')"
      width="500px"
      :close-on-click-modal="false"
      :class="{ 'mobile-dialog': isMobile }"
    >
      <div class="payment-dialog">
        <!-- 温馨提示移到顶部 -->
        <div class="payment-tips">
          <div class="tip-item" v-for="(tip, idx) in paymentTips" :key="idx">
            <SvgIcon name="trumpet" width="12" height="12" />
            <span>{{ tip }}</span>
          </div>
        </div>

        <QrCodeWithAddress
          v-if="paymentAddress"
          :address="paymentAddress"
          :title="t('transferRental.walletQrcode')"
          :tip="t('common.checkWalletAddress')"
        />
        <div v-else class="qr-section">
          <div class="section-title">{{ t('transferRental.walletQrcode') }}</div>
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 192px; height: 192px; margin: 0 auto" />
            </template>
          </el-skeleton>
          <div class="wallet-address">
            <span class="address-text">{{ t('common.loading') }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { authApi } from '@/api'
import { type BindAddressMap } from '@/api/modules/auth/types'
import { useAddress } from '@/hooks/useAddress'
import { useOrderCreation } from '@/hooks/useOrderCreation'
import { AddressKind } from '@/api/modules/address/types'
import { OrderKind } from '@/api/modules/order/types'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'
import { handleResponse } from '@/utils/response'

defineOptions({ name: 'CountRental' })

interface RentalForm {
  unitPrice: number
  count: number
  total: number
  energy: number
  validity: number
  wallet: string
  selectedAddress: string
}

const { t } = useI18n()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { userInfo } = storeToRefs(userStore)
const { fetchAddress, addressData } = useAddress()
const { loading: orderLoading, createOrder } = useOrderCreation()

// 显示付款地址弹窗
const showPaymentDialog = ref(false)

// 生成二维码 - 修复：接口直接返回地址字符串，而不是对象
const paymentAddress = computed(() => {
  // addressData.value 可能是字符串或对象
  if (typeof addressData.value === 'string') {
    return addressData.value
  }
  return (addressData.value as any)?.address || ''
})

// USDT 单价（从价格接口获取 stroke_usdt 字段）
const usdtUnitPrice = computed(() => {
  const price = priceStore.priceData?.stroke_usdt || '11'
  return parseFloat(price)
})

// 动态获取按笔租赁单价
const strokePrice = computed(() => {
  const price = priceStore.priceData?.stroke || '3.5'
  return parseFloat(price)
})

// 计算用户可购买的最大笔数
const maxCount = computed(() => {
  const balance = parseFloat(userInfo.value?.trx_balance || '0')
  const price = strokePrice.value
  
  if (price <= 0) return 1000 // 如果价格无效，使用默认最大值
  
  const max = Math.floor(balance / price)
  return Math.max(1, Math.min(max, 1000)) // 最小为1，最大为1000
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
  t('countRental.usdtTip1', { amount: usdtUnitPrice.value }), // 转账 {amount} USDT = 获取购买1笔
  t('countRental.usdtTip2'), // 购买多笔请转对应USDT的倍数金额
  t('countRental.usdtTip3'), // 请注意金额，错误金额将当成1小时能量发货
])

const selecteIndex = ref<[number, number]>([0, 0])
const isCustom = ref(false)
const customCount = ref<number>(1)
const selectedAddress = ref('')
const bindAddressKind = AddressKind.COUNT_RENTAL

const getBindAddressMap = (): BindAddressMap => {
  return { ...(userInfo.value?.bind_address || {}) }
}

const getSavedAddressesByKind = (kind: number): string[] => {
  return getBindAddressMap()[kind] || []
}

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
const addressOptions = computed(() => {
  return getSavedAddressesByKind(bindAddressKind).map((addr) => ({
    label: addr,
    value: addr,
  }))
})

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
  selectedAddress: selectedAddress.value,
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
    {
      validator: (_rule: unknown, value: string, callback: (error?: string | Error) => void) => {
        if (selectedAddress.value) {
          callback()
        } else if (!value) {
          callback(new Error(t('formValidation.walletRequired')))
        } else if (value.length < 5) {
          callback(new Error(t('formValidation.walletTooShort')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  selectedAddress: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: string | Error) => void) => {
        if (wallet.value) {
          callback()
        } else if (!value) {
          callback(new Error(t('formValidation.selectAddress')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}))

watch([total, unitPrice, count], () => {
  form.total = total.value
  form.unitPrice = unitPrice.value
  form.count = count.value
  // 更新后清除 total 字段的验证错误
  formRef.value?.clearValidate('total')
}, { immediate: true })

watch(wallet, (v) => (form.wallet = v))
watch(selectedAddress, (v) => {
  form.selectedAddress = v
})

const handleSaveAddress = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField('wallet')

    if (!wallet.value) {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
      return
    }

    const bindAddress = getBindAddressMap()
    const existingAddresses = getSavedAddressesByKind(bindAddressKind)
    if (existingAddresses.includes(wallet.value)) {
      ElMessage.warning(t('formValidation.addressAlreadyExists'))
      return
    }

    bindAddress[bindAddressKind] = [...existingAddresses, wallet.value]
    const response = await authApi.updateUserInfo({ bind_address: bindAddress })
    const success = handleResponse(response, {
      context: 'address_save',
    })

    if (success) {
      const userResponse = await authApi.getUserInfo()
      if (userResponse.data) {
        userStore.updateUserInfo(userResponse.data)
      }
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

const handleDeleteAddress = async (address: string) => {
  try {
    await ElMessageBox.confirm(
      t('home.deleteAddressConfirm', { address }),
      t('home.deleteAddressTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    )

    const bindAddress = getBindAddressMap()
    const existingAddresses = getSavedAddressesByKind(bindAddressKind)
    bindAddress[bindAddressKind] = existingAddresses.filter(addr => addr !== address)

    const response = await authApi.updateUserInfo({ bind_address: bindAddress })
    const success = handleResponse(response, {
      context: 'address_delete',
    })

    if (success) {
      if (selectedAddress.value === address) {
        selectedAddress.value = ''
      }

      const userResponse = await authApi.getUserInfo()
      if (userResponse.data) {
        userStore.updateUserInfo(userResponse.data)
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('【ERROR INFO】:', error)
  }
}

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
  } else if (num > maxCount.value) {
    customCount.value = maxCount.value
    ElMessage.warning(t('lease.exceedMaxCount', { max: maxCount.value }))
  } else {
    customCount.value = num
  }
}

const handleRent = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()

    const targetAddress = wallet.value || selectedAddress.value

    const success = await createOrder({
      count: count.value,
      duration: undefined,
      kind: OrderKind.KindStrokeEnergy,
      target: [targetAddress],
      userId: userInfo.value?.id || 0,
      context: 'lease_count',
    })
    
    if (success) {
      wallet.value = ''
      selectedAddress.value = ''
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

const handleBuy = async () => {
  try {
    // 获取 USDT 付款地址（kind = 5，按笔数租用）
    const address = await fetchAddress(AddressKind.COUNT_RENTAL)
    
    if (address) {
      // 显示付款弹窗
      showPaymentDialog.value = true
    } else {
      ElMessage.error(t('common.getAddressFailed'))
    }
  } catch (error) {
    console.error('【USDT购买错误】:', error)
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
  @include rental-card;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 6px 0 12px;
}

.custom-empty {
  padding: 10px 0;
  text-align: center;
  color: var(--theme-text-light-gray);
  font-size: 14px;
}

.address-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.address-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-icon {
  flex-shrink: 0;
  cursor: pointer;
}

.tip-row {
  margin: -4px 0 18px 115px;
  display: flex;
  align-items: center;
  color: var(--theme-text-black);
  opacity: 0.6;
  font-size: 12px;

  .tip-text {
    padding-left: 4px;
  }
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
  @include pill-button;
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
  
  .max-count-hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--theme-text-muted);
  }
}

@media (max-width: 768px) {
  .time-rental-page {
    padding: 6px;
  }

  .rental-wrapper {
    width: 100%;
    padding: 10px;
  }

  .selection-grid {
    gap: 10px;
    margin-bottom: 20px;
  }

  .grid-row {
    gap: 6px;
    padding: 4px 0;
  }

  .row-options {
    gap: 8px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .pill {
    height: 38px;
    font-size: 13px;
    padding: 0 8px;
    min-width: 0;
  }

  .custom-input-wrapper {
    margin-top: 10px;
    padding: 12px;

    .custom-form-item {
      :deep(.el-form-item__label) {
        font-size: 13px;
      }

      :deep(.el-input__inner) {
        height: 40px;
        font-size: 14px;
      }
    }
  }

  .details-card {
    .card-title {
      font-size: 15px;
      margin-bottom: 16px;
    }
  }

  .tip-row {
    margin-left: 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    padding-bottom: 6px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    height: 40px;
  }

  .btn-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    :deep(.el-button) {
      width: 100%;
      height: 44px !important;
      font-size: 15px;
      margin: 0 !important;
      padding: 0 16px;
      line-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  :deep(.el-dialog) {
    width: 90% !important;
    max-width: 400px;
    border-radius: 12px;
    margin: auto;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }

  :deep(.el-dialog__header) {
    padding: 12px 16px;
    border-bottom: 1px solid var(--theme-border-light);
    margin: 0;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  :deep(.el-dialog__body) {
    padding: 14px 16px 14px;
    margin: 0;
  }

  .payment-dialog {
    .payment-tips {
      margin-bottom: 16px;
      padding: 12px;
      background: var(--theme-choose-orange-bg);
      border-radius: 8px;
      border: 1px solid var(--theme-choose-orange);

      .tip-item {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: var(--theme-text-black);
        margin-bottom: 8px;
        line-height: 1.4;

        &:last-child {
          margin-bottom: 0;
        }

        svg {
          flex-shrink: 0;
          margin-top: 1px;
          width: 13px;
          height: 13px;
          color: var(--theme-choose-orange);
        }

        span {
          flex: 1;
        }
      }
    }

    :deep(.qr-section) {
      padding: 0 !important;
      margin: 0 !important;

      .section-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .qr-code {
        margin: 0 auto 8px;
      }

      .wallet-address {
        margin-top: 8px;
        font-size: 12px;
      }

      .tips-info {
        margin-top: 6px;
        margin-bottom: 0;
      }
    }
  }
}

.payment-dialog {
  .payment-tips {
    padding: 12px;
    background: var(--theme-choose-orange-bg);
    border-radius: 8px;
    border: 1px solid rgba(249, 115, 22, 0.3);

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 12px;
      color: var(--theme-text-black);
      margin-bottom: 8px;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }

      svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--theme-choose-orange);
      }

      span {
        flex: 1;
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
    }
  }
}

// PC端样式优化 - 使用主题颜色
@media (min-width: 769px) {
  .payment-dialog {
    .payment-tips {
      padding: 20px;
      margin-bottom: 24px;
      background: var(--theme-choose-orange-bg);
      border: 2px solid var(--theme-choose-orange);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);

      .tip-item {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 12px;
        line-height: 1.6;
        color: var(--theme-text-black);

        &:last-child {
          margin-bottom: 0;
        }

        svg {
          width: 16px;
          height: 16px;
          margin-top: 3px;
          color: var(--theme-choose-orange);
        }

        span {
          flex: 1;
        }
      }
    }
  }
}

/* 适配 300px 超小屏幕 */
@media (max-width: 360px) {
  .time-rental-page {
    padding: 4px;
  }

  .rental-wrapper {
    padding: 8px;
  }

  .selection-grid {
    gap: 8px;
    margin-bottom: 16px;
  }

  .grid-row {
    gap: 5px;
    padding: 3px 0;
  }

  .row-options {
    gap: 6px;
    grid-template-columns: repeat(2, 1fr);
  }

  .pill {
    height: 34px;
    font-size: 11px;
    padding: 0 6px;
    border-radius: 5px;
  }

  .custom-input-wrapper {
    margin-top: 8px;
    padding: 10px;

    .custom-form-item {
      :deep(.el-form-item__label) {
        font-size: 12px;
      }

      :deep(.el-input__inner) {
        height: 36px;
        font-size: 13px;
      }

      :deep(.el-input__suffix) {
        font-size: 12px;
      }
    }

    .max-count-hint {
      margin-top: 6px;
      font-size: 11px;
    }
  }

  .details-card {
    padding: 12px;

    .card-title {
      font-size: 14px;
      margin-bottom: 12px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    font-size: 12px;
    padding-bottom: 4px;
  }

  :deep(.el-input__inner) {
    font-size: 13px;
    height: 36px;
  }

  .btn-wrap {
    gap: 10px;

    :deep(.el-button) {
      height: 40px !important;
      font-size: 14px;
      padding: 0 12px;
      line-height: 40px;
    }
  }

  :deep(.el-dialog) {
    width: 94% !important;
    border-radius: 10px;
  }

  :deep(.el-dialog__header) {
    padding: 10px 12px;
  }

  :deep(.el-dialog__title) {
    font-size: 15px;
  }

  :deep(.el-dialog__body) {
    padding: 12px;
  }

  .payment-dialog {
    .payment-tips {
      margin-bottom: 12px;
      padding: 10px;
      border-radius: 6px;

      .tip-item {
        font-size: 11px;
        gap: 5px;
        margin-bottom: 6px;
        line-height: 1.3;

        svg {
          width: 12px;
          height: 12px;
        }
      }
    }

    :deep(.qr-section) {
      .section-title {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .qr-code {
        width: 160px !important;
        height: 160px !important;
      }

      .wallet-address {
        margin-top: 6px;
        font-size: 11px;
      }
    }
  }
}
</style>
