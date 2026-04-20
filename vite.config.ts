import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import { defineConfig } from 'vite'
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
// import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const shouldAnalyze = process.env.ANALYZE === 'true'

  return {
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver(), IconsResolver({ prefix: 'Icon' })],
      dts: 'auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
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
    visualizer({ 
      open: false, 
      filename: 'stats.html', 
      gzipSize: true, 
      brotliSize: true,
      // 只在需要分析时生成，加快构建速度
      template: 'treemap', // 使用更快的模板
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
  ],
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
        // 配置代理请求头
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 确保代理请求带上所有必要的请求头
            console.log('[Proxy]', req.method, req.url)
          })
        },
      },
      '/v2': {
        target: 'http://47.84.135.181:8888',
        changeOrigin: true,
        rewrite: (path) => path,
        // 配置代理请求头
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 确保代理请求带上所有必要的请求头
            console.log('[Proxy v2]', req.method, req.url)
          })
        },
      },
      '/v1': {
        target: 'http://47.84.135.181:8888',
        changeOrigin: true,
        rewrite: (path) => path,
        // 配置代理请求头
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 确保代理请求带上所有必要的请求头
            console.log('[Proxy v1]', req.method, req.url)
          })
        },
      },
    },
  },
  build: {
    target: 'es2015', // 目标浏览器
    assetsInlineLimit: 0, // 调到 4kb
    chunkSizeWarningLimit: 1000, // 1. 提高警告阈值到 1000k（如果有些库压缩后确实很大，500k 的默认警告太严格了）
    sourcemap: false, // 生产环境不生成 sourcemap
    cssCodeSplit: true, // CSS 代码分割
    minify: 'esbuild', // 使用 esbuild 压缩（比 terser 快很多）
    // terserOptions 在使用 esbuild 时不需要
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的模块打包到 vendor 文件夹
          // 将所有来自 assets 目录的 svg 提取到一个独立的 chunk 中
          // 插件内部生成的虚拟模块通常包含 'virtual:svg-icons'
          if (id.includes('virtual:svg-icons-register')) {
            return 'svg-icons-placeholder'
          }

          if (id.includes('node_modules')) {
            // return id.toString().split('node_modules/')[1].split('/')[0].toString()

            // 将超大库独立拆包
            if (id.includes('element-plus')) return 'element'
            if (id.includes('lodash')) return 'lodash'

            // pnpm 路径通常包含 .pnpm，这里统一提取包名
            const name = id.toString().split('node_modules/')[1].split('/')[0].toString()
            if (name.includes('.pnpm')) {
              return name.split('+')[1] || 'vendor' // 提取 pnpm 具体的包名
            }
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
