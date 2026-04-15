/**
 * 倒计时 Hook
 * 用于验证码发送等场景的倒计时功能
 */

import { ref, onUnmounted } from 'vue'

export function useCountdown(initialSeconds = 60) {
  const countdown = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  /**
   * 开始倒计时
   * @param seconds - 倒计时秒数，默认使用初始值
   */
  const start = (seconds = initialSeconds) => {
    // 如果已在倒计时中，不重复启动
    if (countdown.value > 0) {
      return
    }
    
    countdown.value = seconds
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        stop()
      }
    }, 1000)
  }

  /**
   * 停止倒计时
   */
  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    countdown.value = 0
  }

  /**
   * 重置倒计时（停止并清零）
   */
  const reset = () => {
    stop()
  }

  /**
   * 是否正在倒计时
   */
  const isRunning = () => countdown.value > 0

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stop()
  })

  return {
    countdown,
    start,
    stop,
    reset,
    isRunning,
  }
}
