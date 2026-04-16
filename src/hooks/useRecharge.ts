/**
 * 充值弹窗业务逻辑 Hook
 */

import { ref, computed } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { authApi, addressApi } from '@/api'
import { AddressKind } from '@/api/modules/address/types'
import { useCopyToClipboard } from './useCopyToClipboard'
import type { UserAccountInfo, TableRow } from '@/plugins/rechargePopup/types'

export function useRecharge() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { isCopying, copyText } = useCopyToClipboard()

  const visible = ref(false)
  const rechargeAddress = ref<string>('')
  const isLoadingAddress = ref(false)

  /**
   * 获取充值地址
   */
  const fetchRechargeAddress = async () => {
    isLoadingAddress.value = true
    try {
      const response = await addressApi.getAddress({ kind: AddressKind.RECHARGE })
      
      if (response.code === '000000' && response.data) {
        // 处理多种可能的数据结构
        let address = ''
        
        if (typeof response.data === 'string') {
          address = response.data
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          address = typeof response.data[0] === 'string' 
            ? response.data[0] 
            : response.data[0].address || ''
        } else if (typeof response.data === 'object' && 'address' in response.data) {
          address = response.data.address || ''
        }
        
        if (address) {
          rechargeAddress.value = address
        }
      }
    } catch (error) {
      console.error('获取充值地址失败:', error)
    } finally {
      isLoadingAddress.value = false
    }
  }

  /**
   * 获取用户账户信息
   */
  const userAccountInfo = computed<UserAccountInfo>(() => {
    const userInfo = userStore.userInfo
    if (!userInfo) {
      return {
        accountNumber: '-',
        email: '-',
        tgOfficialNumber: '-',
        trxAmount: '0 TRX',
      }
    }

    return {
      accountNumber: userInfo.username || '-',
      email: userInfo.email || '-',
      tgOfficialNumber: userInfo.tg_user_name || '-',
      trxAmount: `${userInfo.trx_balance || '0'} TRX`,
    }
  })

  /**
   * 表格数据
   */
  const tableData = computed<TableRow[]>(() => [
    { label: t('recharge.account'), value: userAccountInfo.value.accountNumber },
    { label: t('recharge.email'), value: userAccountInfo.value.email },
    { label: t('recharge.tgOfficial'), value: userAccountInfo.value.tgOfficialNumber },
    { label: t('recharge.trxBalance'), value: userAccountInfo.value.trxAmount },
    { 
      label: t('recharge.rechargeAddress'), 
      value: rechargeAddress.value || '-', 
      type: 'address' 
    },
  ])

  /**
   * 生成二维码
   */
  const qrCode = computed(() => {
    return rechargeAddress.value ? useQRCode(rechargeAddress.value).value : ''
  })

  /**
   * 复制充值地址
   */
  const copyAddress = () => {
    if (rechargeAddress.value) {
      copyText(rechargeAddress.value)
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
    await Promise.all([
      fetchUserInfo(),
      fetchRechargeAddress()
    ])
  }

  /**
   * 关闭弹窗
   */
  const close = () => {
    visible.value = false
  }

  return {
    visible,
    isCopying,
    isLoadingAddress,
    tableData,
    qrCode,
    rechargeAddress,
    copyAddress,
    open,
    close,
  }
}
