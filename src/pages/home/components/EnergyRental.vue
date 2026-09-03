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

      <div class="rental-board">
        <button v-if="showWelfare" type="button" class="welfare-rail is-copy" @click="goToWelfare">
          <span class="welfare-copy-panel">
            <img class="welfare-copy-deco is-gold" :src="welfareCoinGoldImage" alt="" draggable="false" />
            <img class="welfare-copy-deco is-star" :src="welfareStarImage" alt="" draggable="false" />
            <img class="welfare-copy-deco is-sparkle" :src="welfareSparkleImage" alt="" draggable="false" />
            <span class="welfare-kicker">{{ t('home.welfarePromoKicker') }}</span>
            <strong class="welfare-rail-title">{{ t('home.welfareOrder') }}</strong>
            <span class="welfare-deal">
              <span class="welfare-deal-coins">
                <img class="welfare-deal-coin is-usdt" :src="welfareCoinUsdtImage" alt="" draggable="false" />
                <img class="welfare-deal-coin is-trx" :src="welfareCoinTrxImage" alt="" draggable="false" />
              </span>
              <span class="welfare-deal-copy">
                <span class="welfare-deal-price">{{ welfarePrice }} {{ t('common.trx') }}</span>
                <span class="welfare-deal-energy">{{ t('common.65000') }} {{ t('lease.energy') }}</span>
              </span>
            </span>
            <span class="welfare-tagline">{{ t('home.welfarePromoTagline') }}</span>
            <span class="welfare-cta">{{ t('home.welfarePromoCta') }}</span>
          </span>
        </button>

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
          <div class="mode-label-wrap">
            <div
              class="mode-label field-label"
              :class="{ 'balance-mode-label': activeTab === 'balance' }"
            >
              {{ t('home.chooseMode') }}
            </div>
            <el-tooltip v-if="showWelfare" :content="t('home.welfareOrderSubtitle')" placement="top">
              <button type="button" class="welfare-entry" @click="goToWelfare">
                <img class="welfare-entry-gift" :src="welfareGiftBoxImage" alt="" draggable="false" />
                {{ t('home.claimWelfare') }}
              </button>
            </el-tooltip>
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
          <div v-if="isMobile && showWelfare" class="mobile-welfare-link">
            <button type="button" class="mobile-welfare-btn" @click="goToWelfare">
              <span class="mobile-welfare-copy">
                {{ t('home.goToWelfareOrder') }}
                <span class="mobile-welfare-arrow" aria-hidden="true"></span>
              </span>
              <img
                class="mobile-welfare-gift"
                :src="welfareMobileBtnGiftImage"
                alt=""
                draggable="false"
              />
            </button>
          </div>
        </div>
      </el-card>

        <button v-if="showWelfare" type="button" class="welfare-rail is-art" @click="goToWelfare" :aria-label="t('home.goToWelfareOrder')">
          <span class="welfare-stage">
            <span class="welfare-glow" aria-hidden="true"></span>
            <img class="welfare-piece is-star-s" :src="welfareStarImage" alt="" draggable="false" />
            <img class="welfare-piece is-star" :src="welfareStarImage" alt="" draggable="false" />
            <img class="welfare-piece is-gold" :src="welfareCoinGoldImage" alt="" draggable="false" />
            <img class="welfare-piece is-gift" :src="welfareGiftBoxImage" alt="" draggable="false" />
            <img class="welfare-piece is-usdt" :src="welfareCoinUsdtImage" alt="" draggable="false" />
            <img class="welfare-piece is-trx" :src="welfareCoinTrxImage" alt="" draggable="false" />
            <img class="welfare-piece is-gold-s" :src="welfareCoinGoldSmallImage" alt="" draggable="false" />
            <img class="welfare-piece is-sparkle" :src="welfareSparkleImage" alt="" draggable="false" />
            <img class="welfare-piece is-sparkle-2" :src="welfareSparkleImage" alt="" draggable="false" />
            <span class="welfare-gift-hint">
              {{ t('home.welfarePromoGiftHint') }}
            </span>
          </span>
        </button>
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
import { useSiteStore } from '@/stores/useSiteStore'
import { useUserStore } from '@/stores/useUserStore'
import welfareGiftBoxImage from '@/assets/images/welfare/welfare-gift-box.png'
import welfareMobileBtnGiftImage from '@/assets/images/welfare/welfare-mobile-btn-gift.png'
import welfareCoinTrxImage from '@/assets/images/welfare/welfare-coin-trx.png'
import welfareCoinUsdtImage from '@/assets/images/welfare/welfare-coin-usdt.png'
import welfareCoinGoldImage from '@/assets/images/welfare/welfare-coin-gold.png'
import welfareCoinGoldSmallImage from '@/assets/images/welfare/welfare-coin-gold-s.png'
import welfareStarImage from '@/assets/images/welfare/welfare-star.png'
import welfareSparkleImage from '@/assets/images/welfare/welfare-sparkle.png'
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
import {
  isMiniAppRuntime,
  tmaHapticSelection,
  tmaHapticImpact,
  tmaHapticNotification,
} from '@/utils/telegram'
import { SHOW_WELFARE } from '@/constants/features'

