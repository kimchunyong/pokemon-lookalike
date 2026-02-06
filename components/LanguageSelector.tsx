'use client'

import { useLanguage } from '../contexts/LanguageContext'
import { locales } from '../i18n'

const languageNames: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
}

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage()

  return (
    <div style={{ 
      position: 'fixed', 
      top: '1rem', 
      right: '1rem', 
      zIndex: 1000,
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '0.5rem',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)',
    }}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          style={{
            padding: '0.5rem 1rem',
            border: locale === loc ? '2px solid #646cff' : '1px solid #666',
            borderRadius: '4px',
            background: locale === loc ? '#646cff' : 'rgba(255, 255, 255, 0.1)',
            color: locale === loc ? '#fff' : 'inherit',
            cursor: 'pointer',
            fontSize: '0.9em',
            transition: 'all 0.2s',
            fontWeight: locale === loc ? 'bold' : 'normal',
          }}
          title={`Switch to ${languageNames[loc]}`}
        >
          {languageNames[loc]}
        </button>
      ))}
    </div>
  )
}
