/**
 * 按笔数租用业务逻辑
 */
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from '@/utils/element'
import type { FormInstance, FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { authApi } from '@/api'
import type { BindAddressMap } from '@/api/modules/auth/types'
import { useAddress } from '@/hooks/useAddress'
import { useOrderCreation } from '@/hooks/useOrderCreation'
import { AddressKind } from '@/api/modules/address/types'
import { OrderKind } from '@/api/modules/order/types'
import { formatCryptoAmount } from '@/utils/number'
import { handleResponse } from '@/utils/response'

interface RentalForm {
  unitPrice: number
  count: number
  total: number
  energy: number
  validity: number
  wallet: string
  selectedAddress: string
}

export function useCountRental() {
  const { t } = useI18n()
  const commonStore = useCommonStore()
  const priceStore = usePriceStore()
  const userStore = useUserStore()
  const { isMobile } = storeToRefs(commonStore)
  const { userInfo } = storeToRefs(userStore)
  const { fetchAddress, addressData } = useAddress()
  const { loading: orderLoading, createOrder } = useOrderCreation()

  const showPaymentDialog = ref(false)

  const paymentAddress = computed(() => {
    if (typeof addressData.value === 'string') {
      return addressData.value
    }
    return (addressData.value as { address?: string } | null)?.address || ''
  })

  const usdtUnitPrice = computed(() => {
    const price = priceStore.priceData?.stroke_usdt || '11'
    return parseFloat(price)
  })

  const strokePrice = computed(() => {
    const price = priceStore.priceData?.stroke || '3.5'
    return parseFloat(price)
  })

  const maxCount = computed(() => {
    const balance = parseFloat(userInfo.value?.trx_balance || '0')
    const price = strokePrice.value
    if (price <= 0) return 1000
    const max = Math.floor(balance / price)
    return Math.max(1, Math.min(max, 1000))
  })

  const rows = computed(() => {
    const counts = [1, 2, 4, 20]
    return [
      {
        options: counts.map((count) => {
          const total = formatCryptoAmount(count * strokePrice.value)
          return `${count}${t('common.purchase')}(${total}${t('common.trx')})`
        }),
        counts,
        prices: counts.map((count) => formatCryptoAmount(count * strokePrice.value)),
      },
    ]
  })

  const tips = computed(() => [
    t('countRental.tips1'),
    t('countRental.tips2'),
    t('countRental.tips4'),
    t('countRental.tips3'),
  ])

  const paymentTips = computed(() => [
    t('countRental.usdtTip1', { amount: formatCryptoAmount(usdtUnitPrice.value) }),
    t('countRental.usdtTip2'),
    t('countRental.usdtTip3'),
  ])

  const selecteIndex = ref<[number, number]>([0, 0])
  const isCustom = ref(false)
  const customCount = ref<number>(1)
  const selectedAddress = ref('')
  const walletShowError = ref(false)
  const bindAddressKind = AddressKind.COUNT_RENTAL

  const getBindAddressMap = (): BindAddressMap => {
    return { ...userInfo.value?.bind_address }
  }

  const getSavedAddressesByKind = (kind: number): string[] => {
    return getBindAddressMap()[kind] || []
  }

  const unitPrice = computed(() => strokePrice.value)

  const count = computed(() => {
    if (isCustom.value) {
      return customCount.value
    }
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
  const totalDisplay = computed(() => formatCryptoAmount(total.value))

  const walletPlaceholder = computed(() => {
    if (walletShowError.value && !wallet.value) {
      return isMobile.value ? '' : t('formValidation.walletRequired')
    }
    return isMobile.value ? t('countRental.enterAddress') : t('lease.enterAddress')
  })

  const applyEmptyWalletFeedback = () => {
    if (wallet.value || selectedAddress.value) return
    walletShowError.value = true
  }

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

  watch(
    [total, unitPrice, count],
    () => {
      form.total = total.value
      form.unitPrice = unitPrice.value
      form.count = count.value
      formRef.value?.clearValidate('total')
    },
    { immediate: true },
  )

  watch(wallet, (v) => {
    form.wallet = v
    if (v) {
      walletShowError.value = false
      formRef.value?.clearValidate(['wallet', 'selectedAddress'])
    }
  })
  watch(selectedAddress, (v) => {
    form.selectedAddress = v
    if (v) {
      walletShowError.value = false
      formRef.value?.clearValidate(['wallet', 'selectedAddress'])
    }
  })

  const handleSaveAddress = async () => {
    if (!formRef.value) return

    if (!wallet.value) {
      applyEmptyWalletFeedback()
    }

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
        await userStore.fetchUserInfo({ force: true })
      }
    } catch (error) {
      if (!wallet.value) {
        applyEmptyWalletFeedback()
        return
      }
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
        },
      )

      const bindAddress = getBindAddressMap()
      const existingAddresses = getSavedAddressesByKind(bindAddressKind)
      bindAddress[bindAddressKind] = existingAddresses.filter((addr) => addr !== address)

      const response = await authApi.updateUserInfo({ bind_address: bindAddress })
      const success = handleResponse(response, {
        context: 'address_delete',
      })

      if (success) {
        if (selectedAddress.value === address) {
          selectedAddress.value = ''
        }
        await userStore.fetchUserInfo({ force: true })
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

    if (!wallet.value && !selectedAddress.value) {
      applyEmptyWalletFeedback()
    }

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
      applyEmptyWalletFeedback()
      if (wallet.value || selectedAddress.value) {
        console.error('【ERROR INFO】:', error)
      }
    }
  }

  const handleBuy = async () => {
    try {
      const address = await fetchAddress(AddressKind.COUNT_RENTAL)

      if (address) {
        showPaymentDialog.value = true
      } else {
        ElMessage.error(t('common.getAddressFailed'))
      }
    } catch (error) {
      console.error('【USDT购买错误】:', error)
    }
  }

  onMounted(() => {
    void priceStore.fetchPrice()
  })

  return {
    t,
    isMobile,
    showPaymentDialog,
    paymentAddress,
    rows,
    tips,
    paymentTips,
    selecteIndex,
    isCustom,
    customCount,
    selectedAddress,
    wallet,
    walletPlaceholder,
    walletShowError,
    addressOptions,
    totalDisplay,
    formRef,
    form,
    rules,
    maxCount,
    orderLoading,
    handleSaveAddress,
    handleDeleteAddress,
    onSelect,
    onCustomClick,
    handleCustomInput,
    handleRent,
    handleBuy,
  }
}