const { t } = useI18n()
const showWelfare = SHOW_WELFARE
const hasAd = ref<boolean | null>(null)
const isMiniApp = ref(isMiniAppRuntime())
const router = useRouter()
const langStore = useLangStore()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const siteStore = useSiteStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { priceData } = storeToRefs(priceStore)
const { userInfo } = storeToRefs(userStore)
const welfarePrice = computed(() => formatCryptoAmount(siteStore.wealPrice))
const { loading: orderLoading, createOrder } = useOrderCreation()

// 蓝湖移动端原型以“转账租赁”为首屏入口，桌面 Web 保持原有“余额支付”默认态。
const activeTab = ref<'transfer' | 'balance'>(isMobile.value ? 'transfer' : 'balance')
const formRef = ref<FormInstance>()

// 使用统一的地址管理 hook
const { address: paymentAddress, fetchAddress: fetchPaymentAddress } = usePaymentAddress(AddressKind.FLASH_ENERGY_TRANSFER)

const createEnergyOptions = () => [
  { label: `${(65000).toLocaleString()} ${t('lease.energy')}`, value: 65000 },
  { label: `${(131000).toLocaleString()} ${t('lease.energy')}`, value: 131000 },
]

const energyOptions = ref(createEnergyOptions())

// 监听标签页切换，当切换到转账租赁时获取付款地址
watch(activeTab, async (newTab, oldTab) => {
  if (oldTab !== undefined) {
    tmaHapticSelection()
  }
  if (newTab === 'transfer' && !paymentAddress.value) {
    await fetchPaymentAddress()
  }
}, { immediate: true }) // 添加 immediate: true，组件挂载时立即执行

