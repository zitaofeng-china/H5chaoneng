/**
 * 弹窗插件：同步注册懒加载壳（壳本身很轻），组件在首次 open 时再加载
 */
import { type App, type Plugin } from 'vue'

const modules = import.meta.glob<Record<string, Plugin | ((app: App) => void)>>('./**/index.ts', {
  eager: true,
})

const instancePlugins: Plugin = {
  install(app: App) {
    Object.keys(modules).forEach((path) => {
      if (path.includes('plugins/index.ts')) return
      const module = modules[path]
      const plugin = module?.default
      if (plugin) {
        app.use(plugin)
        if (import.meta.env.DEV) {
          console.log(`[Plugin System] Registered lazy shell: ${path}`)
        }
      }
    })
  },
}

export default instancePlugins
