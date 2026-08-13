<template>
  <div id="energy" class="energy-rental">
    <section
      class="ecosystem-hero"
      :class="{ 'has-ad': hasAd !== false, 'is-miniapp': isMiniApp }"
      aria-labelledby="ecosystem-title"
    >
      <div v-if="hasAd === false" class="ecosystem-grid" aria-hidden="true"></div>
      <AdBanner @update:hasAd="hasAd = $event" />
      <template v-if="hasAd === false">
        <h1 id="ecosystem-title" class="ecosystem-title">{{ t('home.ecosystemTitle') }}</h1>
        <p class="ecosystem-subtitle">{{ t('home.ecosystemSubtitle') }}</p>
      </template>
    </section>

    <section class="rental-section" aria-labelledby="rental-title">
      <div class="rental-heading">
        <h2 id="rental-title" class="rental-title">{{ t('home.title') }}</h2>
        <p class="rental-subtitle">{{ t('home.rentalSubtitle') }}</p>
      </div>

      <div class="checkout-steps" aria-label="Rental steps">
        <div class="checkout-step is-active">
          <span class="step-index">1</span>
          <span>{{ t('home.selectPlan') }}</span>
        </div>
        <span class="step-line" aria-hidden="true"></span>
        <div class="checkout-step">
          <span class="step-index">2</span>
          <span>{{ t('home.enterAddressStep') }}</span>
        </div>
        <span class="step-line" aria-hidden="true"></span>
        <div class="checkout-step">
          <span class="step-index">3</span>
          <span>{{ t('home.completePayment') }}</span>
        </div>
      </div>

      <el-card
        class="rental-card"
        :class="{
          'is-balance': activeTab === 'balance',
          'is-transfer': activeTab === 'transfer',
        }"
      >
        <div
          class="mode-section"
          :class="{
            'is-balance': activeTab === 'balance',
            'is-transfer': activeTab === 'transfer',
          }"
        >
          <div
            class="mode-label field-label"
            :class="{ 'balance-mode-label': activeTab === 'balance' }"
          >
            {{ t('home.chooseMode') }}
          </div>

          <el-tabs v-model="activeTab" class="rental-tabs">
            <el-tab-pane :label="$t('home.transferRental')" name="transfer">
              <TransferRental :payment-address="paymentAddress" @retry="handleRetryFetchAddress" />
            </el-tab-pane>

            <el-tab-pane :label="$t('home.balancePayment')" name="balance">
              <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="0"
                label-position="top"
                :validate-on-rule-change="false"
                class="rental-form balance-form"
                :class="{ 'derail-form-m': isMobile }"
              >
                <div class="field-label">
                  {{ t('home.energyAmount') }}
                </div>

                <el-form-item label="" class="balance-form-item">
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

                <div class="field-label">
                  {{ t('home.totalPrice') }}
                </div>

                <el-form-item label="" prop="unitPrice" class="balance-form-item">
                  <el-input
                    v-model="unitPrice"
                    type="number"
                    :placeholder="$t('home.enterTotalPrice')"
                    :class="{ 'm-input': isMobile }"
                    readonly
                  >
                    <template #suffix>{{ $t('common.trx') }}</template>
                  </el-input>
                </el-form-item>

                <div class="field-label">
                  {{ t('home.rentalAddress') }}
                </div>

                <el-form-item label="" prop="address" class="balance-form-item">
                  <el-input
                    v-model="formData.address"
                    :placeholder="$t('home.enterAddress')"
                    class="address-input"
                  />
                </el-form-item>

                <div class="info-text">
                  {{ $t('home.rentNowMessage', { energy: formData.energy }) }}
                </div>

                <div class="field-label saved-address-label">
                  <span>{{ t('home.savedAddress') }}</span>
                  <span class="tip-row">
                    <SvgIcon name="fee-info" width="13" height="13" />
                    <span class="tip-text">
                      {{ $t('home.saveTip') }}
                    </span>
                  </span>
                </div>

                <el-form-item label="" prop="selectedAddress" class="balance-form-item">
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
                          <rect opacity="0.1" width="24" height="24" rx="4.5" fill="#020F2D" />
                          <g opacity="0.6" clip-path="url(#clip0_1_1693)">
                            <path d="M12.0002 11.1161L8.46101 7.57695C8.22392 7.33985 7.82483 7.3365 7.58076 7.58057C7.33498 7.82635 7.33506 8.21876 7.57713 8.46083L11.1163 12L7.57713 15.5391C7.34003 15.7762 7.33668 16.1753 7.58076 16.4194C7.82654 16.6652 8.21894 16.6651 8.46102 16.423L12.0002 12.8839L15.5393 16.423C15.7764 16.6601 16.1755 16.6635 16.4196 16.4194C16.6654 16.1736 16.6653 15.7812 16.4232 15.5392L12.8841 12L16.4232 8.46083C16.6603 8.22373 16.6637 7.82465 16.4196 7.58057C16.1738 7.33479 15.7814 7.33487 15.5393 7.57695L12.0002 11.1161Z" fill="white" />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_1693">
                              <rect width="10" height="10" fill="white" transform="translate(7 7)" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="" label-width="0" class="action-form-item">
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
        </div>
      </el-card>

      <div v-if="activeTab === 'transfer'" class="transfer-welfare-link">
        <el-button type="warning" plain size="large" class="page-link-btn" @click="goToWelfare">
          {{ t('home.goToWelfareOrder') }}
          <span class="welfare-help" aria-hidden="true">?</span>
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from '@/utils/element'
import { type FormInstance, type FormRules } from 'element-plus'
import TransferRental from './TransferRental.vue'
import AdBanner from '@/components/business/AdBanner.vue'
import { useLangStore } from '@/stores/useLangStore'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { authApi } from '@/api'
import { type BindAddressMap } from '@/api/modules/auth/types'
import { OrderKind } from '@/api/modules/order/types'
import { AddressKind } from '@/api/modules/address/types'
import { handleResponse } from '@/utils/response'
import { useOrderCreation } from '@/hooks/useOrderCreation'
import { usePaymentAddress } from '@/hooks/usePaymentAddress'
import { storeToRefs } from 'pinia'
import { formatCryptoAmount } from '@/utils/number'
import { withSitePrefix } from '@/utils/site'
import { isMiniAppRuntime } from '@/utils/telegram'

