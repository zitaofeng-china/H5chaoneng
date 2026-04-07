import { type App, type Plugin } from 'vue'

const modules = import.meta.glob<Record<string, Plugin | ((app: App) => void)>>('./**/index.ts', {
  eager: true,
})

const instancePlugins: Plugin = {
  install(app: App) {
    Object.keys(modules).forEach((path) => {
      const module = modules[path]
      const plugin = module?.default

      if (path.includes('plugins/index.ts')) return

      if (plugin) {
        app.use(plugin)
        console.log(`[Plugin System] Loaded: ${path}`)
      }
    })
  },
}

export default instancePlugins
