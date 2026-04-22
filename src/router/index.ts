import { createRouter, createWebHistory } from 'vue-router'

const DEFAULT_SITE = 'c8UKwuXu'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 根路径重定向到默认 Site
    {
      path: '/',
      redirect: `/${DEFAULT_SITE}`,
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