const { t } = useI18n()
const hasAd = ref<boolean | null>(null)
const isMiniApp = ref(isMiniAppRuntime())
const router = useRouter()
const langStore = useLangStore()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { priceData } = storeToRefs(priceStore)
const { userInfo } = storeToRefs(userStore)
const { loading: orderLoading, createOrder } = useOrderCreation()

const activeTab = ref<'transfer' | 'balance'>('balance')
const formRef = ref<FormInstance>()

// 使用统一的地址管理 hook
const { address: paymentAddress, fetchAddress: fetchPaymentAddress } = usePaymentAddress(AddressKind.FLASH_ENERGY_TRANSFER)

const createEnergyOptions = () => [
  { label: `${(65000).toLocaleString()} ${t('lease.energy')}`, value: 65000 },
  { label: `${(131000).toLocaleString()} ${t('lease.energy')}`, value: 131000 },
]

const energyOptions = ref(createEnergyOptions())

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

const bindAddressKind = AddressKind.FLASH_ENERGY_BALANCE

const getBindAddressMap = (): BindAddressMap => {
  return { ...userInfo.value?.bind_address }
}

const getSavedAddressesByKind = (kind: number): string[] => {
  return getBindAddressMap()[kind] || []
}

// 根据选择的能量数量计算总价
// 65000 能量 = flash 价格
// 131000 能量 = flash 价格 × 2
const unitPrice = computed(() => {
  const flashPrice = Number.parseFloat(priceData.value?.flash || '1.9')
  return formatCryptoAmount(formData.energy === 131000 ? flashPrice * 2 : flashPrice)
})

