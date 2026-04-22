import { createVNode, render } from 'vue'
import type { App, Plugin } from 'vue'
import UserInfoPopupComponent from './index.vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $userInfoPopup: { open: () => void; close: () => void }
  }
}

const UserInfoPopupPlugin: Plugin = {
  install(app: App) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(UserInfoPopupComponent)
    vnode.appContext = app._context
    render(vnode, container)

    const open = () => {
      vnode.component?.exposed?.open()
    }

    const close = () => {
      vnode.component?.exposed?.close()
    }

    app.config.globalProperties.$userInfoPopup = { open, close }
    app.provide('userInfoPopup', { open, close })
  },
}

export default UserInfoPopupPlugin
