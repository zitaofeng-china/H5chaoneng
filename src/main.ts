import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/styles/index.scss'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/svgIcon/index.vue'
import allPlugins from '@/plugins/index.ts'
import i18n, { initLocale } from '@/lang'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(allPlugins)

app.component('SvgIcon', SvgIcon)

// 初始化语言设置
initLocale()

app.mount('#app')
