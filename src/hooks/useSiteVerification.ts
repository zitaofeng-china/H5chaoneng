/**
 * Site 验证 Hook
 * 状态来自模块级门禁 siteBootstrap（main 挂载前已完成校验）。
 */

import { computed, ref } from 'vue'
import { siteBootstrap } from '@/utils/siteBootstrap'

export function useSiteVerification() {
  // 挂载前已校验完毕时，初始即为最终态，避免首屏再走一遍等待
  const isVerifying = ref(!siteBootstrap.finished)
  const isFinished = ref(siteBootstrap.finished)
  const isValid = ref(siteBootstrap.valid)

  /** 同步模块态到响应式（main 完成后调用一次即可） */
  function syncFromBootstrap() {
    isVerifying.value = !siteBootstrap.finished
    isFinished.value = siteBootstrap.finished
    isValid.value = siteBootstrap.valid
  }

  return {
    isVerifying,
    isFinished,
    isValid: computed(() => isValid.value),
    isValidRef: isValid,
    syncFromBootstrap,
  }
}
