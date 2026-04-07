import { computed } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentLocale } from '@/lang'

export const useLangStore = defineStore('lang', () => {
  const currentLocale = computed(() => getCurrentLocale() || 'zh-CN')

  return {
    currentLocale,
  }
})
