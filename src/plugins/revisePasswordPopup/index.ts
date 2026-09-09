import type { App, Plugin } from 'vue'
import { createLazyPopupPlugin } from '../createLazyPopupPlugin'

declare module 'vue' {
  interface ComponentCustomProperties {
    $revisePasswordPopup: { open: () => void | Promise<void>; close: () => void }
  }
}

const RevisePasswordPopupPlugin: Plugin = {
  install(app: App) {
    createLazyPopupPlugin({
      name: 'revisePasswordPopup',
      globalKey: '$revisePasswordPopup',
      loader: () => import('./index.vue'),
    }).install?.(app)
  },
}

export default RevisePasswordPopupPlugin