// 处理重试
const handleRetryFetchAddress = () => {
  tmaHapticImpact('light')
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

watch([() => formData.energy, () => langStore.currentLocale], ([newEnergy], [oldEnergy]) => {
  if (oldEnergy !== undefined && newEnergy !== oldEnergy) {
    tmaHapticSelection()
  }
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
  tmaHapticImpact('light')
  if (!formRef.value) return

  try {
    await formRef.value.validateField('address')

    if (!formData.address) {
      ElMessage.warning(t('formValidation.enterAddressFirst'))
      return
    }

    // 检查地址格式
    if (formData.address.length < 10) {
      ElMessage.warning(t('formValidation.addressTooShort'))
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
      tmaHapticNotification('success')
      // 重新获取用户信息（强制刷新 bind_address）
      await userStore.fetchUserInfo({ force: true })
    }
  } catch (error) {
    tmaHapticNotification('error')
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
      tmaHapticNotification('success')
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
    tmaHapticNotification('error')
    console.error('【ERROR INFO】:', error)
  }
}

const handleRentNow = async () => {
  tmaHapticImpact('light')
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
      tmaHapticNotification('success')
    }
  } catch (error) {
    tmaHapticNotification('error')
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
    border-radius: var(--theme-radius-lg, 8px);
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    box-shadow: var(--theme-shadow-lg, 0 10px 25px -4px rgba(15, 23, 42, 0.07));
    background: #ffffff;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .rental-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 22px;
      overflow: visible;
    }

    :deep(.el-tabs__content) {
      overflow: initial;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__nav-wrap),
    :deep(.el-tabs__nav-scroll) {
      overflow: visible;
    }

    :deep(.el-tabs__nav) {
      width: 100%;
      display: flex;
      align-items: stretch;
      gap: 6px;
      box-sizing: border-box;
      padding: 4px;
      border-radius: var(--theme-radius-md, 6px);
      background: rgba(15, 23, 42, 0.04);
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    :deep(.el-tabs__item) {
      flex: 1;
      min-width: 0;
      height: 40px;
      line-height: 38px;
      padding: 0 12px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      color: #64748b;
      border: 1px solid transparent;
      border-radius: var(--theme-radius-sm, 4px);
      background: transparent;
      box-shadow: none;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

      .el-radio-group {
        width: 100%;
        display: flex;
        gap: 12px;
      }

      .energy-radio-button {
        flex: 1;
        min-width: 0;

        :deep(.el-radio-button__inner) {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border: 1.5px solid var(--theme-card-border, rgba(226, 232, 240, 0.9)) !important;
          border-radius: var(--theme-radius-md, 6px) !important;
          background: var(--theme-card-bg-gradient, linear-gradient(180deg, #ffffff 0%, #f8fafc 100%));
          font-weight: 700;
          font-size: 14px;
          font-variant-numeric: tabular-nums;
          color: #334155;
          box-shadow: var(--theme-shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.04)) !important;
          outline: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

          &:hover {
            border-color: var(--theme-primary-blue, #165dff) !important;
            background: #ffffff;
            transform: translateY(-1px);
          }

          &:active {
            transform: scale(0.98);
          }
        }

        &:first-child :deep(.el-radio-button__inner),
        &:last-child :deep(.el-radio-button__inner) {
          border-radius: var(--theme-radius-md, 6px) !important;
        }

        :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner),
        :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover),
        &.is-active :deep(.el-radio-button__inner),
        &.is-active:first-child :deep(.el-radio-button__inner),
        &.is-active:last-child :deep(.el-radio-button__inner) {
          color: var(--theme-primary-blue, #165dff) !important;
          background: rgba(22, 93, 255, 0.04) !important;
          border-color: var(--theme-primary-blue, #165dff) !important;
          box-shadow: 0 0 0 1px #165dff, var(--theme-shadow-glow-blue) !important;
        }
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

    .energy-row {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-bottom: 6px;
    }

    :deep(.el-input__wrapper) {
      background: #ffffff;
      border-radius: var(--theme-radius-sm, 4px);
      border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
      box-shadow: var(--theme-shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.04));
      padding: 0 14px;
      min-height: 46px;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(22, 93, 255, 0.4);
      }

      &.is-focus {
        border-color: var(--theme-primary-blue, #165dff);
        box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.12);
      }

      &.is-disabled,
      &.is-readonly {
        background: #f8fafc;
        border-color: rgba(226, 232, 240, 0.8);
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
      align-items: stretch;
      gap: 12px;
      width: 100%;
      max-width: 630px;
      margin: 20px auto 0;
      box-sizing: border-box;
      padding: 0;
      background: transparent;
      box-shadow: none;

      .el-button {
        flex: 1;
        min-width: 0;
        height: 48px;
        margin: 0;
        border-radius: var(--theme-radius-md, 6px);
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.02em;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover {
          transform: translateY(-1px);
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    :deep(.btn-save) {
      color: #fff;
      background: var(--theme-bg-blue);
      border: 1px solid var(--theme-bg-blue);
      box-shadow: 0 4px 14px -2px rgba(22, 93, 255, 0.35);

      &:hover {
        box-shadow: 0 6px 20px -2px rgba(22, 93, 255, 0.45);
      }
    }

    :deep(.btn-rent) {
      color: #fff;
      background: var(--theme-bg-orange);
      border: 1px solid var(--theme-bg-orange);
      box-shadow: 0 4px 14px -2px rgba(255, 104, 22, 0.35);

      &:hover {
        box-shadow: 0 6px 20px -2px rgba(255, 104, 22, 0.45);
      }
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

@media (max-width: 890px) {
  .energy-rental {
    padding: 0 0 24px;

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
        height: 40px;
        font-size: 13px;
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
        padding: 6px;
        padding-bottom: 30px;
        overflow: hidden;
      }
    }
  }
}

/* 新版首页首屏布局 */
.energy-rental {
  padding: 0 0 32px;
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
    overflow-x: hidden;
  }

  :deep(.ad-banner) {
    position: relative;
    z-index: 1;
    width: min(100%, 920px);
    height: 100%;
    margin: 0 auto;
  }

  :deep(.ad-banner.is-coverflow) {
    width: min(100%, 1120px);
  }

  :deep(.ad-carousel),
  :deep(.ad-skeleton) {
    width: 100%;
    height: auto;
    aspect-ratio: var(--ad-image-ratio, 16 / 7);
    border-radius: 8px;
  }

  :deep(.ad-banner.is-coverflow .ad-carousel),
  :deep(.ad-banner.is-coverflow .ad-skeleton) {
    aspect-ratio: auto;
    background: transparent;
    overflow: visible;
    border-radius: 0;
  }

  :deep(.ad-banner.is-solo .ad-carousel),
  :deep(.ad-banner.is-solo .ad-skeleton),
  :deep(.ad-banner.is-miniapp .ad-carousel),
  :deep(.ad-banner.is-miniapp .ad-skeleton) {
    aspect-ratio: auto;
    height: auto;
    overflow: hidden;
    background: transparent;
  }

  :deep(.ad-banner.is-miniapp .ad-carousel),
  :deep(.ad-banner.is-miniapp .ad-skeleton) {
    border-radius: 0;
  }

  :deep(.ad-image) {
    object-fit: cover;
    object-position: center;
  }

  :deep(.ad-banner.is-solo .ad-image) {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  &.has-ad.is-miniapp:not(:has(.ad-banner.is-coverflow)) {
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
      height: auto;
      aspect-ratio: auto;
      border-radius: 0;
    }

    :deep(.ad-image) {
      width: 100%;
      height: auto;
      object-fit: contain;
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
  overflow: visible;
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

.rental-board {
  position: relative;
  width: min(100%, 896px);
  margin: 0 auto;
  overflow: visible;
}

.rental-card {
  position: relative;
  z-index: 3;
  width: min(100%, 896px);
  margin: 0 auto;
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 13px 22px rgba(0, 0, 0, 0.07);
}

.welfare-rail {
  display: none;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

@media (min-width: 1360px) {
  .welfare-rail {
    display: flex;
    position: absolute;
    top: 50%;
    z-index: 2;
    width: min(240px, calc((100vw - 896px) / 2 - 56px));
    transform: translateY(-50%);
  }

  .welfare-rail.is-copy {
    right: calc(100% + 48px);
    flex-direction: column;
    align-items: stretch;
  }

  .welfare-rail.is-art {
    left: calc(100% + 28px);
    height: 400px;
    align-items: center;
    justify-content: center;
  }

  .welfare-copy-panel {
    position: relative;
    overflow: visible;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 18px 16px 16px;
    border: 1px solid rgba(255, 173, 73, 0.38);
    border-radius: 20px;
    background:
      radial-gradient(120px 80px at 100% 0%, rgba(255, 173, 73, 0.18), transparent 70%),
      linear-gradient(180deg, #fff8ee 0%, #ffffff 48%, #f7f9ff 100%);
    box-shadow:
      0 14px 28px rgba(22, 93, 255, 0.06),
      0 8px 16px rgba(255, 173, 73, 0.12);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 18px;
      left: 18px;
      height: 3px;
      border-radius: 0 0 3px 3px;
      background: linear-gradient(90deg, #ffad49 0%, #ff5a1f 100%);
    }
  }

  .welfare-rail.is-copy:hover .welfare-copy-panel {
    border-color: rgba(255, 90, 31, 0.5);
    box-shadow:
      0 16px 32px rgba(22, 93, 255, 0.08),
      0 10px 20px rgba(255, 90, 31, 0.16);
  }

  .welfare-copy-deco {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    user-select: none;

    &.is-gold {
      top: -16px;
      right: -18px;
      width: 48px;
      filter: drop-shadow(0 6px 8px rgba(245, 158, 11, 0.28));
      animation: welfare-bob 4s ease-in-out infinite;
    }

    &.is-star {
      top: 42px;
      left: -14px;
      width: 24px;
      animation: welfare-spin-float 6.4s ease-in-out infinite;
    }

    &.is-sparkle {
      top: -10px;
      left: 16px;
      width: 24px;
      animation: welfare-twinkle 1.8s ease-in-out infinite;
    }
  }

  .welfare-kicker,
  .welfare-rail-title,
  .welfare-deal,
  .welfare-tagline,
  .welfare-cta {
    position: relative;
    z-index: 1;
  }

  .welfare-kicker {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 11px;
    background: rgba(255, 173, 73, 0.16);
    color: #d97706;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .welfare-rail-title {
    padding-right: 8px;
    color: #182230;
    font-size: 26px;
    font-weight: 800;
    line-height: 1.15;
  }

  .welfare-deal {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 8px 10px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(255, 173, 73, 0.1) 100%);
  }

  .welfare-deal-coins {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  .welfare-deal-coin {
    width: 32px;
    height: 32px;
    flex-shrink: 0;

    &.is-usdt {
      z-index: 1;
      filter: drop-shadow(0 3px 4px rgba(16, 185, 129, 0.22));
    }

    &.is-trx {
      margin-left: -10px;
      filter: drop-shadow(0 3px 4px rgba(239, 68, 68, 0.2));
    }
  }

  .welfare-deal-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .welfare-deal-price {
    color: #165dff;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.15;
  }

  .welfare-deal-energy {
    color: #475467;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
  }

  .welfare-tagline {
    color: #667085;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  .welfare-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 38px;
    margin-top: 2px;
    border-radius: 19px;
    background: linear-gradient(180deg, #ff8d42 0%, #ff5a1f 100%);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 8px 16px rgba(255, 90, 31, 0.28);
    transition:
      filter 0.2s ease,
      box-shadow 0.2s ease;
  }

  .welfare-rail.is-copy:hover .welfare-cta {
    filter: brightness(1.05);
    box-shadow: 0 10px 18px rgba(255, 90, 31, 0.36);
  }

  .welfare-stage {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .welfare-glow {
    position: absolute;
    top: 18%;
    left: 8%;
    width: 84%;
    height: 70%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 173, 73, 0.38) 0%, rgba(22, 93, 255, 0.14) 46%, transparent 74%);
    filter: blur(10px);
    animation: welfare-pulse 3.6s ease-in-out infinite;
  }

  .welfare-piece {
    position: absolute;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;

    &.is-gift {
      right: 22%;
      bottom: 16%;
      z-index: 4;
      width: 64%;
      filter: drop-shadow(0 16px 18px rgba(22, 93, 255, 0.2));
      animation: welfare-float 3.8s ease-in-out infinite;
    }

    &.is-usdt {
      top: 16%;
      left: 0;
      z-index: 3;
      width: 34%;
      filter: drop-shadow(0 8px 10px rgba(16, 185, 129, 0.22));
      animation: welfare-bob 3.3s ease-in-out infinite;
    }

    &.is-trx {
      top: 24%;
      right: 0;
      left: auto;
      z-index: 5;
      width: 34%;
      filter: drop-shadow(0 8px 10px rgba(239, 68, 68, 0.22));
      animation: welfare-bob 3.7s ease-in-out infinite 0.28s;
    }

    &.is-gold {
      bottom: 22%;
      left: 0;
      z-index: 2;
      width: 22%;
      animation: welfare-bob 4.1s ease-in-out infinite 0.5s;
    }

    &.is-gold-s {
      right: 2%;
      bottom: 18%;
      z-index: 3;
      width: 16%;
      animation: welfare-bob 3.5s ease-in-out infinite 0.18s;
    }

    &.is-star {
      top: 8%;
      right: 6%;
      z-index: 2;
      width: 16%;
      animation: welfare-spin-float 6.2s ease-in-out infinite;
    }

    &.is-star-s {
      top: 12%;
      left: 8%;
      z-index: 2;
      width: 10%;
      animation: welfare-spin-float 7s ease-in-out infinite 0.7s;
    }

    &.is-sparkle {
      top: 2%;
      right: 22%;
      z-index: 6;
      width: 20%;
      animation: welfare-twinkle 1.8s ease-in-out infinite;
    }

    &.is-sparkle-2 {
      left: 30%;
      bottom: 18%;
      z-index: 6;
      width: 13%;
      animation: welfare-twinkle 2.2s ease-in-out infinite 0.55s;
    }
  }

  .welfare-gift-hint {
    position: absolute;
    right: 4%;
    bottom: 4px;
    left: 4%;
    z-index: 7;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #165dff;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.9);
    animation: welfare-float 3.8s ease-in-out infinite;

    &::after {
      content: '';
      width: 7px;
      height: 7px;
      margin-top: 1px;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(-45deg);
      animation: welfare-hint-nudge 1.15s ease-in-out infinite;
    }
  }

  .welfare-rail.is-art:hover .welfare-glow {
    opacity: 1;
  }

  .welfare-rail.is-art:hover .welfare-gift-hint {
    color: #ff5a1f;
  }
}

@keyframes welfare-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes welfare-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-7deg);
  }
  50% {
    transform: translateY(-11px) rotate(8deg);
  }
}

@keyframes welfare-spin-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(16deg);
  }
}

@keyframes welfare-twinkle {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.82);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes welfare-pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes welfare-hint-nudge {
  0%,
  100% {
    transform: rotate(-45deg) translate(0, 0);
  }
  50% {
    transform: rotate(-45deg) translate(3px, 3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .welfare-copy-deco,
  .welfare-kicker-spark,
  .welfare-piece,
  .welfare-glow,
  .welfare-gift-hint,
  .welfare-gift-hint::after {
    animation: none;
  }
}

.mode-label-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
  width: calc(100% - 32px);
  max-width: none;
  margin: 32px 16px 0;
}

.mode-label-wrap .mode-label {
  width: auto;
  min-width: 0;
  flex: 1;
  margin: 0;
}

.welfare-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px 0 8px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, #ff8d42 0%, #ff5a1f 100%);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(255, 90, 31, 0.32);
  animation: welfare-entry-pulse 2.4s ease-in-out infinite;
  transition:
    filter 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    filter: brightness(1.06);
    box-shadow: 0 10px 18px rgba(255, 90, 31, 0.4);
  }
}

.welfare-entry-gift {
  width: 28px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}

@media (min-width: 1360px) {
  .welfare-entry {
    display: none;
  }
}

@keyframes welfare-entry-pulse {
  0%,
  100% {
    box-shadow: 0 8px 16px rgba(255, 90, 31, 0.32);
  }
  50% {
    box-shadow: 0 8px 22px rgba(255, 90, 31, 0.55);
  }
}

@media (prefers-reduced-motion: reduce) {
  .welfare-entry {
    animation: none;
  }
}

.rental-board .rental-card {
  width: 100%;
  margin: 0;
}

.rental-card.is-balance {
  width: 100%;
  min-height: 670px;
  max-width: none;
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

.rental-tabs :deep(.el-tabs__nav-wrap),
.rental-tabs :deep(.el-tabs__nav-scroll) {
  overflow: visible;
}

.rental-tabs :deep(.el-tabs__nav-wrap::after),
.rental-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.rental-tabs :deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  box-sizing: border-box;
  gap: 8px;
  padding: 4px;
  border-radius: 8px;
  background: #e8ecf2;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
}

.rental-tabs :deep(.el-tabs__item) {
  flex: 1;
  min-width: 0;
  height: 40px;
  box-sizing: border-box;
  padding: 0 8px;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 6px;
  color: #334155;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 38px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 3px 6px rgba(15, 23, 42, 0.1);
}

.rental-tabs :deep(.el-tabs__item:hover:not(.is-active)) {
  color: #334155;
  background: #f8fafc;
}

.rental-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
  border-color: #165dff;
  background: #165dff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 2px 4px rgba(22, 93, 255, 0.28),
    0 4px 10px rgba(22, 93, 255, 0.32);
}

.energy-rental .rental-tabs :deep(.el-tabs__nav) {
  gap: 8px;
  padding: 4px;
  border-radius: 8px;
  background: #e8ecf2;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
}

.balance-mode-label {
  margin-top: 0;
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
  padding-left: 10px;
  color: var(--theme-text-black, #182230);
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  white-space: nowrap;
}

.field-label::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  width: 3px;
  height: 14px;
  border-radius: 1.5px;
  background: var(--theme-primary-blue, #165dff);
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
  align-items: stretch;
  box-sizing: border-box;
  justify-content: stretch;
  gap: 8px;
  padding: 4px;
  border-radius: 8px;
  background: #e8ecf2;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
}

.energy-radio-group .energy-radio-button {
  flex: 1;
  min-width: 0;
}

.energy-radio-group .energy-radio-button :deep(.el-radio-button__inner) {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 8px;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 6px !important;
  background: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 3px 6px rgba(15, 23, 42, 0.1) !important;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  line-height: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.energy-radio-group .energy-radio-button:first-child :deep(.el-radio-button__inner),
.energy-radio-group .energy-radio-button:last-child :deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 3px 6px rgba(15, 23, 42, 0.1) !important;
}

.energy-radio-group .energy-radio-button :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner),
.energy-radio-group .energy-radio-button.is-active :deep(.el-radio-button__inner) {
  color: #fff;
  border-color: #165dff;
  background: #165dff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 2px 4px rgba(22, 93, 255, 0.28),
    0 4px 10px rgba(22, 93, 255, 0.32) !important;
}

.energy-rental .rental-form .energy-radio-group {
  width: 100%;
  padding: 4px;
  gap: 8px;
  border-radius: 8px;
  background: #e8ecf2;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
}

.energy-rental .rental-form .energy-radio-group .energy-radio-button :deep(.el-radio-button__inner),
.energy-rental .rental-form .energy-radio-group .energy-radio-button:first-child :deep(.el-radio-button__inner),
.energy-rental .rental-form .energy-radio-group .energy-radio-button:last-child :deep(.el-radio-button__inner) {
  height: 40px;
  line-height: 38px;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 6px !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 3px 6px rgba(15, 23, 42, 0.1) !important;
  background: #fff;
}

.energy-rental .rental-form .energy-radio-group .energy-radio-button :deep(.el-radio-button__inner:hover) {
  color: #334155;
  background: #f8fafc;
}

.energy-rental .rental-form .energy-radio-group .energy-radio-button :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner),
.energy-rental .rental-form .energy-radio-group .energy-radio-button :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover),
.energy-rental .rental-form .energy-radio-group .energy-radio-button.is-active :deep(.el-radio-button__inner),
.energy-rental .rental-form .energy-radio-group .energy-radio-button.is-active :deep(.el-radio-button__inner:hover),
.energy-rental .rental-form .energy-radio-group .energy-radio-button.is-active:first-child :deep(.el-radio-button__inner),
.energy-rental .rental-form .energy-radio-group .energy-radio-button.is-active:last-child :deep(.el-radio-button__inner) {
  color: #fff;
  border-color: #165dff;
  background: #165dff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 2px 4px rgba(22, 93, 255, 0.28),
    0 4px 10px rgba(22, 93, 255, 0.32) !important;
}

.rental-form :deep(.el-input__wrapper),
.rental-form :deep(.el-select__wrapper) {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid #b8bfc9;
  border-radius: 4px;
  background: #fff;
  box-shadow: none;
}

.rental-form :deep(.el-input__wrapper:hover),
.rental-form :deep(.el-select__wrapper:hover) {
  border-color: #9aa3af;
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
  align-items: stretch;
  gap: 8px;
  box-sizing: border-box;
  padding: 4px;
  border-radius: 8px;
  background: #e8ecf2;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
}

.energy-rental .rental-form .action-buttons {
  width: 100%;
  gap: 8px;
  padding: 4px;
  border-radius: 8px;
  background: #e8ecf2;
  box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
}

.rental-form .action-buttons .el-button {
  flex: 1;
  min-width: 0;
  height: 44px;
  margin: 0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
}

.energy-rental .rental-form .action-buttons .el-button {
  height: 44px;
}

.rental-form :deep(.btn-save) {
  color: #fff;
  background: #165dff;
  border: 1px solid #165dff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 2px 4px rgba(22, 93, 255, 0.28),
    0 4px 10px rgba(22, 93, 255, 0.32);
}

.rental-form :deep(.btn-save:hover),
.rental-form :deep(.btn-save:focus) {
  color: #fff;
  background: #3d75ff;
  border-color: #3d75ff;
}

.rental-form :deep(.btn-rent) {
  color: #fff;
  background: #ff6816;
  border: 1px solid #ff6816;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 2px 4px rgba(255, 104, 22, 0.28),
    0 4px 10px rgba(255, 104, 22, 0.32);
}

.rental-form :deep(.btn-rent:hover),
.rental-form :deep(.btn-rent:focus) {
  color: #fff;
  background: #ff812e;
  border-color: #ff812e;
}

.rental-form .custom-empty {
  padding: 10px 0;
  text-align: center;
  color: rgba(30, 41, 59, 0.4);
  font-size: 14px;
}

/* Keep the transfer tab's layout independent from the balance layout. */
.rental-card.is-transfer {
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

.rental-card.is-transfer .mode-label {
  width: auto;
  max-width: none;
  margin: 0;
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

@media (min-width: 891px) {
  /* Keep the balance form aligned to the card's content box. */
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

@media (max-width: 890px) {
  .energy-rental {
    padding-bottom: 28px;
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

    &.has-ad.is-miniapp:not(:has(.ad-banner.is-coverflow)) {
      padding: 0;

      :deep(.ad-carousel),
      :deep(.ad-skeleton) {
        aspect-ratio: auto;
        height: auto;
      }

      :deep(.ad-image) {
        height: auto;
        object-fit: contain;
      }
    }

    &.has-ad:has(.ad-banner.is-solo) {
      :deep(.ad-carousel),
      :deep(.ad-skeleton) {
        aspect-ratio: auto;
        height: auto;
      }

      :deep(.ad-image) {
        height: auto;
        object-fit: contain;
      }
    }

    :deep(.ad-banner:not(.is-coverflow):not(.is-solo):not(.is-miniapp) .ad-carousel),
    :deep(.ad-banner:not(.is-coverflow):not(.is-solo):not(.is-miniapp) .ad-skeleton) {
      aspect-ratio: var(--ad-image-ratio, 16 / 7);
    }
  }

  @media (max-width: 400px) {
    .ecosystem-hero.has-ad:not(.is-miniapp) {
      padding-right: 0;
      padding-left: 0;

      :deep(.ad-banner) {
        width: 100%;
        max-width: none;
        margin: 0;
      }

      :deep(.ad-carousel),
      :deep(.ad-skeleton) {
        border-radius: 0;
      }
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
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 12px 0 0;
  }

  .rental-title {
    font-size: 28px;
  }

  .rental-subtitle {
    margin-top: 8px;
    font-size: 12px;
  }

  .checkout-steps {
    box-sizing: border-box;
    width: 100%;
    margin: 22px 0 18px;
    padding: 0 12px;
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
    padding: 0 6px 20px;
  }

  .mode-section.is-balance {
    min-height: 0;
  }

  .rental-card.is-balance .rental-tabs,
  .rental-card.is-balance .rental-form .field-label,
  .rental-card.is-balance .rental-form,
  .rental-card.is-balance .rental-form .info-text,
  .rental-card.is-balance .rental-form :deep(.el-form-item),
  .rental-card.is-balance .rental-form :deep(.balance-form-item),
  .rental-card.is-balance .rental-form .action-form-item {
    width: 100%;
    max-width: none;
    margin-right: 0;
    margin-left: 0;
  }

  .rental-card.is-balance .rental-tabs,
  .rental-card.is-transfer .rental-tabs {
    width: 100%;
    margin: 16px 0 0;
  }

  .mode-label-wrap {
    width: 100%;
    margin: 20px 0 0;
    padding: 0 12px;
  }

  .rental-card.is-transfer .mode-label {
    width: auto;
    margin: 0;
  }

  .balance-mode-label {
    margin-top: 0;
  }

  .field-label,
  .rental-card.is-balance .field-label {
    font-size: 13px;
  }

  .rental-card.is-balance .rental-form .info-text {
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
    margin-top: 16px;
  }

  .rental-card.is-balance .rental-form .action-buttons {
    gap: 8px;
    padding: 4px;
  }

  .rental-card.is-balance .rental-form .action-buttons .el-button {
    height: 40px;
    font-size: 13px;
    border-radius: 6px;
  }

  .rental-tabs :deep(.el-tabs__item) {
    height: 38px;
    flex: 1;
    font-size: 12px;
    line-height: 36px;
    border-radius: 6px;
  }

  .rental-tabs :deep(.el-tabs__content) {
    box-sizing: border-box;
    padding: 0 12px;
  }

  /* 蓝湖移动稿为“余额支付 / 转账租赁”，仅调整移动端视觉顺序。 */
  .rental-tabs :deep(.el-tabs__header) {
    box-sizing: border-box;
    padding: 0 12px;
  }

  .rental-tabs :deep(.el-tabs__nav) {
    display: flex;
    width: 100%;
    gap: 8px;
    padding: 4px;
    border-radius: 8px;
    background: #e8ecf2;
    box-shadow: inset 0 1px 4px rgba(15, 23, 42, 0.14);
  }

  .rental-tabs :deep(.el-tabs__item:nth-child(2)) {
    order: 2;
  }

  .rental-tabs :deep(.el-tabs__item:nth-child(3)) {
    order: 1;
  }

  .rental-card.is-transfer .rental-tabs :deep(.el-tabs__active-bar) {
    width: 50% !important;
    transform: translateX(100%) !important;
  }

  .rental-card.is-balance .rental-tabs :deep(.el-tabs__active-bar) {
    width: 50% !important;
    transform: translateX(0) !important;
  }

  .welfare-rail {
    display: none;
  }

  .welfare-entry {
    display: none;
  }

  .mobile-welfare-link {
    box-sizing: border-box;
    width: 100%;
    padding: 16px 12px 0;
    overflow: visible;
  }

  .mobile-welfare-btn {
    position: relative;
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: 44px;
    padding: 0 84px 0 16px;
    align-items: center;
    justify-content: center;
    overflow: visible;
    border: 1px solid #ffad49;
    border-radius: 8px;
    background: #fffaf2;
    color: #f39b25;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;

    &:hover,
    &:focus,
    &:focus-visible,
    &:active {
      color: #f39b25;
      background: #fffaf2;
      border-color: #ffad49;
    }
  }

  .mobile-welfare-copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .mobile-welfare-arrow {
    position: relative;
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    border: 1.5px solid currentColor;
    border-radius: 50%;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 46%;
      width: 5px;
      height: 5px;
      border-top: 1.5px solid currentColor;
      border-right: 1.5px solid currentColor;
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }

  .mobile-welfare-gift {
    position: absolute;
    right: 6px;
    top: 50%;
    width: 82px;
    height: 41px;
    object-fit: contain;
    pointer-events: none;
    transform: translateY(-50%);
  }
}
</style>
