<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/index.vue'
import WelcomeDialog from '@/components/WelcomeDialog.vue'
import { useSiteVerification } from '@/hooks/useSiteVerification'
import { useUserStore } from '@/stores/useUserStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useBury } from '@/hooks/useBury'

const route = useRoute()
const { verifySite } = useSiteVerification()
const userStore = useUserStore()
const priceStore = usePriceStore()
const { track } = useBury()

const is404Page = computed(() => route.name === 'NotFound')

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
  // 埋点：统计设备数（只触发一次）
  track('运行过项目设备数', true)
  
  if (!is404Page.value) {
    const isValid = await verifySite()
    if (isValid) {
      userStore.init()
      await priceStore.fetchPrice()
      
      // 如果用户已登录，获取最新用户信息
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
    <Layout v-if="!is404Page" />
    <router-view v-else />
    
    <!-- 首次访问欢迎弹窗 -->
    <WelcomeDialog v-if="!is404Page" />
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
