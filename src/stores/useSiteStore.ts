/**
 * Site Store
 * 管理站点信息
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { siteApi } from '@/api'
import type { SiteInfo } from '@/api/modules/site/types'

export const useSiteStore = defineStore('site', () => {
  // 站点信息
  const siteInfo = ref<SiteInfo | null>(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)

  // Telegram 客服账号
  const tgAdmin = computed(() => {
    return siteInfo.value?.tg_admin || ''
  })

  // Telegram 机器人名字
  const botName = computed(() => {
    return siteInfo.value?.bot_name || ''
  })

  // 站点名称
  const siteName = computed(() => {
    return siteInfo.value?.name || ''
  })

  // 站点描述
  const siteDescribe = computed(() => {
    return siteInfo.value?.describe || ''
  })

  // 福利价格
  const wealPrice = computed(() => {
    return siteInfo.value?.weal_price || '0'
  })

  /**
   * 获取站点信息
   */
  const fetchSiteInfo = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      const response = await siteApi.getSiteInfo()
      if (response.code === '000000' && response.data) {
        siteInfo.value = response.data
        isLoaded.value = true
        console.log('[Site Store] 站点信息加载成功:', response.data)
      }
    } catch (error) {
      console.error('[Site Store] 获取站点信息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新站点信息
   */
  const updateSiteInfo = (info: SiteInfo) => {
    siteInfo.value = info
    isLoaded.value = true
  }

  /**
   * 清除站点信息
   */
  const clearSiteInfo = () => {
    siteInfo.value = null
    isLoaded.value = false
  }

  return {
    siteInfo,
    isLoading,
    isLoaded,
    tgAdmin,
    botName,
    siteName,
    siteDescribe,
    wealPrice,
    fetchSiteInfo,
    updateSiteInfo,
    clearSiteInfo,
  }
})
