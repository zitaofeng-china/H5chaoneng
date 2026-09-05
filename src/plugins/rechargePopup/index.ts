import type { App, Plugin } from 'vue'
import { createLazyPopupPlugin } from '../createLazyPopupPlugin'

declare module 'vue' {
  interface ComponentCustomProperties {
    $rechargePopup: { open: () => void | Promise<void>; close: () => void }
  }
}

const RechargePopupPlugin: Plugin = {
  install(app: App) {
    createLazyPopupPlugin({
      name: 'rechargePopup',
      globalKey: '$rechargePopup',
      loader: () => import('./index.vue'),
    }).install?.(app)
  },
}

export default RechargePopupPlugin
