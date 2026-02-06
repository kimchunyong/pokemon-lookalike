'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale, getTranslations } from '../i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  // 브라우저 언어 감지 및 localStorage에서 언어 설정 불러오기
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null
    if (savedLocale && ['ko', 'en', 'ja', 'zh'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // 브라우저 언어 감지
      const browserLang = navigator.language.split('-')[0]
      if (['ko', 'en', 'ja', 'zh'].includes(browserLang)) {
        setLocaleState(browserLang as Locale)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    // HTML lang 속성 업데이트
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }

  const t = getTranslations(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
