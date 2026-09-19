import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import en from './en.json'

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ru' | 'ar' | 'es' | 'tr'

const SUPPORT_LOCALES = new Set<Locale>(['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ru', 'ar', 'es', 'tr'])

// 默认同步打包中文 + 英文回退，其余语言按需加载
const messages = {
  'zh-CN': zhCN,
  en: en,
}

type LocaleMessages = Record<string, unknown>

const localeLoaders: Record<Exclude<Locale, 'zh-CN' | 'en'>, () => Promise<{ default: LocaleMessages }>> = {
  'zh-TW': () => import('./zh-TW.json') as Promise<{ default: LocaleMessages }>,
  ja: () => import('./ja.json') as Promise<{ default: LocaleMessages }>,
  ko: () => import('./ko.json') as Promise<{ default: LocaleMessages }>,
  ru: () => import('./ru.json') as Promise<{ default: LocaleMessages }>,
  ar: () => import('./ar.json') as Promise<{ default: LocaleMessages }>,
  es: () => import('./es.json') as Promise<{ default: LocaleMessages }>,
  tr: () => import('./tr.json') as Promise<{ default: LocaleMessages }>,
}

const loadedLocales = new Set<Locale>(['zh-CN', 'en'])

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN' as Locale,
  fallbackLocale: 'en' as Locale,
  messages,
  globalInjection: true,
})

async function loadLocaleMessages(locale: Locale) {
  if (loadedLocales.has(locale)) return

  if (locale === 'zh-CN' || locale === 'en') {
    loadedLocales.add(locale)
    return
  }

  const loader = localeLoaders[locale]
  const module = await loader()
  // 各语言 JSON 键集合可能不完全一致，运行时以 fallbackLocale 补齐
  i18n.global.setLocaleMessage(locale, module.default as typeof zhCN)
  loadedLocales.add(locale)
}

export default i18n

export const setLocale = async (locale: Locale) => {
  if (!SUPPORT_LOCALES.has(locale)) return
  await loadLocaleMessages(locale)
  ;(i18n.global.locale as { value: Locale }).value = locale
  localStorage.setItem('locale', locale)
}

export const getCurrentLocale = (): Locale => {
  return (i18n.global.locale as { value: Locale }).value
}

export const initLocale = async () => {
  const savedLocale = localStorage.getItem('locale') as Locale | null
  if (savedLocale && SUPPORT_LOCALES.has(savedLocale)) {
    await loadLocaleMessages(savedLocale)
    ;(i18n.global.locale as { value: Locale }).value = savedLocale
  }
}
