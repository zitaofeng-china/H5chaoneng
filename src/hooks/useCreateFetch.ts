import { createFetch } from '@vueuse/core'
import { getToken } from '@/utils/token'
import { getSite } from '@/utils/site'

export const useCreateFetch = createFetch({
  baseUrl: '',
  options: {
    async beforeFetch({ options }) {
      // 初始化 headers
      options.headers = options.headers || {}
      
      // 添加 Site（必需）
      const site = getSite()
      options.headers = {
        ...options.headers,
        Site: site,
      }
      
      // 添加 Content-Type（如果有 body）
      if (options.body) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }
      
      // 添加 Authorization（如果有 token）
      const token = getToken()
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: token,
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
    // mode: 'cors' 是默认值，不需要显式设置
    // credentials: 'omit' 是默认值，不需要显式设置
  },
})
