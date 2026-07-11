/**
 * Header 导航逻辑（从 Header.vue 抽出，便于维护）
 */
import { computed, reactive, ref, getCurrentInstance, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CollapseModelValue } from 'element-plus'
import { useCommonStore } from '@/stores/useCommonStore'
import { useUserStore } from '@/stores/useUserStore'
import { useLangStore } from '@/stores/useLangStore'
import { useSiteStore } from '@/stores/useSiteStore'
import { storeToRefs } from 'pinia'
import { handleOpenToTelegram } from '@/utils'
import { setLocale } from '@/lang'
import type { Locale } from '@/lang/types'
import { getSite, DEFAULT_SITE } from '@/utils/site'
import { formatBalance } from '@/utils/number'
import { isTelegramMiniApp } from '@/utils/telegram'
import { clearAuthSession } from '@/utils/session'

export function useHeaderNav() {
  const instance = getCurrentInstance()
  const proxy = instance?.proxy as {
    $loginPopup?: { open: () => void | Promise<void> }
    $registerPopup?: { open: () => void | Promise<void> }
    $rechargePopup?: { open: () => void | Promise<void> }
    $revisePasswordPopup?: { open: () => void | Promise<void> }
    $userInfoPopup?: { open: () => void | Promise<void> }
  } | null

  const commonStore = useCommonStore()
  const siteStore = useSiteStore()
  const { isMobile: isMobileView } = storeToRefs(commonStore)
  const { tgAdmin, botName } = storeToRefs(siteStore)

  const localLang = ref(useLangStore().currentLocale)
  const activeNames = ref<string[]>([])
  const isMenu = ref(false)
  const menuBtn = ref(null)

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const { logout } = userStore

  // 精简模式：依赖响应式的路由参数判断
  const isLite = computed(() => {
    const site = (route.params.site as string) || getSite()
    return site === DEFAULT_SITE
  })

  const isTgEnv = isTelegramMiniApp()

  const lang = reactive({
    en: 'English',
    'zh-CN': '中文',
    ja: '日本語',
    ko: '한국어',
    ru: 'Русский',
    ar: 'العربية',
    es: 'Español',
    tr: 'Türkçe',
    'zh-TW': '繁體中文',
  })

  const isActiveHome = computed(() => {
    const site = getSite()
    if (route.hash) return false
    const energyRentalPaths = [`/${site}/lease-time`, `/${site}/lease-count`]
    return (
      route.path === `/${site}` ||
      route.path === `/${site}/` ||
      energyRentalPaths.includes(route.path as string)
    )
  })

  const isActiveFaq = computed(() => {
    const site = getSite()
    return (route.path === `/${site}` || route.path === `/${site}/`) && !!route.hash
  })

  const isLogin = computed(() => userStore.isLogin)

  const trxBalance = computed(() => {
    if (!userStore.userInfo) return '0.00'
    return formatBalance(userStore.userInfo.trx_balance)
  })

  const isActive = (path: string) => {
    const site = getSite()
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const fullPath = `/${site}${normalizedPath}`

    if (normalizedPath === '/') {
      return route.path === `/${site}` || route.path === `/${site}/`
    }

    return route.path === fullPath
  }

  const isHashActive = (hash: string) => route.hash === hash

  const handleToRouter = (path: string, hash?: string) => {
    const site = getSite()
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const fullPath = `/${site}${normalizedPath}`
    router.push({ path: fullPath, hash })

    if (isMobileView.value) {
      handleMenu('router')
    }
  }

  const handleLanguageChange = (local: Locale) => {
    localLang.value = local
    void setLocale(local)
  }

  const handleLogin = () => {
    void proxy?.$loginPopup?.open()
  }

  const handleRegister = () => {
    void proxy?.$registerPopup?.open()
  }

  const handleRechange = () => {
    void proxy?.$rechargePopup?.open()
  }

  const handleModifyPassword = () => {
    void proxy?.$revisePasswordPopup?.open()
  }

  const handleUserInfo = () => {
    void proxy?.$userInfoPopup?.open()
  }

  const handleTgRelogin = () => {
    window.location.reload()
  }

  const handleLogout = async () => {
    try {
      await logout()
      await clearAuthSession()

      const currentPath = window.location.pathname
      const segments = currentPath.split('/').filter(Boolean)
      const site = segments[0] || ''
      window.location.href = site ? `/${site}/` : '/'
    } catch (error) {
      console.error('退出登录失败:', error)
      const currentPath = window.location.pathname
      const segments = currentPath.split('/').filter(Boolean)
      const site = segments[0] || ''
      window.location.href = site ? `/${site}/` : '/'
    }
  }

  const handleChange = (_val: CollapseModelValue) => {
    // collapse 展开状态由 activeNames 托管
  }

  const handleCollapseDestroy = () => {
    isMenu.value = false
    activeNames.value = []
  }

  const handleMenu = (type: 'menu' | 'router' = 'menu') => {
    isMenu.value = type !== 'menu' ? false : !isMenu.value
  }

  watch(isMobileView, (mobile) => {
    if (!mobile && isMenu.value) {
      handleCollapseDestroy()
    }
  })

  return {
    isMobileView,
    tgAdmin,
    botName,
    localLang,
    activeNames,
    isMenu,
    menuBtn,
    isLite,
    isTgEnv,
    lang,
    isActiveHome,
    isActiveFaq,
    isLogin,
    trxBalance,
    isActive,
    isHashActive,
    handleToRouter,
    handleLanguageChange,
    handleLogin,
    handleRegister,
    handleRechange,
    handleModifyPassword,
    handleUserInfo,
    handleTgRelogin,
    handleLogout,
    handleChange,
    handleCollapseDestroy,
    handleMenu,
    handleOpenToTelegram,
  }
}
