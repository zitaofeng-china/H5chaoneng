<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/index.vue'
import WelcomeDialog from '@/components/WelcomeDialog.vue'
import TelegramFloat from '@/components/TelegramFloat.vue'
import { useSiteVerification } from '@/hooks/useSiteVerification'
import { useUserStore } from '@/stores/useUserStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useBury } from '@/hooks/useBury'
import { useTelegramLogin } from '@/hooks/useTelegramLogin'
import { getSite } from '@/utils/site'

const route = useRoute()
const { verifySite } = useSiteVerification()
const userStore = useUserStore()
const priceStore = usePriceStore()
const { track } = useBury()
const { isInTelegram, initTelegram } = useTelegramLogin()

const is404Page = computed(() => route.name === 'NotFound')

/** 页面重新可见时刷新用户信息的最小间隔（毫秒） */
const USER_INFO_REFRESH_THROTTLE = 30_000
let lastUserInfoFetchAt = 0

/**
 * 监听页面可见性变化，自动刷新用户信息（节流）
 */
function handleVisibilityChange() {
  if (document.hidden || !userStore.isLogin) return
  const now = Date.now()
  if (now - lastUserInfoFetchAt < USER_INFO_REFRESH_THROTTLE) return
  lastUserInfoFetchAt = now
  userStore.fetchUserInfo()
}

onMounted(async () => {
  // 埋点：统计设备数（只触发一次）
  track('运行过项目设备数', true)

  if (!is404Page.value) {
    const isValid = await verifySite()
    if (isValid) {
      // 价格已在 verifySite 中写入 priceStore；仅在缺失时兜底拉取
      if (!priceStore.priceData) {
        await priceStore.fetchPrice()
      }

      // Telegram Mini App 自动登录（在 init 之前，确保 token 先存好）
      await initTelegram(getSite())

      // 初始化 userStore（此时 TG 登录的 token 已存好）
      userStore.init()

      // 如果用户已登录（包括 Telegram 自动登录），获取最新用户信息
      if (userStore.isLogin) {
        lastUserInfoFetchAt = Date.now()
        await userStore.fetchUserInfo()
      }
    }
  }

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div id="app" :class="{ 'is-404': is404Page }">
    <Layout v-if="!is404Page" />
    <router-view v-else />

    <!-- 首次访问欢迎弹窗 -->
    <WelcomeDialog v-if="!is404Page" />

    <!-- Telegram 浮窗按钮（非 Telegram 环境才显示） -->
    <TelegramFloat v-if="!is404Page && !isInTelegram" />
  </div>
</template>

<style lang="scss" scoped>
#app {
  padding-top: 66px;
  overflow: hidden;
  overflow-y: auto;

  &.is-404 {
    padding-top: 0;
  }
}

@media (max-width: 890px) {
  #app {
    padding-top: 54px;
  }
}
</style>
