import { createVNode, render } from 'vue'
import type { App, Plugin } from 'vue'
import RevisePasswordPopupComponent from './index.vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $rechargePopup: { open: () => void; close: () => void }
  }
}

const RevisePasswordPopupPlugin: Plugin = {
  install(app: App) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(RevisePasswordPopupComponent)
    vnode.appContext = app._context
    render(vnode, container)

    const open = () => {
      vnode.component?.exposed?.open()
    }

    const close = () => {
      vnode.component?.exposed?.close()
    }

    app.config.globalProperties.$revisePasswordPopup = { open, close }
    app.provide('revisePasswordPopup', { open, close })
  },
}

export default RevisePasswordPopupPlugin