watch([() => formData.energy, () => langStore.currentLocale], () => {
  energyOptions.value = createEnergyOptions()
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
  const addresses = getSavedAddressesByKind(bindAddressKind)
  return addresses.map((addr) => ({
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
    const bindAddress = getBindAddressMap()
    const existingAddresses = getSavedAddressesByKind(bindAddressKind)
    if (existingAddresses.includes(formData.address)) {
      ElMessage.warning(t('formValidation.addressAlreadyExists'))
      return
    }

    bindAddress[bindAddressKind] = [...existingAddresses, formData.address]
    const response = await authApi.updateUserInfo({ bind_address: bindAddress })

    // 处理响应并显示提示（使用场景上下文）
    const success = handleResponse(response, {
      context: 'address_save', // 地址保存场景
    })

    if (success) {
      // 重新获取用户信息（强制刷新 bind_address）
      await userStore.fetchUserInfo({ force: true })
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
    const bindAddress = getBindAddressMap()
    const existingAddresses = getSavedAddressesByKind(bindAddressKind)
    bindAddress[bindAddressKind] = existingAddresses.filter(addr => addr !== address)

    const response = await authApi.updateUserInfo({ bind_address: bindAddress })

    // 处理响应并显示提示
    const success = handleResponse(response, {
      context: 'address_delete',
    })

    if (success) {
      // 如果删除的是当前选中的地址，清空选择
      if (formData.selectedAddress === address) {
        formData.selectedAddress = ''
      }

      await userStore.fetchUserInfo({ force: true })
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

const goToWelfare = () => {
  router.push(withSitePrefix('/welfare'))
}

onMounted(() => {
  isMiniApp.value = isMiniAppRuntime()
})

onUnmounted(() => {
  formRef.value?.resetFields()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/detail-form.scss';

.energy-rental {
  background: var(--theme-bg-light);
  padding: 20px 0 40px;

  .header {
    text-align: center;
    padding-bottom: 20px;
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
    padding: 0 6px 24px;

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

/* 新版首页首屏布局 */
.energy-rental {
  padding: 0 0 84px;
  background: #fff;
}

.ecosystem-hero {
  height: calc(5 * var(--theme-home-band-height, 50px));
  min-height: calc(5 * var(--theme-home-band-height, 50px));
  box-sizing: border-box;
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  background: #fff;

  &.has-ad {
    height: auto;
    min-height: 0;
    padding: 20px 24px 8px;
  }

  :deep(.ad-banner) {
    position: relative;
    z-index: 1;
    width: min(100%, 920px);
    height: 100%;
    margin: 0 auto;
  }

  :deep(.ad-carousel),
  :deep(.ad-skeleton) {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 4.5;
    border-radius: 8px;
  }

  :deep(.ad-image) {
    object-fit: cover;
  }

  &.has-ad.is-miniapp {
    width: 100%;
    padding: 0;

    :deep(.ad-banner) {
      width: 100%;
      max-width: none;
      height: auto;
      margin: 0;
    }

    :deep(.ad-carousel),
    :deep(.ad-skeleton) {
      width: 100%;
      border-radius: 0;
    }
  }
}

.ecosystem-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: #fff;
  background-image:
    var(--theme-home-band-2-color),
    var(--theme-home-band-3-color),
    var(--theme-home-band-4-color),
    var(--theme-home-band-5-color),
    var(--theme-home-band-6-color),
    var(--theme-home-grid-vertical);
  background-size:
    100% var(--theme-home-band-height, 50px),
    100% var(--theme-home-band-height, 50px),
    100% var(--theme-home-band-height, 50px),
    100% var(--theme-home-band-height, 50px),
    100% var(--theme-home-band-height, 50px),
    auto 300px;
  background-position:
    0 0,
    0 var(--theme-home-band-height, 50px),
    0 calc(2 * var(--theme-home-band-height, 50px)),
    0 calc(3 * var(--theme-home-band-height, 50px)),
    0 calc(4 * var(--theme-home-band-height, 50px)),
    0 calc(-1 * var(--theme-home-band-height, 50px));
  background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat;
  -webkit-mask-image: var(--theme-home-grid-mask);
  mask-image: var(--theme-home-grid-mask);
  -webkit-mask-size: 100% calc(6 * var(--theme-home-band-height, 50px));
  mask-size: 100% calc(6 * var(--theme-home-band-height, 50px));
  -webkit-mask-position: 0 calc(-1 * var(--theme-home-band-height, 50px));
  mask-position: 0 calc(-1 * var(--theme-home-band-height, 50px));
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.ecosystem-title {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #1766f5;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: 0.01em;
}

.ecosystem-subtitle {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 18px auto 0;
  color: rgba(71, 84, 103, 0.88);
  font-size: 15px;
  line-height: 1.85;
  font-weight: 400;
}

.rental-section {
  padding: 20px 20px 0;
  background: #fff;
}

.rental-heading {
  text-align: center;
}

.rental-title {
  margin: 0;
  color: #182230;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.25;
}

.rental-subtitle {
  margin: 12px auto 0;
  max-width: 640px;
  color: rgba(71, 84, 103, 0.72);
  font-size: 13px;
  line-height: 1.6;
}

.checkout-steps {
  width: min(560px, 100%);
  margin: 28px auto 24px;
  display: grid;
  grid-template-columns: auto minmax(24px, 1fr) auto minmax(24px, 1fr) auto;
  align-items: center;
  color: #b5bdc9;
}

.checkout-step {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
}

.checkout-step.is-active {
  color: #1766f5;
  font-weight: 600;
}

.step-index {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 20px;
  border-radius: 50%;
  background: #eef2f6;
  color: #98a2b3;
  font-size: 11px;
  font-weight: 700;
}

.checkout-step.is-active .step-index {
  background: #1766f5;
  color: #fff;
  box-shadow: 0 2px 8px rgba(23, 102, 245, 0.28);
}

.step-line {
  height: 1px;
  margin: 0 12px;
  background: #e4e7ec;
}

.rental-card {
  width: min(100%, 896px);
  margin: 0 auto;
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 13px 22px rgba(0, 0, 0, 0.07);
}

.transfer-welfare-link {
  display: flex;
  justify-content: center;
  margin: 20px auto 0;

  .page-link-btn {
    width: min(310px, 100%);
    height: 30px;
    padding: 0 14px;
    border: 1px solid #ffad49;
    border-radius: 3px;
    color: #f39b25;
    background: #fffaf2;
    font-size: 12px;
    font-weight: 500;
  }

  .welfare-help {
    width: 12px;
    height: 12px;
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid currentColor;
    border-radius: 50%;
    font-size: 9px;
    line-height: 1;
  }
}

.rental-card.is-balance {
  width: min(100%, 930px);
  min-height: 670px;
  max-width: 930px;
}

.rental-card.is-balance :deep(.el-card__body),
.rental-card.is-transfer :deep(.el-card__body) {
  padding: 0;
}

.mode-section {
  display: block;
}

.mode-section.is-balance {
  display: flow-root;
  min-height: 670px;
}

.rental-tabs {
  width: min(860px, calc(100% - 32px));
  min-width: 0;
  margin: 20px 0 0 16px;
}

.rental-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.energy-rental .rental-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.rental-tabs :deep(.el-tabs__nav-wrap::after),
.rental-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.rental-tabs :deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  gap: 14px;
  padding: 0;
  background: transparent;
}

.rental-tabs :deep(.el-tabs__item) {
  flex: 1;
  min-width: 0;
  height: 44px;
  box-sizing: border-box;
  padding: 0;
  border: 1px solid #e1e4ea;
  border-radius: 4px;
  color: #606060;
  background: #f9fafb;
  font-size: 14px;
  font-weight: 700;
  line-height: 42px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rental-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
  border-color: #165dff;
  background: #165dff;
  box-shadow: none;
}

.energy-rental .rental-tabs :deep(.el-tabs__nav) {
  gap: 14px;
  padding: 0;
  background: transparent;
}

.balance-mode-label {
  margin-top: 32px !important;
}

.field-label {
  width: min(860px, calc(100% - 32px));
  min-height: 20px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  margin: 16px 0 0 16px;
  padding-left: 12px;
  color: #000;
  font-size: 14px;
  font-weight: 900;
  line-height: 14px;
  white-space: nowrap;
}

.field-label::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 0;
  width: 2px;
  height: 16px;
  border-radius: 2px;
  background: #165dff;
}

.saved-address-label {
  justify-content: flex-start;
}

.saved-address-label > span:first-child {
  flex: 0 0 auto;
}

.rental-form {
  width: 100%;
  max-width: none;
  margin: 0;
}

.energy-rental .rental-form {
  width: 100%;
  max-width: none;
  margin: 0;
}

.rental-form :deep(.el-form-item) {
  width: min(860px, calc(100% - 32px));
  margin: 20px 0 0 16px;
}

.energy-rental .rental-form :deep(.el-form-item) {
  width: min(860px, calc(100% - 32px));
  margin: 20px 0 0 16px;
}

.rental-form :deep(.balance-form-item) {
  margin-bottom: 0;
}

.rental-form :deep(.el-form-item__label) {
  display: none;
}

.rental-form :deep(.el-form-item__content) {
  min-width: 0;
  display: block;
  justify-content: flex-start;
  margin-left: 0 !important;
}

.rental-form .energy-row,
.rental-form .energy-radio-group {
  width: 100%;
}

.energy-radio-group {
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  gap: 14px;
}

.energy-radio-group .energy-radio-button {
  flex: 1;
  min-width: 0;
}

.energy-radio-group .energy-radio-button :deep(.el-radio-button__inner) {
  width: 100%;
  height: 44px;
  box-sizing: border-box;
  padding: 0;
  border: 1px solid #e1e4ea;
  border-radius: 4px;
  background: #f9fafb;
  box-shadow: none;
  color: #606060;
  font-size: 14px;
  font-weight: 700;
  line-height: 42px;
}

.energy-radio-group .energy-radio-button :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #fff;
  border-color: #165dff;
  background: #165dff;
  box-shadow: none;
}

.energy-rental .rental-form .energy-radio-group {
  width: 100%;
}

.energy-rental .rental-form .energy-radio-group .energy-radio-button :deep(.el-radio-button__inner) {
  height: 44px;
  line-height: 42px;
}

.rental-form :deep(.el-input__wrapper),
.rental-form :deep(.el-select__wrapper) {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid #e1e4ea;
  border-radius: 4px;
  background: #fff;
  box-shadow: none;
}

.energy-rental .rental-form :deep(.el-input__wrapper),
.energy-rental .rental-form :deep(.el-select__wrapper) {
  height: 44px;
  min-height: 44px;
}

.rental-form :deep(.el-input__wrapper:focus-within),
.rental-form :deep(.el-select__wrapper.is-focused) {
  border-color: rgba(22, 93, 255, 0.65);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.08);
}

.rental-form :deep(.el-input__inner) {
  height: 42px;
  color: rgba(30, 41, 59, 0.8);
  font-size: 14px;
  line-height: 42px;
}

.rental-form :deep(.el-input__suffix-inner),
.rental-form :deep(.el-select__selected-item) {
  color: rgba(30, 41, 59, 0.4);
  font-size: 14px;
}

.rental-form :deep(.el-input__wrapper:has(.el-input__inner[readonly])) {
  border-color: transparent;
  background: rgba(2, 15, 45, 0.05);
}

.rental-form :deep(.address-input .el-input__wrapper),
.rental-form :deep(.el-select__wrapper) {
  background: #fff;
}

.rental-form .info-text {
  width: min(860px, calc(100% - 32px));
  min-height: 44px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0 0 16px;
  padding: 0 12px;
  border: 1px solid #a7f3d0;
  border-radius: 4px;
  color: rgba(28, 113, 88, 0.8);
  background: #ecfdf5;
  font-size: 14px;
  line-height: 14px;
  text-align: center;
}

.energy-rental .rental-form .info-text {
  width: min(860px, calc(100% - 32px));
  margin: 16px 0 0 16px;
}

.rental-form .tip-row {
  width: auto;
  max-width: 100%;
  min-width: 0;
  flex: 1 1 auto;
  height: 13px;
  margin: 4px 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  color: rgba(30, 41, 59, 0.6);
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
}

.energy-rental .rental-form .tip-row {
  margin: 4px 0 0 auto;
}

.rental-form .tip-row .tip-text {
  min-width: 0;
  padding-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rental-form .action-form-item {
  width: 674px;
  max-width: calc(100% - 32px);
  margin: 16px auto 32px;
}

.energy-rental .rental-form .action-form-item {
  width: 674px;
  max-width: calc(100% - 32px);
  margin: 16px auto 32px;
}

.rental-form .action-buttons {
  width: 100%;
  display: flex;
  gap: 20px;
}

.energy-rental .rental-form .action-buttons {
  width: 100%;
  gap: 20px;
}

.rental-form .action-buttons .el-button {
  flex: 1;
  height: 50px;
  margin: 0;
  border: 0;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 700;
}

.energy-rental .rental-form .action-buttons .el-button {
  height: 50px;
}

.rental-form :deep(.btn-save) {
  background: #165dff;
}

.rental-form :deep(.btn-rent) {
  background: #ff6816;
}

.rental-form .custom-empty {
  padding: 10px 0;
  text-align: center;
  color: rgba(30, 41, 59, 0.4);
  font-size: 14px;
}

/* Keep the transfer tab's layout independent from the balance layout. */
.rental-card.is-transfer {
  width: min(100%, 930px);
  max-width: 930px;
  box-sizing: border-box;
}

.rental-card.is-transfer .mode-label {
  width: calc(100% - 32px);
  max-width: none;
  margin-top: 32px;
  margin-right: 16px;
  margin-left: 16px;
}

.rental-card.is-transfer .rental-tabs {
  width: calc(100% - 32px);
  max-width: none;
  margin-right: 16px;
  margin-left: 16px;
}

.rental-card.is-transfer .mode-section {
  min-height: 0;
}

@media (min-width: 769px) {
  /* Keep the balance form aligned to the card's content box. */
  .rental-card.is-balance .mode-label,
  .rental-card.is-balance .rental-tabs {
    width: calc(100% - 32px);
    max-width: none;
    margin-right: 16px;
    margin-left: 16px;
  }

  .rental-card.is-balance .rental-form.balance-form {
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .rental-card.is-balance .rental-form.balance-form .field-label,
  .rental-card.is-balance .rental-form.balance-form :deep(.el-form-item),
  .rental-card.is-balance .rental-form.balance-form .info-text {
    width: 100%;
    margin-left: 0;
  }

  .rental-card.is-balance .rental-form.balance-form .action-form-item {
    width: 674px;
    max-width: calc(100% - 32px);
    margin: 16px auto 32px;
  }
}

@media (max-width: 768px) {
  .energy-rental {
    padding-bottom: 40px;
  }

  .ecosystem-hero {
    height: calc(5 * var(--theme-home-band-height, 30px));
    min-height: calc(5 * var(--theme-home-band-height, 30px));
    padding: 32px 16px 28px;

    &.has-ad {
      height: auto;
      min-height: 0;
      padding: 14px 12px 4px;
    }

    &.has-ad.is-miniapp {
      padding: 0;
    }

    :deep(.ad-carousel),
    :deep(.ad-skeleton) {
      aspect-ratio: 16 / 5;
    }
  }

  .ecosystem-title {
    font-size: 26px;
  }

  .ecosystem-subtitle {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.7;
  }

  .rental-section {
    padding: 32px 10px 0;
  }

  .rental-title {
    font-size: 28px;
  }

  .rental-subtitle {
    margin-top: 8px;
    font-size: 12px;
  }

  .checkout-steps {
    margin: 22px auto 18px;
  }

  .checkout-step {
    gap: 4px;
    font-size: 10px;
  }

  .step-index {
    width: 16px;
    height: 16px;
    flex-basis: 16px;
    font-size: 10px;
  }

  .step-line {
    margin: 0 6px;
  }

  .rental-card,
  .rental-card.is-balance {
    width: 100%;
    min-height: 0;
  }

  .rental-card :deep(.el-card__body) {
    padding: 0 0 20px;
  }

  .mode-section.is-balance {
    min-height: 0;
  }

  .rental-card.is-balance .rental-tabs {
    width: calc(100% - 20px);
    margin: 16px 10px 0;
  }

  .rental-card.is-transfer .rental-tabs {
    width: calc(100% - 20px);
    margin: 0 10px;
  }

  .rental-card.is-transfer .mode-label {
    width: calc(100% - 20px);
    margin: 20px 10px 0;
  }

  .balance-mode-label {
    margin-top: 20px !important;
  }

  .rental-card.is-balance .field-label,
  .rental-card.is-balance .rental-form,
  .rental-card.is-balance .rental-form .info-text {
    width: calc(100% - 20px);
  }

  .rental-card.is-balance .field-label {
    margin-left: 10px;
    font-size: 13px;
  }

  .rental-card.is-balance .rental-form {
    margin: 0;
  }

  .rental-card.is-balance .rental-form :deep(.balance-form-item) {
    width: calc(100% - 20px);
    margin-left: 10px;
  }

  .rental-card.is-balance .rental-form .info-text {
    margin-left: 10px;
    font-size: 12px;
  }

  .rental-card.is-balance .rental-form .saved-address-label {
    display: block;
    min-height: 32px;
    white-space: normal;
  }

  .rental-card.is-balance .rental-form .tip-row {
    width: 100%;
    margin: 6px 0 0;
    font-size: 11px;
  }

  .rental-card.is-balance .rental-form .action-form-item {
    width: calc(100% - 20px);
    max-width: none;
    margin: 16px 10px 0;
  }

  .rental-card.is-balance .rental-form .action-buttons {
    gap: 8px;
  }

  .rental-card.is-balance .rental-form .action-buttons .el-button {
    height: 44px;
    font-size: 14px;
  }
}
</style>
