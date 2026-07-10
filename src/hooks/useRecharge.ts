/**
 * 充值弹窗业务逻辑 Hook
 */

import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/useUserStore'
import { authApi, binanceApi, orderApi } from '@/api'
import type { RechargeCoin } from '@/api/modules/order/types'
import { usePriceStore } from '@/stores/usePriceStore'
import { useCopyToClipboard } from './useCopyToClipboard'
import { useI18n } from 'vue-i18n'
import { formatCryptoAmount } from '@/utils/number'
import { formatDeadline } from '@/utils/time'

export function useRecharge() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const priceStore = usePriceStore()
  const { isCopying, copyText } = useCopyToClipboard()

  // 弹窗状态
  const visible = ref(false)
  const isLoadingAddress = ref(false)
  const isLoadingExchangeRate = ref(false)
  
  // 充值流程状态
  const currentStep = ref(1) // 1: 选择金额, 2: 显示地址
  
  // 用户输入的金额
  const selectedCoin = ref<RechargeCoin>('TRX')
  const selectedAmount = ref<number>(0)
  const customAmountInput = ref<string>('')
  const isCustomAmount = ref(false)
  const presetAmounts = [10, 30, 50, 200, 500, 1000]
  const amountInputmode = computed(() => (selectedCoin.value === 'USDT' ? 'decimal' : 'numeric'))
  const amountPattern = computed(() =>
    selectedCoin.value === 'USDT' ? '[0-9]*[.]?[0-9]*' : '[0-9]*'
  )
  
  // 订单返回的实际数据
  const rechargeAddress = ref<string>('') // 充值地址
  const actualAmount = ref<string>('')    // 实际充值金额
  const actualCoin = ref<string>('TRX')   // 币种
  const deadline = ref<string>('')        // 转账截止时间
  const usdtToTrxMarketRate = ref(0)      // 1 USDT = X TRX
  let exchangeRateRequestId = 0

  const normalizeAmountInput = (value: string) => {
    const normalized = value.replace(/[。]/g, '.').replace(/[^\d.]/g, '')
    if (!normalized) return ''

    const [integerPart = '', decimalPart = ''] = normalized.split('.')
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '')

    if (selectedCoin.value === 'TRX') {
      return normalizedInteger
    }

    const decimal = normalized.includes('.') ? `.${decimalPart.slice(0, 2)}` : ''
    return `${normalizedInteger || '0'}${decimal}`
  }

  const getSelectedAmount = () => {
    if (!Number.isFinite(selectedAmount.value)) return 0

    if (selectedCoin.value === 'TRX') {
      return Math.trunc(selectedAmount.value)
    }

    return Number(selectedAmount.value.toFixed(2))
  }

  // /v3/price 的 usdt_2_trx 是 USDT→TRX 的手续费比例，例如 0.06 代表 6%。
  const usdtFeeRate = computed<number | null>(() => {
    const rawValue = priceStore.priceData?.usdt_2_trx
    if (rawValue === undefined || rawValue === null || rawValue === '') return null

    const value = Number(rawValue)
    return Number.isFinite(value) && value >= 0 && value < 1 ? value : null
  })

  const usdtExchangeRate = computed(() => {
    if (usdtToTrxMarketRate.value <= 0 || usdtFeeRate.value === null) return 0

    // 实时 1 USDT→TRX 汇率，扣减站点配置的手续费比例。
    return usdtToTrxMarketRate.value * (1 - usdtFeeRate.value)
  })

  const usdtExchangeRateText = computed(() =>
    usdtExchangeRate.value > 0 ? formatCryptoAmount(usdtExchangeRate.value) : ''
  )
  const estimatedTrxAmount = computed(() => {
    if (selectedCoin.value !== 'USDT' || selectedAmount.value <= 0 || usdtExchangeRate.value <= 0) {
      return ''
    }

    return formatCryptoAmount(selectedAmount.value * usdtExchangeRate.value)
  })
  const displayActualAmount = computed(() => {
    if (actualAmount.value) return actualAmount.value

    const amount = getSelectedAmount()
    return amount > 0 ? amount.toString() : ''
  })

  const fetchUsdtExchangeRate = async () => {
    const requestId = ++exchangeRateRequestId
    isLoadingExchangeRate.value = true
    usdtToTrxMarketRate.value = 0

    try {
      const [, response] = await Promise.all([
        priceStore.fetchPrice(),
        binanceApi.getTrxUsdtPrice(),
      ])
      // 行情返回 1 TRX = X USDT，USDT 充值展示需要反向换算为 1 USDT = X TRX。
      const trxUsdtPrice = Number(response.price)
      const marketRate = 1 / trxUsdtPrice

      if (
        requestId === exchangeRateRequestId &&
        Number.isFinite(marketRate) &&
        marketRate > 0
      ) {
        usdtToTrxMarketRate.value = marketRate
      }
    } catch (error) {
      if (requestId === exchangeRateRequestId) {
        console.error('[Recharge] 获取 USDT 兑换汇率失败:', error)
      }
    } finally {
      if (requestId === exchangeRateRequestId) {
        isLoadingExchangeRate.value = false
      }
    }
  }

  /**
   * 选择预设金额
   */
  const selectPresetAmount = (amount: number) => {
    selectedAmount.value = amount
    isCustomAmount.value = false
    customAmountInput.value = ''
  }

  const handleCoinChange = (coin: string | number | boolean | undefined) => {
    if (coin !== 'TRX' && coin !== 'USDT') return

    selectedCoin.value = coin
    selectedAmount.value = 0
    customAmountInput.value = ''
    isCustomAmount.value = false

    if (coin === 'USDT') {
      void fetchUsdtExchangeRate()
    } else {
      exchangeRateRequestId += 1
      isLoadingExchangeRate.value = false
      usdtToTrxMarketRate.value = 0
    }
  }

  /**
   * 自定义金额输入框获得焦点
   */
  const handleCustomAmountFocus = () => {
    isCustomAmount.value = true
    if (customAmountInput.value) {
      const normalizedAmount = normalizeAmountInput(customAmountInput.value)
      customAmountInput.value = normalizedAmount
      selectedAmount.value = Number(normalizedAmount) || 0
    }
  }

  /**
   * 自定义金额输入
   */
  const handleCustomAmountInput = (value: string) => {
    isCustomAmount.value = true
    const normalizedAmount = normalizeAmountInput(value)
    customAmountInput.value = normalizedAmount
    const amount = Number(normalizedAmount) || 0
    selectedAmount.value = amount
  }

  /**
   * 确认金额，创建充值订单并进入第二步
   */
  const confirmAmount = async () => {
    const depositAmount = getSelectedAmount()

    // 验证金额
    if (depositAmount <= 0 || (selectedCoin.value === 'TRX' && depositAmount < 1)) {
      ElMessage.warning(t('recharge.invalidAmount') || '请输入有效的充值金额')
      return
    }

    selectedAmount.value = depositAmount
    if (isCustomAmount.value) {
      customAmountInput.value = depositAmount.toString()
    }
    
    // 检查登录状态
    const userId = userStore.userInfo?.id || 0
    if (!userId || !userStore.isLogin) {
      ElMessage.warning(t('common.pleaseLogin') || '请先登录')
      close() // 关闭弹窗
      return
    }
    
    isLoadingAddress.value = true
    
    try {
      console.log('[Recharge] 创建充值订单:', {
        amount: depositAmount,
        coin: selectedCoin.value,
        userId
      })
      
      // 创建充值订单
      const response = await orderApi.createDepositOrder({
        amount: depositAmount,
        coin: selectedCoin.value,
        user_id: userId
      })
      
      console.log('[Recharge] 订单响应:', response)
      
      // 检查响应
      if (response.code !== '000000') {
        console.warn('[Recharge] 订单创建失败:', response.msg)
        ElMessage.error(response.msg || t('recharge.createOrderFailed') || '创建订单失败')
        resetOrderData()
        return
      }
      
      if (!response.data) {
        console.error('[Recharge] 响应数据为空')
        ElMessage.error(t('recharge.createOrderFailed') || '创建订单失败')
        resetOrderData()
        return
      }
      
      // 提取订单数据
      const { receive_address, amount, coin } = response.data
      
      if (!receive_address) {
        console.error('[Recharge] 响应中缺少充值地址')
        ElMessage.error(t('recharge.noAddressReturned') || '未获取到充值地址')
        resetOrderData()
        return
      }
      
      // 保存订单数据
      rechargeAddress.value = receive_address
      actualAmount.value = amount || selectedAmount.value.toString()
      actualCoin.value = (coin || selectedCoin.value).toUpperCase()
      
      // 计算截止时间（当前时间 + 5分钟）
      deadline.value = formatDeadline(5)
      
      console.log('[Recharge] 订单创建成功:', {
        address: receive_address,
        amount: actualAmount.value,
        coin: actualCoin.value,
        deadline: deadline.value
      })
      
      // 进入第二步
      currentStep.value = 2
      
      // 刷新用户信息
      await fetchUserInfo()
      
    } catch (error: unknown) {
      console.error('[Recharge] 创建订单异常:', error)
      
      // 如果是未登录错误，关闭弹窗
      if (error instanceof Error && error.message === 'NOT_LOGGED_IN') {
        ElMessage.warning(t('common.pleaseLogin') || '请先登录')
        close()
      } else {
        ElMessage.error(t('recharge.createOrderFailed') || '创建订单失败，请重试')
        resetOrderData()
      }
    } finally {
      isLoadingAddress.value = false
    }
  }

  /**
   * 重置订单数据
   */
  const resetOrderData = () => {
    rechargeAddress.value = ''
    actualAmount.value = ''
    actualCoin.value = 'TRX'
    deadline.value = ''
  }

  /**
   * 复制充值地址
   */
  const copyAddress = () => {
    if (rechargeAddress.value) {
      copyText(rechargeAddress.value)
    }
  }

  /**
   * 复制充值金额（使用接口返回的实际金额）
   */
  const copyActualAmount = () => {
    if (actualAmount.value || selectedAmount.value > 0) {
      copyText(displayActualAmount.value, t('recharge.copyAmountSuccess'))
    }
  }

  /**
   * 获取最新用户信息
   */
  const fetchUserInfo = async () => {
    if (!userStore.isLogin || !userStore.token) {
      return
    }
    
    try {
      const response = await authApi.getUserInfo()
      if (response.code === '000000' && response.data) {
        userStore.updateUserInfo(response.data)
        console.log('[Recharge] 用户信息已更新')
      }
    } catch (error) {
      console.error('[Recharge] 获取用户信息失败:', error)
    }
  }

  /**
   * 打开弹窗
   */
  const open = async () => {
    visible.value = true
    currentStep.value = 1
    selectedCoin.value = 'TRX'
    selectedAmount.value = 0
    customAmountInput.value = '1'
    isCustomAmount.value = false
    resetOrderData()
    
    // 获取最新用户信息
    await fetchUserInfo()
  }

  /**
   * 延迟获取用户信息（多次调用）
   * 在关闭弹窗后分别在 5秒、10秒、15秒 后调用用户信息接口
   */
  const fetchUserInfoWithDelay = () => {
    const delays = [5000, 10000, 15000] // 5秒、10秒、15秒
    
    delays.forEach((delay, index) => {
      setTimeout(async () => {
        try {
          console.log(`[Recharge] 第${index + 1}次延迟获取用户信息（延迟${delay / 1000}秒）`)
          await fetchUserInfo()
        } catch (error) {
          console.error(`[Recharge] 第${index + 1}次延迟获取用户信息失败:`, error)
        }
      }, delay)
    })
  }

  /**
   * 关闭弹窗
   */
  const close = () => {
    // 如果在第二步关闭弹窗，延迟调用用户信息接口
    if (currentStep.value === 2) {
      console.log('[Recharge] 关闭弹窗，启动延迟获取用户信息')
      fetchUserInfoWithDelay()
    }
    
    visible.value = false
    currentStep.value = 1
    selectedCoin.value = 'TRX'
    selectedAmount.value = 0
    customAmountInput.value = '1'
    isCustomAmount.value = false
    resetOrderData()
  }

  return {
    // 状态
    visible,
    isCopying,
    isLoadingAddress,
    currentStep,
    selectedCoin,
    
    // 用户输入
    selectedAmount,
    customAmountInput,
    isCustomAmount,
    presetAmounts,
    amountInputmode,
    amountPattern,
    
    // 订单数据
    rechargeAddress,
    actualAmount,
    displayActualAmount,
    actualCoin,
    deadline,
    isLoadingExchangeRate,
    usdtExchangeRateText,
    estimatedTrxAmount,
    
    // 方法
    selectPresetAmount,
    handleCoinChange,
    handleCustomAmountFocus,
    handleCustomAmountInput,
    confirmAmount,
    copyAddress,
    copyActualAmount,
    open,
    close,
  }
}
