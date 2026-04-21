import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { orderApi } from '@/api'
import { handleResponse } from '@/utils/response'
import { OrderKind } from '@/api/modules/order/types'
import { createLogger } from '@/utils/logger'
import { useUserStore } from '@/stores/useUserStore'

const logger = createLogger('OrderCreation')

interface CreateOrderOptions {
  count?: number
  duration?: number | string
  kind: OrderKind
  target: string[]
  userId: number
  context?: string
}

export function useOrderCreation() {
  const { t } = useI18n()
  const loading = ref(false)
  const userStore = useUserStore()

  const createOrder = async (options: CreateOrderOptions): Promise<boolean> => {
    loading.value = true

    try {
      const orderParams = {
        count: options.count,
        duration: options.duration,
        kind: options.kind,
        target: options.target,
        user_id: options.userId,
      }

      logger.debug('创建订单参数', orderParams)
      console.log('【订单创建】发送参数:', JSON.stringify(orderParams, null, 2))

      const response = await orderApi.createOrder(orderParams)

      console.log('【订单创建】后端响应:', JSON.stringify(response, null, 2))

      const success = handleResponse(response, {
        context: options.context || 'order_create',
      })

      if (success) {
        logger.info('订单创建成功')
        
        // 订单创建成功后，刷新用户信息以更新余额
        if (userStore.isLogin) {
          logger.debug('刷新用户信息以更新余额')
          await userStore.fetchUserInfo()
        }
      }

      return success
    } catch (error: any) {
      logger.error('订单创建失败', error)
      console.error('【订单创建】错误:', error)
      
      // 未登录错误已在拦截器中处理，这里不需要再次提示
      
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    createOrder,
  }
}
