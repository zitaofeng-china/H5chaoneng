<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/index.vue'
import WelcomeDialog from '@/components/WelcomeDialog.vue'
import TelegramFloat from '@/components/TelegramFloat.vue'
import SiteWaiting from '@/components/SiteWaiting.vue'
import TgLoginBlocked from '@/components/TgLoginBlocked.vue'
import NotFoundPage from '@/pages/404/index.vue'
import { useSiteVerification } from '@/hooks/useSiteVerification'
import { useUserStore } from '@/stores/useUserStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useBury } from '@/hooks/useBury'
import { useTelegramLogin, TG_LOGIN_BLOCKED_COUNTDOWN } from '@/hooks/useTelegramLogin'
import { getSite } from '@/utils/site'
import { siteBootstrap } from '@/utils/siteBootstrap'
import { isTelegramEnvironment, isTelegramMiniApp } from '@/utils/telegram'

const route = useRoute()
const { isFinished, isValidRef, syncFromBootstrap } = useSiteVerification()
const userStore = useUserStore()
const priceStore = usePriceStore()
const { track } = useBury()
const { isInTelegram, tgLoginBlocked, initTelegram } = useTelegramLogin()

// 与模块门禁对齐（防止 setup 时序差异）
syncFromBootstrap()

/** Mini App 容器（站点失败时 isInTelegram 可能仍为 false，不能只依赖登录 hook） */
const isTgEnv = computed(
  () => isInTelegram.value || isTelegramEnvironment() || isTelegramMiniApp(),
)

/** 未知业务路径（站点已通过时才可能命中） */
const isUnknownPath = computed(
  () => route.name === 'NotFound' || route.name === 'NotFoundStandalone',
)

/**
 * Mini App 拦截页（倒计时关闭）：
 * - 自动登录失败
 * - 站点不存在 / 校验失败
 */
const showMiniAppBlocked = computed(
  () => tgLoginBlocked.value || (isFinished.value && !isValidRef.value && isTgEnv.value),
)

/**
 * 是否展示 404（仅非 Mini App 拦截场景）：
 * - 普通 H5 站点不存在
 * - 站点存在但路径未知
 */
const show404 = computed(
  () =>
    isFinished.value &&
    !showMiniAppBlocked.value &&
    (!isValidRef.value || isUnknownPath.value),
)

/** 仅站点校验成功且路径合法时展示完整业务页 */
const showApp = computed(
  () => isFinished.value && isValidRef.value && !isUnknownPath.value,
)

/** 校验未完成：等待页 */
const showWaiting = computed(() => !isFinished.value || !siteBootstrap.finished)

/** 页面重新可见时刷新用户信息的最小间隔（毫秒） */
const USER_INFO_REFRESH_THROTTLE = 30_000
let lastUserInfoFetchAt = 0

function handleVisibilityChange() {
  if (document.hidden || !userStore.isLogin || !isValidRef.value) return
  const now = Date.now()
  if (now - lastUserInfoFetchAt < USER_INFO_REFRESH_THROTTLE) return
  lastUserInfoFetchAt = now
  userStore.fetchUserInfo()
}

onMounted(async () => {
  syncFromBootstrap()

  track('运行过项目设备数', true)

  // 业务初始化仅在站点已通过时执行（校验已在 mount 前完成）
  if (isValidRef.value) {
    if (!priceStore.priceData) {
      await priceStore.fetchPrice()
    }

    await initTelegram(getSite())
    userStore.init()

    if (userStore.isLogin) {
      lastUserInfoFetchAt = Date.now()
      await userStore.fetchUserInfo()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <!-- Mini App：登录失败 / 站点不存在 → 全屏拦截 + 倒计时关闭 -->
  <TgLoginBlocked
    v-if="showMiniAppBlocked"
    :message="$t('error.miniAppNotOpen')"
    :seconds="TG_LOGIN_BLOCKED_COUNTDOWN"
  />

  <!-- 站点校验中：等待页 -->
  <SiteWaiting v-else-if="showWaiting" />

  <!-- 普通 H5：站点不存在 / 未知路径 → 404 -->
  <div v-else-if="show404" class="app-shell is-404">
    <NotFoundPage />
  </div>

  <!-- 站点存在：完整业务页 -->
  <div v-else-if="showApp" class="app-shell">
    <Layout />
    <WelcomeDialog />
    <TelegramFloat v-if="!isInTelegram" />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  --layout-header-height: var(--theme-home-band-height, 50px);
  padding-top: var(--layout-header-height);
  overflow: hidden;
  overflow-y: auto;
  min-height: 100vh;

  &.is-404 {
    padding-top: 0;
  }
}

@media (max-width: 890px) {
  .app-shell:not(.is-404) {
    --layout-header-height: var(--theme-home-band-height, 50px);
    padding-top: var(--layout-header-height);
  }
}

@media (max-width: 360px) {
  .app-shell:not(.is-404) {
    --layout-header-height: var(--theme-home-band-height, 50px);
    padding-top: var(--layout-header-height);
  }
}
</style>
