'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { locales, type Locale } from '@/i18n'

const languageNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
}

export default function AuthHeader() {
  const { user, loading, signOut } = useAuth()
  const { locale, setLocale } = useLanguage()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return null

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        gap: '1rem',
        fontSize: 14,
        flexWrap: 'wrap',
      }}
    >
      <Link href="/" style={{ color: '#fff' }}>
        홈
      </Link>
      <Link href="/board" style={{ color: '#fff' }}>
        커뮤니티
      </Link>

      {user && (
        <Link href="/my/results" style={{ color: '#fff' }}>
          내 결과
        </Link>
      )}

      {user ? (
        <>
          <span title={user.email ?? undefined}>{user.email ?? '로그인됨'}</span>
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 4,
              color: '#fff',
            }}
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link href="/login" style={{ color: '#fff' }}>
          로그인
        </Link>
      )}

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #666',
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '0.9em',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
          title="언어 선택"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
        >
          {languageNames[locale]}
          <span style={{ fontSize: '0.6em', opacity: 0.8 }}>{dropdownOpen ? ' ▲' : ' ▼'}</span>
        </button>

        {dropdownOpen && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              minWidth: '120px',
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '0.25rem',
              borderRadius: 8,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
            }}
          >
            {locales.map((loc) => (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={locale === loc}
                onClick={() => {
                  setLocale(loc)
                  setDropdownOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderRadius: 4,
                  background: locale === loc ? '#646cff' : 'transparent',
                  color: locale === loc ? '#fff' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  textAlign: 'left',
                  fontWeight: locale === loc ? 'bold' : 'normal',
                }}
              >
                {languageNames[loc]}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
