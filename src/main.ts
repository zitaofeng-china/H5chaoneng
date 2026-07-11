import { createApp } from 'vue'
import { createPinia } from 'pinia'

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

async function bootstrap() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.use(allPlugins)

  app.component('SvgIcon', SvgIcon)

  // 初始化语言设置（可能异步加载非默认语言包）
  await initLocale()

  app.mount('#app')
}

bootstrap()
