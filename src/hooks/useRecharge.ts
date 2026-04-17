/**
 * 充值弹窗业务逻辑 Hook
 */

import { ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { authApi, addressApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import { useCopyToClipboard } from './useCopyToClipboard'
import { useI18n } from 'vue-i18n'

export function useRecharge() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { isCopying, copyText } = useCopyToClipboard()

  const visible = ref(false)
  const rechargeAddress = ref<string>('')
  const isLoadingAddress = ref(false)
  
  // 充值流程状态
  const currentStep = ref(1) // 1: 选择金额, 2: 显示地址
  const selectedAmount = ref<number>(0)
  const finalAmount = ref<number>(0) // 最终充值金额（包含随机小数）
  const customAmountInput = ref<string>('')
  const isCustomAmount = ref(false)
  const presetAmounts = [10, 30, 50, 200, 500, 1000]

  /**
   * 计算最终充值金额（固定添加0.01）
   */
  const calculateFinalAmount = (baseAmount: number): number => {
    const integerPart = Math.floor(baseAmount)
    return parseFloat((integerPart + 0.01).toFixed(2))
  }

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
   * 确认金额，进入第二步
   */
  const confirmAmount = async () => {
    if (selectedAmount.value < 1) {
      return
    }
    // 计算最终充值金额（包含随机小数）
    finalAmount.value = calculateFinalAmount(selectedAmount.value)
    currentStep.value = 2
    // 进入第二步时获取充值地址
    await Promise.all([
      fetchUserInfo(),
      fetchRechargeAddress()
    ])
  }

  /**
   * 返回第一步
   */
  const backToStep1 = () => {
    currentStep.value = 1
  }

  /**
   * 获取充值地址
   */
  const fetchRechargeAddress = async () => {
    isLoadingAddress.value = true
    
    // 设置10秒超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 10000)
    })
    
    try {
      console.log('[Recharge] 开始获取充值地址, kind=', AddressKind.RECHARGE)
      
      const response = await Promise.race([
        addressApi.getAddress({ kind: AddressKind.RECHARGE }),
        timeoutPromise
      ]) as any
      
      console.log('[Recharge] 获取充值地址响应:', response)
      
      if (response.code === '000000' && response.data) {
        // 处理多种可能的数据结构
        let address = ''
        
        if (typeof response.data === 'string') {
          address = response.data
          console.log('[Recharge] 地址类型: 字符串', address)
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          address = typeof response.data[0] === 'string' 
            ? response.data[0] 
            : response.data[0].address || ''
          console.log('[Recharge] 地址类型: 数组', address)
        } else if (typeof response.data === 'object' && 'address' in response.data) {
          address = response.data.address || ''
          console.log('[Recharge] 地址类型: 对象', address)
        }
        
        if (address) {
          rechargeAddress.value = address
          console.log('[Recharge] 充值地址设置成功:', address)
        } else {
          console.warn('[Recharge] 无法从响应中提取地址')
        }
      } else {
        console.warn('[Recharge] 响应码不是 000000 或没有数据:', response)
      }
    } catch (error) {
      console.error('[Recharge] 获取充值地址失败:', error)
      // 确保即使出错也要停止加载状态
      rechargeAddress.value = ''
    } finally {
      isLoadingAddress.value = false
      console.log('[Recharge] 加载状态结束, isLoadingAddress=', isLoadingAddress.value)
    }
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
   * 复制最终充值金额
   */
  const copyFinalAmount = () => {
    if (finalAmount.value > 0) {
      copyText(finalAmount.value.toString(), t('recharge.copyAmountSuccess'))
    }
  }

  /**
   * 获取最新用户信息
   */
  const fetchUserInfo = async () => {
    if (userStore.isLogin && userStore.token) {
      try {
        const userInfoResponse = await authApi.getUserInfo()
        if (userInfoResponse.code === '000000' && userInfoResponse.data) {
          userStore.updateUserInfo(userInfoResponse.data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
  }

  /**
   * 打开弹窗
   */
  const open = async () => {
    visible.value = true
    currentStep.value = 1
    selectedAmount.value = 0
    customAmountInput.value = '1' // 默认值为1
    isCustomAmount.value = false
    rechargeAddress.value = ''
    finalAmount.value = 0
    // 只获取用户信息，不获取地址（等确认金额后再获取）
    await fetchUserInfo()
  }

  /**
   * 关闭弹窗
   */
  const close = () => {
    visible.value = false
    currentStep.value = 1
    selectedAmount.value = 0
    customAmountInput.value = '1' // 重置为默认值1
    isCustomAmount.value = false
    rechargeAddress.value = ''
    finalAmount.value = 0
  }

  return {
    visible,
    isCopying,
    isLoadingAddress,
    currentStep,
    selectedAmount,
    finalAmount,
    customAmountInput,
    isCustomAmount,
    presetAmounts,
    rechargeAddress,
    selectPresetAmount,
    handleCustomAmountFocus,
    handleCustomAmountInput,
    confirmAmount,
    backToStep1,
    copyAddress,
    copyFinalAmount,
    open,
    close,
  }
}
