import { createRouter, createWebHistory } from 'vue-router'
import { saveAgentCode, hasValidAgentCode } from '@/utils/invite'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/home/index.vue'),
    },
    {
      path: '/lease',
      name: 'LeasePage',
      children: [
        {
          path: 'time',
          name: 'TimeRentPage',
          component: () => import('@/pages/lease/time/index.vue'),
        },
        {
          path: 'count',
          name: 'CountRentPage',
          component: () => import('@/pages/lease/count/index.vue'),
        },
      ],
    },
    {
      path: '/contract',
      name: 'Contract',
      component: () => import('@/pages/contract/index.vue'),
    },
    {
      path: '/hosting',
      name: 'Hosting',
      component: () => import('@/pages/hosting/index.vue'),
    },
    {
      path: '/activation',
      name: 'Activation',
      component: () => import('@/pages/activation/index.vue'),
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/pages/404/index.vue'),
    },
    {
      path: '/:agentCode',
      name: 'AgentEntry',
      component: () => import('@/pages/home/index.vue'),
      beforeEnter: (to) => {
        const agentCode = to.params.agentCode as string

        // 保存代理标识
        saveAgentCode(agentCode)

        // 重定向到首页
        return { name: 'Home' }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
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

// 全局路由守卫：检查是否有代理标识
router.beforeEach((to) => {
  // 404页面和代理入口页面不需要检查
  if (to.name === 'NotFound' || to.name === 'AgentEntry') {
    return true
  }

  // 检查是否有有效的代理标识
  if (!hasValidAgentCode()) {
    return { name: 'NotFound' }
  }

  return true
})

export default router
