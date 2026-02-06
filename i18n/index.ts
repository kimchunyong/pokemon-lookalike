import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

export type Locale = 'ko' | 'en' | 'ja' | 'zh'

export const locales: Locale[] = ['ko', 'en', 'ja', 'zh']

export const defaultLocale: Locale = 'ko'

export const translations = {
  ko,
  en,
  ja,
  zh,
} as const

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale]
}
