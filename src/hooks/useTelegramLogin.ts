/**
 * Telegram Mini App 自动登录 Hook
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/element'
import { useUserStore } from '@/stores/useUserStore'
import {
  isTelegramMiniApp,
  getTelegramInitData,
  getTelegramUser,
  telegramReady,
  telegramExpand,
} from '@/utils/telegram'
import { getSite } from '@/utils/site'
import { setToken, setTokenExpiredAt } from '@/utils/token'
import { post } from '@/api/request'

/** 登录失败全屏提示（未开放 Mini App） */
export const TG_LOGIN_BLOCKED_MESSAGE = '您的账号未开放MiniAPP，请联系代理开启！！！'
const TG_LOGIN_SUCCESS_MESSAGE = '登录成功'
const TG_LOGIN_EXPIRE_TIME_PREFIX = '登录有效期至'
const TG_LOGIN_EXPIRE_TIME_ERROR_MESSAGE = '登录过期时间异常，请联系客服'
/** 关闭倒计时秒数 */
export const TG_LOGIN_BLOCKED_COUNTDOWN = 3

function isEmptyData(data: unknown): boolean {
  if (data == null) return true
  if (typeof data === 'object' && !Array.isArray(data)) {
    return Object.keys(data).length === 0
  }
  return false
}

function formatExpireTime(time: number): string {
  const date = new Date(time)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 走统一 request：自动带 Site；InitData 放自定义 Header */
async function tgLoginApi(initData: string) {
  return post(
    '/v3/login',
    {},
    {
      headers: {
        InitData: initData,
      },
    },
  )
}

export function useTelegramLogin() {
  const isInTelegram = ref(false)
  const tgLoginLoading = ref(false)
  const tgLoginError = ref('')
  /** Mini App 登录失败：展示全屏拦截 + 倒计时关闭 */
  const tgLoginBlocked = ref(false)

  function markLoginBlocked(reason?: string) {
    console.error('[Telegram] 登录失败，展示拦截页:', reason || TG_LOGIN_BLOCKED_MESSAGE)
    tgLoginError.value = TG_LOGIN_BLOCKED_MESSAGE
    tgLoginBlocked.value = true
  }

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
      markLoginBlocked('missing initData')
      return false
    }

    tgLoginLoading.value = true
    tgLoginError.value = ''
    tgLoginBlocked.value = false

    try {
      const response = await tgLoginApi(initData)
      const data = response?.data as Record<string, unknown> | null | undefined

      if (String(response?.code) === '200013') {
        markLoginBlocked(`code 200013: ${response?.msg || ''}`)
        return false
      }

      if (isEmptyData(data)) {
        markLoginBlocked('empty data')
        return false
      }

      if (response.code === '000000' && data) {
        const token = data.token as string | undefined
        const user_info = data.user_info as Parameters<typeof userStore.updateUserInfo>[0]
        const responseSite = data.site as string | undefined

        // 保存 token
        if (token) {
          setToken(token)
          userStore.token = token
        }

        // 保存过期时间（后端返回秒级时间戳，需要转为毫秒）
        const expiredAt = (data.expired_at ?? data.expirated_at) as number | undefined
        const expiredAtMs = Number(expiredAt) * 1000
        let expireTip = ''
        if (Number.isFinite(expiredAtMs) && expiredAtMs > 0) {
          setTokenExpiredAt(expiredAtMs)
          expireTip = `${TG_LOGIN_EXPIRE_TIME_PREFIX}：${formatExpireTime(expiredAtMs)}`
        }

        // 保存用户信息
        if (user_info) {
          userStore.updateUserInfo(user_info)
        }

        console.log('[Telegram] 自动登录成功')
        // 合并为一条提示，避免 success/info 同时弹出叠在一起
        if (expireTip) {
          ElMessage.success(`${TG_LOGIN_SUCCESS_MESSAGE}，${expireTip}`)
        } else {
          ElMessage.success(TG_LOGIN_SUCCESS_MESSAGE)
          ElMessage.warning(TG_LOGIN_EXPIRE_TIME_ERROR_MESSAGE)
        }

        // 动态站点跳转：后端返回站点标识时，跳转到对应站点
        if (responseSite && responseSite !== getSite()) {
          console.log('[Telegram] 动态跳转到站点:', responseSite)
          router.replace(`/${responseSite}/`)
        } else if (site && site !== getSite()) {
          // site 参数兼容
        }

        return true
      }

      markLoginBlocked(`code ${response?.code}: ${response?.msg || ''}`)
      return false
    } catch (error) {
      console.error('[Telegram] 登录请求失败:', error)
      markLoginBlocked(error instanceof Error ? error.message : 'request error')
      return false
    } finally {
      tgLoginLoading.value = false
    }
  }

  return {
    isInTelegram,
    tgLoginLoading,
    tgLoginError,
    tgLoginBlocked,
    initTelegram,
  }
}
