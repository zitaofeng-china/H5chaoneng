import { createVNode, render } from 'vue'
import type { App, Plugin } from 'vue'
import RechargePopupComponent from './index.vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $rechargePopup: { open: () => void; close: () => void }
  }
}

const RechargePopupPlugin: Plugin = {
  install(app: App) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(RechargePopupComponent)
    vnode.appContext = app._context
    render(vnode, container)

    const open = () => {
      vnode.component?.exposed?.open()
    }

    const close = () => {
      vnode.component?.exposed?.close()
    }

    app.config.globalProperties.$rechargePopup = { open, close }
    app.provide('rechargePopup', { open, close })
  },
}

export default RechargePopupPlugin
