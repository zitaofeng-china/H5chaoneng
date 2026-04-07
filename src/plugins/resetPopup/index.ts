import { createVNode, render } from 'vue'
import type { App, Plugin } from 'vue'
import ResetPopupComponent from './index.vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $resetPopup: { open: () => void; close: () => void }
  }
}

const ResetPopupPlugin: Plugin = {
  install(app: App) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(ResetPopupComponent)
    vnode.appContext = app._context
    render(vnode, container)

    const open = () => {
      vnode.component?.exposed?.open()
    }

    const close = () => {
      vnode.component?.exposed?.close()
    }

    app.config.globalProperties.$resetPopup = { open, close }
    app.provide('resetPopup', { open, close })
  },
}

export default ResetPopupPlugin
