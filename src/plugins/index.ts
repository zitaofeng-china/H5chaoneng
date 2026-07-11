import { type App, type Plugin } from 'vue'

const modules = import.meta.glob<Record<string, Plugin | ((app: App) => void)>>('./**/index.ts')

const instancePlugins: Plugin = {
  async install(app: App) {
    const entries = Object.entries(modules).filter(([path]) => !path.includes('plugins/index.ts'))

    await Promise.all(
      entries.map(async ([path, loader]) => {
        const module = await loader()
        const plugin = module?.default
        if (plugin) {
          app.use(plugin)
          if (import.meta.env.DEV) {
            console.log(`[Plugin System] Loaded: ${path}`)
          }
        }
      }),
    )
  },
}

export default instancePlugins
