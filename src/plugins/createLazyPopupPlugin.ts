/**
 * 懒加载弹窗插件工厂
 * 首次 open 时再加载组件并挂载，降低首屏 JS
 */

import { createVNode, render, type App, type Component, type Plugin, type VNode } from 'vue'
import { registerPopup, type PopupControl, type PopupName } from './popupRegistry'

export function createLazyPopupPlugin(options: {
  name: PopupName
  globalKey: string
  loader: () => Promise<{ default: Component }>
}): Plugin {
  const { name, globalKey, loader } = options

  return {
    install(app: App) {
      let vnode: VNode | null = null
      let container: HTMLElement | null = null
      let loading: Promise<void> | null = null

      const ensureMounted = async () => {
        if (vnode?.component) return
        if (!loading) {
          loading = (async () => {
            const mod = await loader()
            container = document.createElement('div')
            document.body.appendChild(container)
            vnode = createVNode(mod.default)
            vnode.appContext = app._context
            render(vnode, container)
          })().finally(() => {
            loading = null
          })
        }
        await loading
      }

      const control: PopupControl = {
        open: async () => {
          await ensureMounted()
          const exposed = vnode?.component?.exposed as { open?: () => void } | undefined
          exposed?.open?.()
        },
        close: () => {
          const exposed = vnode?.component?.exposed as { close?: () => void } | undefined
          exposed?.close?.()
        },
      }

      ;(app.config.globalProperties as Record<string, PopupControl>)[globalKey] = control
      app.provide(name, control)
      registerPopup(name, control)
    },
  }
}
