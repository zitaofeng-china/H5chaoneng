import { createRouter, createWebHistory } from 'vue-router'
import { DEFAULT_SITE } from '@/utils/site'

// 路由名称到页面标题的映射
const routeTitleMap: Record<string, string> = {
  Home: '首页',
  Welfare: '福利订单',
  TimeRentPage: '按时间租用',
  CountRentPage: '按笔数租用',
  Contract: '合约闪兑',
  Hosting: '智能托管',
  Activation: '批量激活',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 根路径跳转到 Telegram 机器人
    {
      path: '/',
      beforeEnter() {
        window.location.href = 'https://t.me/g711bot'
      },
      component: () => import('@/pages/home/index.vue'), // 占位，不会实际渲染
    },
    // 独立的 404 路由（不带 site 前缀）
    {
      path: '/404',
      name: 'NotFoundStandalone',
      component: () => import('@/pages/404/index.vue'),
    },
    {
      path: '/:site',
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/pages/home/index.vue'),
        },
        {
          path: 'welfare',
          name: 'Welfare',
          component: () => import('@/pages/welfare/index.vue'),
        },
        {
          path: 'lease-time',
          name: 'TimeRentPage',
          component: () => import('@/pages/lease/time/index.vue'),
        },
        {
          path: 'lease-count',
          name: 'CountRentPage',
          component: () => import('@/pages/lease/count/index.vue'),
        },
        {
          path: 'contract',
          name: 'Contract',
          component: () => import('@/pages/contract/index.vue'),
        },
        {
          path: 'hosting',
          name: 'Hosting',
          component: () => import('@/pages/hosting/index.vue'),
        },
        {
          path: 'activation',
          name: 'Activation',
          component: () => import('@/pages/activation/index.vue'),
        },
        // 在 site 路由组内的 404
        {
          path: ':pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/pages/404/index.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to) {
    const { hash } = to
    if (hash) {
      return {
        el: hash,
        top: ['#energy', '#feature'].includes(hash) ? 100 : 0,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },
})

export default router

// 路由埋点：统计页面访问
router.afterEach((to) => {
  if (import.meta.env.DEV) return
  const title = routeTitleMap[to.name as string]
  if (title) {
    ;(window as any)?.umami?.track('埋点', { [`进入${title}页面`]: `进入${title}页面` })
  }
})
