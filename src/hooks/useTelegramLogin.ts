/**
 * Telegram Mini App 自动登录 Hook
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { isTelegramMiniApp, getTelegramInitData, getTelegramUser, telegramReady, telegramExpand } from '@/utils/telegram'
import { getSite } from '@/utils/site'
import { setToken, setTokenExpiredAt } from '@/utils/token'

// 使用后端 /v3/login 接口，InitData 放在 Header 中
async function tgLoginApi(initData: string, site: string) {
  const headers = {
    'Content-Type': 'application/json',
    'Site': site,
    'InitData': initData,
  }
  // 调试：打印发送的 headers
  console.log('[Telegram] 请求 headers:', JSON.stringify({ Site: site, InitData: initData.substring(0, 50) + '...' }))
  
  const response = await fetch('/v3/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  })
  return response.json()
}

export function useTelegramLogin() {
  const isInTelegram = ref(false)
  const tgLoginLoading = ref(false)
  const tgLoginError = ref('')

  /**
   * 初始化 Telegram Mini App
   * - 检测环境
   * - 通知 Telegram 页面已准备好
   * - 展开到全屏
   * - 自动登录
   * - 动态跳转到对应站点
   */
  const initTelegram = async (site: string) => {
    // 检测是否在 Telegram 环境
    isInTelegram.value = isTelegramMiniApp()

    if (!isInTelegram.value) {
      console.log('[Telegram] 非 Telegram Mini App 环境')
      return false
    }

    console.log('[Telegram] 检测到 Telegram Mini App 环境')

    // 通知 Telegram 页面已准备好
    telegramReady()

    // 展开到全屏
    telegramExpand()

    // 获取用户信息（调试用）
    const tgUser = getTelegramUser()
    console.log('[Telegram] 用户信息:', tgUser)

    // 自动登录
    return await autoLogin(site)
  }

  /**
   * 使用 Telegram initData 自动登录
   * 后端返回 site 字段时，自动跳转到对应站点
   */
  const autoLogin = async (site: string) => {
    const userStore = useUserStore()
    const router = useRouter()

    // 如果已经登录了，不重复登录
    if (userStore.isLogin) {
      console.log('[Telegram] 用户已登录，跳过自动登录')
      return true
    }

    const initData = getTelegramInitData()
    if (!initData) {
      console.warn('[Telegram] 无法获取 initData')
      tgLoginError.value = '无法获取 Telegram 登录信息'
      return false
    }

    tgLoginLoading.value = true
    tgLoginError.value = ''

    try {
      console.log('[Telegram] 开始自动登录...')
      const response = await tgLoginApi(initData, site)
      
      // 调试：打印接口返回的完整数据
      console.log('[Telegram] 接口响应:', JSON.stringify(response))
      tgLoginError.value = `API响应: ${JSON.stringify(response)}`

      if (response.code === '000000' && response.data) {
        const { token, user_info, site: responseSite } = response.data

        // 保存 token
        if (token) {
          setToken(token)
          userStore.token = token
        }

        // 保存过期时间（后端返回秒级时间戳，需要转为毫秒）
        const expiredAt = response.data.expired_at || response.data.expirated_at
        if (expiredAt) {
          setTokenExpiredAt(Number(expiredAt) * 1000)
        }

        // 保存用户信息
        if (user_info) {
          userStore.updateUserInfo(user_info)
        }

        console.log('[Telegram] 自动登录成功')

        // 动态站点跳转：后端返回站点标识时，跳转到对应站点
        if (responseSite && responseSite !== getSite()) {
          console.log('[Telegram] 动态跳转到站点:', responseSite)
          router.replace(`/${responseSite}/`)
        }

        return true
      } else {
        console.error('[Telegram] 登录失败:', response.msg)
        tgLoginError.value = response.msg || '登录失败'
        return false
      }
    } catch (error) {
      console.error('[Telegram] 登录请求失败:', error)
      tgLoginError.value = '网络错误，请重试'
      return false
    } finally {
      tgLoginLoading.value = false
    }
  }

  return {
    isInTelegram,
    tgLoginLoading,
    tgLoginError,
    initTelegram,
  }
}
