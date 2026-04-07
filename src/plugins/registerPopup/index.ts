import { createVNode, render } from 'vue'
import type { App, Plugin } from 'vue'
import RegisterPopupComponent from './index.vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $registerPopup: { open: () => void; close: () => void }
  }
}

const RegisterPopupPlugin: Plugin = {
  install(app: App) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(RegisterPopupComponent)
    vnode.appContext = app._context
    render(vnode, container)

    const open = () => {
      vnode.component?.exposed?.open()
    }

    const close = () => {
      vnode.component?.exposed?.close()
    }

    app.config.globalProperties.$registerPopup = { open, close }
    app.provide('registerPopup', { open, close })
  },
}

export default RegisterPopupPlugin
