/**
 * 充值弹窗业务逻辑 Hook
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/useUserStore'
import { authApi, orderApi } from '@/api'
import { useCopyToClipboard } from './useCopyToClipboard'
import { useI18n } from 'vue-i18n'
import { formatDeadline } from '@/utils/time'

export function useRecharge() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { isCopying, copyText } = useCopyToClipboard()

  // 弹窗状态
  const visible = ref(false)
  const isLoadingAddress = ref(false)
  
  // 充值流程状态
  const currentStep = ref(1) // 1: 选择金额, 2: 显示地址
  
  // 用户输入的金额
  const selectedAmount = ref<number>(0)
  const customAmountInput = ref<string>('')
  const isCustomAmount = ref(false)
  const presetAmounts = [10, 30, 50, 200, 500, 1000]
  
  // 订单返回的实际数据
  const rechargeAddress = ref<string>('') // 充值地址
  const actualAmount = ref<string>('')    // 实际充值金额
  const actualCoin = ref<string>('TRX')   // 币种
  const deadline = ref<string>('')        // 转账截止时间

  /**
   * 选择预设金额
   */
  const selectPresetAmount = (amount: number) => {
    selectedAmount.value = amount
    isCustomAmount.value = false
    customAmountInput.value = ''
  }

  /**
   * 自定义金额输入框获得焦点
   */
  const handleCustomAmountFocus = () => {
    isCustomAmount.value = true
    if (customAmountInput.value) {
      selectedAmount.value = parseFloat(customAmountInput.value) || 0
    }
  }

  /**
   * 自定义金额输入
   */
  const handleCustomAmountInput = (value: string) => {
    isCustomAmount.value = true
    const amount = parseFloat(value) || 0
    selectedAmount.value = amount
  }

  /**
   * 确认金额，创建充值订单并进入第二步
   */
  const confirmAmount = async () => {
    // 验证金额
    if (selectedAmount.value < 1) {
      ElMessage.warning(t('recharge.invalidAmount') || '请输入有效的充值金额')
      return
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
        amount: selectedAmount.value,
        coin: 'TRX',
        userId
      })
      
      // 创建充值订单
      const response = await orderApi.createDepositOrder({
        amount: selectedAmount.value,
        coin: 'TRX',
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
      actualCoin.value = coin || 'TRX'
      
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
      
    } catch (error: any) {
      console.error('[Recharge] 创建订单异常:', error)
      
      // 如果是未登录错误，关闭弹窗
      if (error.message === 'NOT_LOGGED_IN') {
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
    if (actualAmount.value) {
      copyText(actualAmount.value, t('recharge.copyAmountSuccess'))
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
    
    // 用户输入
    selectedAmount,
    customAmountInput,
    isCustomAmount,
    presetAmounts,
    
    // 订单数据
    rechargeAddress,
    actualAmount,
    actualCoin,
    deadline,
    
    // 方法
    selectPresetAmount,
    handleCustomAmountFocus,
    handleCustomAmountInput,
    confirmAmount,
    copyAddress,
    copyActualAmount,
    open,
    close,
  }
}
