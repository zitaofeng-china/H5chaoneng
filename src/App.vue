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
import { getTelegramInitData, getTelegramUser, isTelegramMiniApp } from '@/utils/telegram'

const route = useRoute()
const { verifySite } = useSiteVerification()
const userStore = useUserStore()
const priceStore = usePriceStore()
const { track } = useBury()
const { isInTelegram, initTelegram } = useTelegramLogin()

const is404Page = computed(() => route.name === 'NotFound')

// ===== 临时调试：显示 Telegram 数据 =====
const showTgDebug = ref(false)
const tgDebugData = ref('')

function initTgDebug() {
  if (isTelegramMiniApp()) {
    const initData = getTelegramInitData()
    const user = getTelegramUser()
    tgDebugData.value = JSON.stringify({ initData, user }, null, 2)
    showTgDebug.value = true
  }
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
  // 临时调试：初始化 TG 数据显示
  initTgDebug()
  
  // 埋点：统计设备数（只触发一次）
  track('运行过项目设备数', true)
  
  if (!is404Page.value) {
    const isValid = await verifySite()
    if (isValid) {
      userStore.init()
      await priceStore.fetchPrice()
      
      // Telegram Mini App 自动登录
      await initTelegram(getSite())
      
      // 如果用户已登录（包括 Telegram 自动登录），获取最新用户信息
      if (userStore.isLogin) {
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
    <!-- 临时调试面板：显示 Telegram 数据 -->
    <div v-if="showTgDebug" style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#000;color:#0f0;padding:10px;font-size:12px;max-height:40vh;overflow:auto;white-space:pre-wrap;word-break:break-all;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <strong>🔧 TG Debug</strong>
        <span style="cursor:pointer;color:red;" @click="showTgDebug=false">✕ 关闭</span>
      </div>
      {{ tgDebugData }}
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
