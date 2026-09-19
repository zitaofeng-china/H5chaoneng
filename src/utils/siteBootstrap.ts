/**
 * 站点启动门禁（模块级单例）
 * 在 app.mount 之前完成校验，避免首屏闪出业务页。
 */

import type { Router } from 'vue-router'
import { siteApi, priceApi } from '@/api'
import { getSite } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'
import { usePriceStore } from '@/stores/usePriceStore'

export type SiteBootstrapState = {
  /** 校验是否已结束 */
  finished: boolean
  /** 站点是否存在 */
  valid: boolean
}

/** 全局门禁状态（非响应式，供 main 与 App 同步读取初始值） */
export const siteBootstrap: SiteBootstrapState = {
  finished: false,
  valid: false,
}

let verifyPromise: Promise<boolean> | null = null

async function navigate404(router: Router): Promise<void> {
  if (router.currentRoute.value.path !== '/404') {
    await router.replace({ path: '/404' })
  }
}

/**
 * 执行站点校验（全局只跑一次）
 * - 存在 → true
 * - 不存在 / 无站点码 / 异常 → 跳转 /404，false
 */
export function ensureSiteVerified(router: Router): Promise<boolean> {
  if (verifyPromise) {
    return verifyPromise
  }

  verifyPromise = (async () => {
    siteBootstrap.finished = false
    siteBootstrap.valid = false

    const site = getSite()
    if (!site) {
      await navigate404(router)
      siteBootstrap.valid = false
      siteBootstrap.finished = true
      return false
    }

    try {
      const [siteResponse, priceResponse] = await Promise.all([
        siteApi.getSiteInfo(),
        priceApi.getPrice(),
      ])

      if (siteResponse.code === '000000') {
        const siteStore = useSiteStore()
        const priceStore = usePriceStore()

        if (siteResponse.data) {
          siteStore.updateSiteInfo(siteResponse.data)
        }
        if (priceResponse.code === '000000' && priceResponse.data) {
          priceStore.setPrice(priceResponse.data)
        }

        siteBootstrap.valid = true
        siteBootstrap.finished = true
        return true
      }

      console.warn('[Site验证] 站点不存在或校验失败', {
        site,
        code: siteResponse.code,
        msg: siteResponse.msg,
      })
      await navigate404(router)
      siteBootstrap.valid = false
      siteBootstrap.finished = true
      return false
    } catch (error) {
      console.error('[Site验证] 验证出错:', error)
      await navigate404(router)
      siteBootstrap.valid = false
      siteBootstrap.finished = true
      return false
    }
  })()

  return verifyPromise
}
