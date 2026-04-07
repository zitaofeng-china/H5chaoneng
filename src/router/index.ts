import { createRouter, createWebHistory } from 'vue-router'

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
