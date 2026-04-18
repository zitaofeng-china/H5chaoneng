import { ref } from 'vue'
import { orderApi } from '@/api'
import { handleResponse } from '@/utils/response'
import { OrderKind } from '@/api/modules/order/types'
import { createLogger } from '@/utils/logger'

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
  const loading = ref(false)

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

      logger.debug('创建订单', orderParams)

      const response = await orderApi.createOrder(orderParams)

      const success = handleResponse(response, {
        context: options.context || 'order_create',
      })

      if (success) {
        logger.info('订单创建成功')
      }

      return success
    } catch (error) {
      logger.error('订单创建失败', error)
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
