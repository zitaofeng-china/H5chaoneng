import { createFetch } from '@vueuse/core'
import { getToken } from '@/utils/token'

export const useCreateFetch = createFetch({
  baseUrl: '',
  options: {
    async beforeFetch({ options }) {
      const token = getToken()
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: token, // 注意：后端不需要 Bearer 前缀
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
