import type { App, Plugin } from 'vue'
import { createLazyPopupPlugin } from '../createLazyPopupPlugin'

declare module 'vue' {
  interface ComponentCustomProperties {
    $registerPopup: { open: () => void | Promise<void>; close: () => void }
  }
}

const RegisterPopupPlugin: Plugin = {
  install(app: App) {
    createLazyPopupPlugin({
      name: 'registerPopup',
      globalKey: '$registerPopup',
      loader: () => import('./index.vue'),
    }).install?.(app)
  },
}

export default RegisterPopupPlugin
