import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import zhTW from './zh-TW.json'
import en from './en.json'
import ja from './ja.json'
import ko from './ko.json'
import ru from './ru.json'
import ar from './ar.json'
import es from './es.json'
import tr from './tr.json'

type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ru' | 'ar' | 'es' | 'tr'

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en,
  ja: ja,
  ko: ko,
  ru: ru,
  ar: ar,
  es: es,
  tr: tr,
} as const

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages,
  globalInjection: true,
})

export default i18n

// 导出切换语言的方法
export const setLocale = (locale: Locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

// 获取当前语言
export const getCurrentLocale = (): Locale => {
  return i18n.global.locale.value as Locale
}

// 初始化语言设置
export const initLocale = () => {
  const savedLocale = localStorage.getItem('locale') as Locale
  if (savedLocale && messages[savedLocale]) {
    i18n.global.locale.value = savedLocale
  }
}
