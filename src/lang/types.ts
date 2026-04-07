export interface LocaleMessages {
  common: {
    confirm: string
    cancel: string
    save: string
    delete: string
    edit: string
    add: string
    search: string
    reset: string
    submit: string
    back: string
    next: string
    previous: string
    loading: string
    noData: string
    success: string
    error: string
    warning: string
    info: string
  }
  nav: {
    home: string
    about: string
    products: string
    services: string
    contact: string
  }
  form: {
    required: string
    email: string
    phone: string
    password: string
    confirmPassword: string
  }
  message: {
    saveSuccess: string
    deleteSuccess: string
    updateSuccess: string
    operationSuccess: string
    operationFailed: string
    networkError: string
  }
}

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ru' | 'ar' | 'es' | 'tr'

export const localeOptions: { label: string; value: Locale }[] = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁体中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: '日本语', value: 'ja' },
  { label: '한국어', value: 'ko' },
  { label: 'Русский', value: 'ru' },
  { label: 'العربية', value: 'ar' },
  { label: 'Español', value: 'es' },
  { label: 'Türkçe', value: 'tr' },
]
