/**
 * 复制到剪贴板 Hook
 * 提供统一的复制功能和状态管理
 */

import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useCopyToClipboard() {
  const { t } = useI18n()
  const { copy } = useClipboard()
  const isCopying = ref(false)

  /**
   * 复制文本到剪贴板
   * @param text - 要复制的文本
   * @returns Promise<boolean> - 复制是否成功
   */
  const copyText = async (text: string): Promise<boolean> => {
    if (!text) {
      ElMessage.warning(t('common.nothingToCopy') || '没有可复制的内容')
      return false
    }

    isCopying.value = true
    try {
      await copy(text)
      ElMessage({
        message: t('transferRental.copyAddress'),
        type: 'success',
        duration: 2500,
        showClose: false,
        customClass: 'copy-success-message',
        offset: 80,
      })
      return true
    } catch (error) {
      console.error('复制失败:', error)
      ElMessage({
        message: t('transferRental.copyFailed'),
        type: 'error',
        duration: 2500,
        showClose: false,
      })
      return false
    } finally {
      setTimeout(() => {
        isCopying.value = false
      }, 1000)
    }
  }

  return {
    isCopying,
    copyText,
  }
}
