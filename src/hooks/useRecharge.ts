/**
 * 充值弹窗业务逻辑 Hook
 */

import { ref, computed } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { authApi } from '@/api'
import { useCopyToClipboard } from './useCopyToClipboard'
import type { UserAccountInfo, TableRow } from '@/plugins/rechargePopup/types'

// 固定的充值地址
const FIXED_RECHARGE_ADDRESS = 'TVu2qP0XXDwm2W6S5m1i8iVyv2mVAUakax'

export function useRecharge() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { isCopying, copyText } = useCopyToClipboard()

  const visible = ref(false)

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
    { label: t('recharge.rechargeAddress'), value: FIXED_RECHARGE_ADDRESS, type: 'address' },
  ])

  /**
   * 生成二维码
   */
  const qrCode = useQRCode(FIXED_RECHARGE_ADDRESS)

  /**
   * 复制充值地址
   */
  const copyAddress = () => {
    copyText(FIXED_RECHARGE_ADDRESS)
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
    await fetchUserInfo()
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
    tableData,
    qrCode,
    copyAddress,
    open,
    close,
  }
}
