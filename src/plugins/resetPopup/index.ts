import type { App, Plugin } from 'vue'
import { createLazyPopupPlugin } from '../createLazyPopupPlugin'

declare module 'vue' {
  interface ComponentCustomProperties {
    $resetPopup: { open: () => void | Promise<void>; close: () => void }
  }
}

const ResetPopupPlugin: Plugin = {
  install(app: App) {
    createLazyPopupPlugin({
      name: 'resetPopup',
      globalKey: '$resetPopup',
      loader: () => import('./index.vue'),
    }).install?.(app)
  },
}

export default ResetPopupPlugin
