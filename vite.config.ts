import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import { visualizer } from 'rollup-plugin-visualizer'
import { codeInspectorPlugin } from 'code-inspector-plugin'
// import viteCompression from 'vite-plugin-compression'

const DEV_BASE_COOKIE = 'energy_h5_public_base'

function normalizeBase(base: string): string {
  const normalized = base.replace(/^\/+|\/+$/g, '')
  return normalized ? `/${normalized}/` : '/'
}

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  const cookie = cookieHeader
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))

  if (!cookie) return undefined

  try {
    return decodeURIComponent(cookie.slice(name.length + 1))
  } catch {
    return undefined
  }
}

function isPathUnderBase(pathname: string, base: string): boolean {
  return base === '/' || pathname === base.slice(0, -1) || pathname.startsWith(base)
}

function devBaseMigrationPlugin(base: string): Plugin {
  return {
    name: 'dev-base-migration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
          next()
          return
        }

        const previousBase = getCookieValue(req.headers.cookie as string | undefined, DEV_BASE_COOKIE)
        if (!previousBase) {
          next()
          return
        }

        const normalizedPreviousBase = normalizeBase(previousBase)
        if (normalizedPreviousBase === base) {
          next()
          return
        }

        const requestUrl = new URL(req.url || '/', 'http://localhost')
        if (!isPathUnderBase(requestUrl.pathname, normalizedPreviousBase)) {
          next()
          return
        }

        const pathAfterPreviousBase =
          normalizedPreviousBase === '/'
            ? requestUrl.pathname
            : requestUrl.pathname.slice(normalizedPreviousBase.length - 1)
        const targetPath = `${base === '/' ? '' : base.slice(0, -1)}${pathAfterPreviousBase}`

        res.statusCode = 302
        res.setHeader('Location', `${targetPath}${requestUrl.search}${requestUrl.hash}`)
        res.end()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredBase = env.VITE_PUBLIC_BASE || '/'
  const base =
    configuredBase === '/'
      ? '/'
      : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`
  const isProduction = mode !== 'development'
  const shouldAnalyze = process.env.ANALYZE === 'true'

  const elementPlusResolver = ElementPlusResolver({
    importStyle: 'css',
  })

  return {
  base,
  plugins: [
    !isProduction && devBaseMigrationPlugin(base),
    vue(),
    vueJsx(),
    !isProduction && vueDevTools(),
    !isProduction &&
      codeInspectorPlugin({
        bundler: 'vite',
        hotKeys: ['altKey', 'shiftKey'],
        showSwitch: true,
        autoToggle: true,
        editor: 'code',
      }),
    AutoImport({
      // 不在 AutoImport 中解析 Element Plus，避免从桶入口引入 ElMessage 等
      // Message/MessageBox 统一走 @/utils/element 子路径
      resolvers: [IconsResolver({ prefix: 'Icon' })],
      dts: 'auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        elementPlusResolver,
        // 关键：自动注册图标组件，使用 'ep' 集合 (代表 element-plus)
        IconsResolver({ enabledCollections: ['ep'] }),
      ],
    }),
    Icons({
      autoInstall: true, // 自动安装图标库
      customCollections: {
        'svg-icon': FileSystemIconLoader('./src/assets/icons', (svg) =>
          // 自动清理 SVG 冗余属性（如 width/height），由插件统一控制
          svg.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
      },
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
      svgoOptions: true,
    }),
    ViteImageOptimizer({
      /* 常用配置 */
      test: /\.(jpe?g|png|gif|tiff|webp)$/i, // 移除 svg，不压缩 SVG
      exclude: undefined,
      include: undefined,
      includePublic: true, // 是否压缩 public 目录下的图片
      logStats: true, // 控制台显示压缩统计

      // 针对不同格式的压缩设置
      png: { quality: 80 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
      webp: { lossless: true, quality: 75 },
    }),
    (shouldAnalyze || isProduction) &&
      visualizer({
        open: false,
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
    // Gzip 压缩（生产环境启用）
    // viteCompression({
    //   verbose: true, // 是否在控制台输出压缩结果
    //   disable: false, // 生产环境启用
    //   threshold: 10240, // 体积大于 10KB 才进行压缩
    //   algorithm: 'gzip', // 压缩算法
    //   ext: '.gz', // 生成的压缩包后缀
    //   deleteOriginFile: false, // 不删除源文件
    // }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    cors: true, // 允许跨域
    hmr: {
      overlay: true, // 显示错误覆盖层
    },
    watch: {
      usePolling: true, // 使用轮询模式（适用于某些文件系统）
      interval: 100, // 轮询间隔
    },
    // 预热常用文件，减少首次访问延迟
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/App.vue',
        './src/router/index.ts',
        './src/stores/useUserStore.ts',
        './src/pages/home/index.vue',
      ],
    },
    proxy: {
      '/v3': {
        target: 'http://47.84.135.181:8888',
        changeOrigin: true,
        rewrite: (path) => path,
        timeout: 60000, // 增加超时时间到 60 秒
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Proxy Error]', err.message)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Proxy]', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[Proxy Response]', proxyRes.statusCode, req.url)
          })
        },
      },
      '/v2': {
        target: 'http://47.84.135.181:8888',
        changeOrigin: true,
        rewrite: (path) => path,
        timeout: 60000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Proxy Error v2]', err.message)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Proxy v2]', req.method, req.url)
          })
        },
      },
      '/v1': {
        target: 'http://47.84.135.181:8888',
        changeOrigin: true,
        rewrite: (path) => path,
        timeout: 60000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Proxy Error v1]', err.message)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Proxy v1]', req.method, req.url)
          })
        },
      },
    },
  },
  // 生产环境打包时移除 console 和 debugger
  esbuild: isProduction ? { drop: ['console', 'debugger'] } : {},
  build: {
    target: 'es2015', // 目标浏览器
    assetsInlineLimit: 4096, // 小资源内联，减少请求数
    chunkSizeWarningLimit: 1000, // 1. 提高警告阈值到 1000k（如果有些库压缩后确实很大，500k 的默认警告太严格了）
    sourcemap: false, // 生产环境不生成 sourcemap
    cssCodeSplit: true, // CSS 代码分割
    minify: 'esbuild', // 使用 esbuild 压缩（比 terser 快很多）
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('virtual:svg-icons-register')) {
            return 'svg-icons-placeholder'
          }

          if (id.includes('node_modules')) {
            // Vue 生态
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/') ||
              id.includes('/vue-i18n/') ||
              id.includes('\\vue\\') ||
              id.includes('\\vue-router\\') ||
              id.includes('\\pinia\\') ||
              id.includes('\\vue-i18n\\') ||
              id.includes('@vue/')
            ) {
              return 'vue-vendor'
            }

            // Element Plus：组件自然拆分；仅把 EP 内部工具层合并，避免把 lodash/dayjs 全塞进 ep-shared
            if (id.includes('element-plus')) {
              if (
                id.includes('/es/components/') ||
                id.includes('\\es\\components\\')
              ) {
                return undefined
              }
              // locale 按需：不要和 utils 绑死成超大 shared
              if (id.includes('/locale/') || id.includes('\\locale\\')) {
                return 'ep-locale'
              }
              return 'ep-shared'
            }

            // 常用 peer 各自/并入 vendor，避免放大 ep-shared
            if (id.includes('@element-plus/icons')) {
              return 'ep-icons'
            }

            return 'vendor'
          }
        },
        // 1. 用于从入口点创建的 chunk (如 index.js)
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 2. 用于从代码分割创建的 chunk (如 动态导入的组件)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // 3. 用于所有静态资源 (CSS, 图片, 字体等)
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          // 匹配 CSS 文件
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          // 匹配图片
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          // 匹配字体
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          // 匹配视频
          if (/\.(mp4|webm|ogg)$/i.test(name)) {
            return 'assets/media/[name]-[hash][extname]'
          }
          // 默认分类
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 注意：如果你使用的是 sass 1.8.0+ 版本，请使用 'additionalData'
        // 并确保路径指向你的全局变量文件
        additionalData: `@use "@/assets/styles/variables.scss" as *; @use "@/assets/styles/_mixins.scss" as *;`,
        // silenceDeprecations: ['import'],
      },
    },
  },
  }
})
