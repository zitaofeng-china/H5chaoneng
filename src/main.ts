import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Element Plus 样式
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/el-message.css'

import './assets/styles/index.scss'
import './assets/styles/address-dropdown.scss'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/svgIcon/index.vue'
import allPlugins from '@/plugins/index.ts'
import i18n, { initLocale } from '@/lang'

const app = createApp(App)

// 暴露 app 实例到 window，供拦截器使用
;(window as any).__VUE_APP__ = app

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(allPlugins)

app.component('SvgIcon', SvgIcon)

// 初始化语言设置
initLocale()

app.mount('#app')
