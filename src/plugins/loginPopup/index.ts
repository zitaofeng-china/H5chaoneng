import { createVNode, render } from 'vue'
import type { App, Plugin } from 'vue'
import LoginPopupComponent from './index.vue'

declare module 'vue' {
  export interface ComponentCustomProperties {
    $loginPopup: { open: () => void; close: () => void } | undefined
  }
}

const LoginPopupPlugin: Plugin = {
  install(app: App) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(LoginPopupComponent)
    vnode.appContext = app._context
    render(vnode, container)

    const open = () => {
      vnode.component?.exposed?.open()
    }

    const close = () => {
      vnode.component?.exposed?.close()
    }

    app.config.globalProperties.$loginPopup = { open, close }
    app.provide('loginPopup', { open, close })
  },
}

export default LoginPopupPlugin
