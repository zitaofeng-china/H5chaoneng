import type { App, Plugin } from 'vue'
import { createLazyPopupPlugin } from '../createLazyPopupPlugin'

declare module 'vue' {
  interface ComponentCustomProperties {
    $userInfoPopup: { open: () => void | Promise<void>; close: () => void }
  }
}

const UserInfoPopupPlugin: Plugin = {
  install(app: App) {
    createLazyPopupPlugin({
      name: 'userInfoPopup',
      globalKey: '$userInfoPopup',
      loader: () => import('./index.vue'),
    }).install?.(app)
  },
}

export default UserInfoPopupPlugin
