<template>
  <div id="energy" class="energy-rental">
    <div class="header">
      <div class="title">{{ t('home.title') }}</div>
    </div>
    <el-card class="rental-card">
      <el-tabs v-model="activeTab" class="rental-tabs">
        <el-tab-pane :label="$t('home.transferRental')" name="transfer">
          <TransferRental :payment-address="paymentAddress" @retry="handleRetryFetchAddress" />
        </el-tab-pane>

        <el-tab-pane :label="$t('home.balancePayment')" name="balance">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
            label-position="right"
            label-suffix=":"
            :validate-on-rule-change="false"
            class="rental-form"
            :class="{ 'derail-form-m': isMobile }"
          >
            <el-form-item label-width="0">
              <div class="energy-row">
                <el-radio-group v-model="formData.energy" class="energy-radio-group">
                  <el-radio-button
                    v-for="option in energyOptions"
                    :key="option.value"
                    :value="option.value"
                    class="energy-radio-button"
                  >
                    {{ option.label }}
                  </el-radio-button>
                </el-radio-group>
              </div>
            </el-form-item>

            <div class="form-wrap">
              <el-form-item :label="$t('home.totalPrice')" prop="unitPrice">
                <el-input
                  v-model="unitPrice"
                  type="number"
                  :placeholder="$t('home.enterTotalPrice')"
                  :class="{ 'm-input': isMobile }"
                  readonly
                >
                  <template #prefix v-if="isMobile">{{ $t('home.totalPrice') }}</template>
                  <template #suffix>{{ $t('common.trx') }}</template>
                </el-input>
              </el-form-item>

              <el-form-item :label="$t('home.rentalAddress')" prop="address">
                <el-input
                  v-model="formData.address"
                  :placeholder="$t('home.enterAddress')"
                  class="address-input"
                />
              </el-form-item>

              <div class="info-text">
                {{ $t('home.rentNowMessage', { energy: formData.energy }) }}
              </div>

              <el-form-item :label="$t('home.savedAddress')" prop="selectedAddress">
                <el-select
                  v-model="formData.selectedAddress"
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
                        <g opacity="0.6" clip-path="url(#clip0_1_1693)">
                          <path d="M12.0002 11.1161L8.46101 7.57695C8.22392 7.33985 7.82483 7.3365 7.58076 7.58057C7.33498 7.82635 7.33506 8.21876 7.57713 8.46083L11.1163 12L7.57713 15.5391C7.34003 15.7762 7.33668 16.1753 7.58076 16.4194C7.82654 16.6652 8.21894 16.6651 8.46102 16.423L12.0002 12.8839L15.5393 16.423C15.7764 16.6601 16.1755 16.6635 16.4196 16.4194C16.6654 16.1736 16.6653 15.7812 16.4232 15.5392L12.8841 12L16.4232 8.46083C16.6603 8.22373 16.6637 7.82465 16.4196 7.58057C16.1738 7.33479 15.7814 7.33487 15.5393 7.57695L12.0002 11.1161Z" fill="white"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_1_1693">
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
            </div>

            <el-form-item label-width="0">
              <div class="action-buttons">
                <el-button class="btn-save" type="primary" size="large" @click="handleSaveAddress">
                  {{ $t('home.saveAddress') }}
                </el-button>
                <el-button class="btn-rent" type="warning" size="large" @click="handleRentNow">
                  {{ $t('lease.rentNowButton') }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import TransferRental from './TransferRental.vue'
import { useLangStore } from '@/stores/useLangStore'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { authApi } from '@/api'
import { OrderKind } from '@/api/modules/order/types'
import { AddressKind } from '@/api/modules/address/types'
import { handleResponse } from '@/utils/response'
import { useOrderCreation } from '@/hooks/useOrderCreation'
import { usePaymentAddress } from '@/hooks/usePaymentAddress'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const langStore = useLangStore()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { priceData } = storeToRefs(priceStore)
const { userInfo } = storeToRefs(userStore)
const { loading: orderLoading, createOrder } = useOrderCreation()

const activeTab = ref('transfer')
const formRef = ref<FormInstance>()

// 使用统一的地址管理 hook
const { address: paymentAddress, fetchAddress: fetchPaymentAddress } = usePaymentAddress(AddressKind.FLASH_ENERGY_TRANSFER)

const energyOptions = ref([
  { label: `${t('common.65000')} ${t('lease.energy')}`, value: 65000 },
  { label: `${t('common.131000')} ${t('lease.energy')}`, value: 131000 },
])

// 监听标签页切换，当切换到转账租赁时获取付款地址
watch(activeTab, async (newTab) => {
  if (newTab === 'transfer' && !paymentAddress.value) {
    await fetchPaymentAddress()
  }
}, { immediate: true }) // 添加 immediate: true，组件挂载时立即执行

// 处理重试
const handleRetryFetchAddress = () => {
  fetchPaymentAddress()
}

const formData = reactive({
  energy: 65000,
  address: '',
  selectedAddress: '',
})

// 根据选择的能量数量计算总价
// 65000 能量 = flash 价格
// 131000 能量 = flash 价格 × 2
const unitPrice = computed(() => {
  const flashPrice = Number.parseFloat(priceData.value?.flash || '1.9')
  return formData.energy === 131000 ? (flashPrice * 2).toFixed(2) : flashPrice.toFixed(2)
})

watch([() => formData.energy, () => langStore.currentLocale], () => {
  energyOptions.value = [
    { label: `${t('common.65000')} ${t('lease.energy')}`, value: 65000 },
    { label: `${t('common.131000')} ${t('lease.energy')}`, value: 131000 },
  ]
})

const formRules = computed<FormRules>(() => ({
  energy: [{ required: false, message: t('formValidation.selectEnergy'), trigger: 'change' }],
  address: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: string | Error) => void) => {
        // 如果已保存地址有值，则租用地址可以为空
        if (formData.selectedAddress) {
          callback()
        } else if (!value) {
          // 如果已保存地址为空，则租用地址必填
          callback(new Error(t('formValidation.addressRequired')))
        } else if (value.length < 10) {
          callback(new Error(t('formValidation.addressTooShort')))
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
        // 如果租用地址有值，则已保存地址可以为空
        if (formData.address) {
          callback()
        } else if (!value) {
          // 如果租用地址为空，则已保存地址必选
          callback(new Error(t('formValidation.selectAddress')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}))

const addressOptions = computed(() => {
  // 从用户信息的 address_list 中获取地址列表
  const addresses = userInfo.value?.address_list || []
  return addresses.map((addr, index) => ({
    label: addr,
    value: addr,
  }))
})

const handleSaveAddress = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField('address')

    if (!formData.address) {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
      return
    }

    // 检查地址是否已存在
    const existingAddresses = userInfo.value?.address_list || []
    if (existingAddresses.includes(formData.address)) {
      ElMessage.warning(t('formValidation.addressAlreadyExists'))
      return
    }

    // 更新用户地址列表
    const updatedAddressList = [...existingAddresses, formData.address]
    const response = await authApi.updateUserInfo({ address_list: updatedAddressList })

    // 处理响应并显示提示（使用场景上下文）
    const success = handleResponse(response, {
      context: 'address_save', // 地址保存场景
    })

    if (success) {
      // 重新获取用户信息
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
    // 显示确认对话框
    await ElMessageBox.confirm(
      t('home.deleteAddressConfirm', { address }),
      t('home.deleteAddressTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    )

    // 从地址列表中删除该地址
    const existingAddresses = userInfo.value?.address_list || []
    const updatedAddressList = existingAddresses.filter(addr => addr !== address)
    
    const response = await authApi.updateUserInfo({ address_list: updatedAddressList })

    // 处理响应并显示提示
    const success = handleResponse(response, {
      context: 'address_delete',
    })

    if (success) {
      // 如果删除的是当前选中的地址，清空选择
      if (formData.selectedAddress === address) {
        formData.selectedAddress = ''
      }
      
      // 重新获取用户信息
      const userResponse = await authApi.getUserInfo()
      if (userResponse.data) {
        userStore.updateUserInfo(userResponse.data)
      }
    }
  } catch (error) {
    // 用户取消删除
    if (error === 'cancel') {
      return
    }
    console.error('【ERROR INFO】:', error)
  }
}

const handleRentNow = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const count = formData.energy === 131000 ? 2 : 1
    const targetAddress = formData.address || formData.selectedAddress

    const success = await createOrder({
      count,
      duration: "3600s",
      kind: OrderKind.KindFlashEnergy,
      target: [targetAddress],
      userId: userInfo.value?.id || 0,
      context: 'order_create',
    })
    
    if (success) {
      // 订单创建成功后的处理
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

onMounted(async () => {
  // 获取用户信息
  if (userStore.isLogin) {
    try {
      const response = await authApi.getUserInfo()
      if (response.data) {
        userStore.updateUserInfo(response.data)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})

onUnmounted(() => {
  formRef.value?.resetFields()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/detail-form.scss';

.energy-rental {
  background: var(--theme-bg-light);
  padding: 40px 0 80px;

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

  .rental-form {
    max-width: 720px;
    margin: 0 auto;

    .form-wrap {
      margin-left: -55px;
      padding-right: 46px;
    }

    :deep(.el-form-item) {
      margin-bottom: 18px;

      .el-form-item__content {
        justify-content: center;
      }
    }

    :deep(.el-form-item__label) {
      height: 46px;
      align-items: center;
      line-height: 100%;
      color: var(--theme-text-muted);
      font-size: 14px;
      font-weight: 700;

      &::before {
        color: #ff4d4f;
        margin-top: 4px;
      }
    }

    .energy-radio-group {
      display: flex;
      width: 630px;
      background: rgba(2, 15, 45, 0.03);
      border-radius: 4px;
      box-sizing: border-box;

      .energy-radio-button {
        flex: 1;

        :deep(.el-radio-button__inner) {
          width: 100%;
          height: 36px;
          padding: 0;
          line-height: 36px;
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 14px;
          color: rgba(30, 41, 59, 0.6);
          border-radius: 4px;
          box-shadow: none;
          outline: none;
        }

        :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
          background: var(--theme-bg-blue);
          color: var(--theme-text-white);
        }
      }
    }

    .energy-row {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-bottom: 6px;
    }

    :deep(.el-input__wrapper) {
      background: rgba(2, 15, 45, 0.03);
      border-radius: 4px;
      box-shadow: none;
      border: 1px solid rgba(2, 15, 45, 0.08);
      padding: 0 12px;
      min-height: 44px;

      &.is-disabled,
      &:has(.el-input__inner[readonly]) {
        background: rgba(2, 15, 45, 0.02);
        cursor: not-allowed;
      }
    }

    :deep(.el-input__inner) {
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      color: var(--theme-text-black);

      &[readonly] {
        cursor: not-allowed;
      }
    }

    :deep(.el-input__suffix-inner) {
      font-size: 12px;
      color: rgba(30, 41, 59, 0.5);
    }

    :deep(.address-input) {
      .el-input__wrapper {
        background: none;
      }
    }

    :deep(.el-select) {
      width: 100%;

      .el-select__wrapper {
        height: 44px;
      }

      .el-input__wrapper {
        cursor: pointer;
      }

      .el-input__inner {
        font-size: 14px;
        color: var(--theme-text-muted);
        font-weight: 600;
      }

      .el-select__selected-item {
        font-size: 14px;
        color: var(--theme-text-muted);
        font-weight: 600;
      }
    }

    .info-text {
      margin: -4px 0 18px 100px;
      font-size: 12px;
      color: var(--theme-text-black);
      opacity: 0.6;
    }

    .tip-row {
      margin: -4px 0 22px 100px;
      display: flex;
      align-items: center;
      color: var(--theme-text-black);
      opacity: 0.6;
      font-size: 12px;

      .tip-text {
        padding-left: 4px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 2px;
      width: 630px;

      .el-button {
        flex: 1;
        height: 52px;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 700;
      }
    }

    :deep(.btn-save) {
      background: var(--theme-bg-blue);
      border: none;
    }

    :deep(.btn-rent) {
      background: var(--theme-bg-orange);
      border: none;
    }

    .custom-empty {
      padding: 10px 0;
      text-align: center;
      color: var(--theme-text-light-gray);
      font-size: 14px;
    }
  }

  .placeholder-content {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .energy-rental {
    padding: 0 6px 40px;

    .header {
      padding-bottom: 10px;
    }

    .title {
      font-size: 20px;
    }

    .rental-form {
      :deep(.el-form-item__label) {
        display: none;
      }

      .info-text,
      .tip-row {
        margin-left: 0;
      }

      .form-wrap {
        margin: 0;
        padding: 0;
      }

      .action-buttons .el-button {
        height: 44px;
        font-size: 14px;
      }

      :deep(.el-select) {
        .el-input__inner {
          font-size: 13px;
          font-weight: 600;
        }

        .el-select__selected-item {
          font-size: 13px;
          font-weight: 600;
        }
      }
    }

    .rental-card {
      :deep(.el-card__body) {
        padding: 10px;
        padding-bottom: 30px;
        overflow: hidden;
      }
    }
  }
}
</style>
