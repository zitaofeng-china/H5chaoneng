import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useWindowSize } from '@vueuse/core'

export const useCommonStore = defineStore('common', () => {
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value <= 768)

  return {
    isMobile,
  }
})
