/// <reference types="vite/client" />

/**
 * 环境变量类型声明
 */
interface ImportMetaEnv {
  // 基础配置
  readonly VITE_API_BASE_URL: string // API 基础 URL
  readonly VITE_PORT: string // 应用端口
  readonly VITE_OPEN: string // 是否自动打开浏览器

  // 功能开关
  readonly VITE_USE_MOCK: string // 是否使用 Mock 数据
  readonly VITE_ENABLE_REQUEST_LOG: string // 是否开启请求日志
  readonly VITE_ENABLE_RESPONSE_LOG: string // 是否开启响应日志
  readonly VITE_ENABLE_ERROR_REPORT: string // 是否开启错误上报
  readonly VITE_ENABLE_PERFORMANCE: string // 是否开启性能监控
  readonly VITE_SHOW_DEBUG: string // 是否显示调试信息

  // 高级配置
  readonly VITE_ERROR_REPORT_URL: string // 错误上报地址
  readonly VITE_PERFORMANCE_URL: string // 性能监控地址
  readonly VITE_HTTPS: string // 是否开启 HTTPS
  readonly VITE_USE_CDN: string // 是否使用 CDN
  readonly VITE_CDN_URL: string // CDN 地址
  readonly VITE_USE_GZIP: string // 是否开启 Gzip 压缩
  readonly VITE_SOURCEMAP: string // 是否生成 sourcemap
  readonly VITE_HMR: string // 是否开启热更新
  readonly VITE_TEST_MODE: string // 是否为测试模式
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
