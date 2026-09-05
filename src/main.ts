import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

// Element Plus：组件样式由 unplugin-vue-components 按需注入；
// API 式组件（Message / MessageBox）需在入口手动引入样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

import './assets/styles/index.scss'
import './assets/styles/address-dropdown.scss'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/svgIcon/index.vue'
import allPlugins from '@/plugins/index.ts'
import i18n, { initLocale } from '@/lang'
import { ensureSiteVerified } from '@/utils/siteBootstrap'

if (import.meta.env.DEV) {
  document.cookie = `energy_h5_public_base=${encodeURIComponent(import.meta.env.BASE_URL)}; Path=/; SameSite=Lax`
}

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  // 挂载前调用 store 需要 active pinia
  setActivePinia(pinia)

  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(allPlugins)

  app.component('SvgIcon', SvgIcon)

  // 初始化语言设置（可能异步加载非默认语言包）
  await initLocale()

  // 等路由解析当前 URL 完成
  await router.isReady()

  // 挂载前完成站点校验：通过才允许业务页，失败已 replace 到 /404
  // 期间 index.html 静态等待页仍可见，Vue 尚未 mount，不会闪业务页
  await ensureSiteVerified(router)

  // 校验结束后再挂载：首帧即为最终态（业务页或 404），无中间闪屏
  app.mount('#app')
}

bootstrap()
