import type { App, Plugin } from 'vue'
import { createLazyPopupPlugin } from '../createLazyPopupPlugin'

declare module 'vue' {
  export interface ComponentCustomProperties {
    $loginPopup: { open: () => void | Promise<void>; close: () => void } | undefined
  }
}

const LoginPopupPlugin: Plugin = {
  install(app: App) {
    createLazyPopupPlugin({
      name: 'loginPopup',
      globalKey: '$loginPopup',
      loader: () => import('./index.vue'),
    }).install?.(app)
  },
}

export default LoginPopupPlugin
