<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
import { isTelegramMiniApp, getTelegramInitData, getTelegramUser } from '@/utils/telegram'

const route = useRoute()
const { verifySite } = useSiteVerification()
const userStore = useUserStore()
const priceStore = usePriceStore()
const { track } = useBury()
const { isInTelegram, initTelegram, tgLoginLoading, tgLoginError } = useTelegramLogin()

const is404Page = computed(() => route.name === 'NotFound')

// ===== 调试面板 =====
const showDebug = ref(false)
const debugLogs = ref<string[]>([])

function debugLog(msg: string) {
  debugLogs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
}
// ===== 调试结束 =====

/**
 * 监听页面可见性变化，自动刷新用户信息
 */
function handleVisibilityChange() {
  if (!document.hidden && userStore.isLogin) {
    // 页面变为可见且用户已登录时，刷新用户信息
    userStore.fetchUserInfo()
  }
}

onMounted(async () => {
  // 调试：检测 TG 环境
  const isTg = isTelegramMiniApp()
  debugLog(`isTelegramMiniApp: ${isTg}`)
  debugLog(`window.Telegram: ${!!(window as any).Telegram}`)
  const initDataStr = getTelegramInitData()
  debugLog(`initData length: ${initDataStr?.length || 0}`)
  debugLog(`initData: ${initDataStr}`)
  if (isTg) {
    const user = getTelegramUser()
    debugLog(`TG user: ${JSON.stringify(user)}`)
    showDebug.value = true
  }

  // 埋点：统计设备数（只触发一次）
  track('运行过项目设备数', true)
  
  if (!is404Page.value) {
    const isValid = await verifySite()
    debugLog(`verifySite result: ${isValid}`)
    if (isValid) {
      userStore.init()
      await priceStore.fetchPrice()
      
      // Telegram Mini App 自动登录
      debugLog(`开始 TG 自动登录, site: ${getSite()}`)
      debugLog(`请求 Headers: Site=${getSite()}, InitData长度=${getTelegramInitData()?.length}`)
      const loginResult = await initTelegram(getSite())
      debugLog(`TG 登录结果: ${loginResult}, error: ${tgLoginError.value}`)
      debugLog(`isLogin: ${userStore.isLogin}`)
      
      // 如果用户已登录（包括 Telegram 自动登录），获取最新用户信息
      if (userStore.isLogin) {
        await userStore.fetchUserInfo()
        debugLog(`用户信息已刷新`)
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
    <!-- 调试面板 -->
    <div v-if="showDebug" style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;padding:10px;font-size:11px;max-height:45vh;overflow:auto;white-space:pre-wrap;word-break:break-all;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <strong>🔧 TG Debug</strong>
        <span style="cursor:pointer;color:red;font-size:16px;" @click="showDebug=false">✕</span>
      </div>
      <div v-for="(log, i) in debugLogs" :key="i">{{ log }}</div>
    </div>

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

@media (max-width: 768px) {
  #app {
    padding-top: 54px;
  }
}
</style>
