import { createRouter, createWebHistory } from 'vue-router'
import { SHOW_WELFARE } from '@/constants/features'

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
    // 根路径占位：不在路由层立刻跳 404，由站点校验结束后再决定展示/跳转
    {
      path: '/',
      name: 'RootPending',
      component: { render: () => null },
    },
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
        SHOW_WELFARE
          ? {
              path: 'welfare',
              name: 'Welfare',
              component: () => import('@/pages/welfare/index.vue'),
            }
          : {
              path: 'welfare',
              name: 'Welfare',
              redirect: (to) => {
                const site = to.params.site
                const sitePath = Array.isArray(site) ? site[0] : site
                return sitePath ? `/${sitePath}/` : '/'
              },
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
        // 未知业务路径
        {
          path: ':pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/pages/404/index.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    // 首页营销区块是异步分包的，scrollBehavior 触发时锚点往往还不在 DOM。
    // hash 滚动改由首页在区块挂载后处理，这里不能 return Promise，
    // 否则会堵住启动阶段的 router.isReady()。
    if (to.hash) return false
    if (savedPosition) return savedPosition
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
