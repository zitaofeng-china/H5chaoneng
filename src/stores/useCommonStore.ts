import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import { MOBILE_BREAKPOINT } from '@/constants/responsive'

export const useCommonStore = defineStore('common', () => {
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value <= MOBILE_BREAKPOINT)

  return {
    isMobile,
  }
})
