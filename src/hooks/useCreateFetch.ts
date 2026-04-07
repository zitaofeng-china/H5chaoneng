import { createFetch } from '@vueuse/core'

export const useCreateFetch = createFetch({
  baseUrl: '',
  options: {
    async beforeFetch({ options }) {
      const token = localStorage.getItem('token')
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }
      return { options }
    },
    afterFetch(ctx) {
      if (ctx.data.code === 401) {
        console.error('登录过期')
      }
      return ctx
    },
    onFetchError(ctx) {
      if (ctx.data && ctx.data.message) {
        ctx.error = new Error(ctx.data.message)
      }
      return ctx
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})
