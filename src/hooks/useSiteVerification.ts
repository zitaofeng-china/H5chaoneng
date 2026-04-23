/**
 * Site 验证 Hook
 * 用于验证代理标识是否有效
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { siteApi, priceApi } from '@/api'
import { getSite, clearSite, DEFAULT_SITE } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useSiteVerification() {
  const router = useRouter()
  const siteStore = useSiteStore()
  const { t } = useI18n()
  
  const isVerifying = ref(false)
  const isValid = ref(false)
  const siteInfo = ref<any>(null)
  const priceInfo = ref<any>(null)

  async function verifySite(): Promise<boolean> {
    let site = getSite()
    
    // 如果没有 Site，使用默认 Site 并重定向
    if (!site) {
      site = DEFAULT_SITE
      await router.replace(`/${DEFAULT_SITE}${router.currentRoute.value.path}`)
    }

    isVerifying.value = true

    try {
      const [siteResponse, priceResponse] = await Promise.all([
        siteApi.getSiteInfo(),
        priceApi.getPrice(),
      ])

      if (siteResponse.code === '000000' && priceResponse.code === '000000') {
        siteInfo.value = siteResponse.data
        priceInfo.value = priceResponse.data
        
        // 同时更新到 Site Store，供其他组件使用
        siteStore.updateSiteInfo(siteResponse.data)
        
        isValid.value = true
        return true
      } else {
        // 检查是否是"网站不存在"错误
        if (siteResponse.code === '000007' && siteResponse.msg === '网站不存在') {
          // 显示国际化的错误消息
          ElMessage.error(t('error.siteNotExist'))
        }
        
        // 验证失败，如果当前不是默认 Site，则使用默认 Site 重试
        if (site !== DEFAULT_SITE) {
          console.log('[Site验证] 当前 Site 验证失败，使用默认 Site:', DEFAULT_SITE)
          await router.replace(`/${DEFAULT_SITE}${router.currentRoute.value.path.replace(`/${site}`, '')}`)
          return false
        }
        
        // 如果是默认 Site 验证失败，也继续使用默认 Site（不跳转 404）
        console.warn('[Site验证] 默认 Site 验证失败，但继续使用默认 Site')
        isValid.value = true // 标记为有效，允许继续
        return true
      }
    } catch (error) {
      console.error('[Site验证] 验证出错:', error)
      
      // 验证出错，如果当前不是默认 Site，则使用默认 Site 重试
      const currentSite = getSite()
      if (currentSite !== DEFAULT_SITE) {
        console.log('[Site验证] 验证出错，使用默认 Site:', DEFAULT_SITE)
        await router.replace(`/${DEFAULT_SITE}${router.currentRoute.value.path.replace(`/${currentSite}`, '')}`)
        return false
      }
      
      // 如果是默认 Site 出错，也继续使用默认 Site（不跳转 404）
      console.warn('[Site验证] 默认 Site 验证出错，但继续使用默认 Site')
      isValid.value = true // 标记为有效，允许继续
      return true
    } finally {
      isVerifying.value = false
    }
  }

  return {
    isVerifying,
    isValid,
    siteInfo,
    priceInfo,
    verifySite,
  }
}
