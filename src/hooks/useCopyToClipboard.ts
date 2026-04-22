/**
 * 复制到剪贴板 Hook
 * 提供统一的复制功能和状态管理
 * 支持 HTTPS、localhost 和 HTTP 环境
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useCopyToClipboard() {
  const { t } = useI18n()
  const isCopying = ref(false)

  /**
   * 复制文本到剪贴板（兼容所有环境）
   * @param text - 要复制的文本
   * @param successMessage - 自定义成功提示信息（可选）
   * @returns Promise<boolean> - 复制是否成功
   */
  const copyText = async (text: string, successMessage?: string): Promise<boolean> => {
    if (!text) {
      ElMessage.warning(t('common.nothingToCopy') || '没有可复制的内容')
      return false
    }

    isCopying.value = true
    try {
      // 方案 1：尝试使用现代 Clipboard API（HTTPS/localhost）
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // 方案 2：降级到传统方法（HTTP 环境）
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (!successful) {
          throw new Error('execCommand failed')
        }
      }

      ElMessage({
        message: successMessage || t('transferRental.copyAddress'),
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
