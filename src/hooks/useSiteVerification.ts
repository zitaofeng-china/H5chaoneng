/**
 * Site 验证 Hook
 * 用于验证代理标识是否有效
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { siteApi, priceApi } from '@/api'
import { getSite, clearSite } from '@/utils/site'

export function useSiteVerification() {
  const router = useRouter()
  const isVerifying = ref(false)
  const isValid = ref(false)
  const siteInfo = ref<any>(null)
  const priceInfo = ref<any>(null)

  async function verifySite(): Promise<boolean> {
    const site = getSite()
    if (!site) {
      clearSite()
      await router.push('/404')
      return false
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
        isValid.value = true
        return true
      } else {
        clearSite()
        await router.push('/404')
        return false
      }
    } catch (error) {
      clearSite()
      await router.push('/404')
      return false
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
