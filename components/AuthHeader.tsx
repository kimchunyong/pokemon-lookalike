'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { locales, type Locale } from '@/i18n'
import Image from 'next/image'

const languageNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
}

export default function AuthHeader() {
  const { user, loading, signOut } = useAuth()
  const { locale, setLocale, t } = useLanguage()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeAll = useCallback(() => {
    setDropdownOpen(false)
    setUserDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const langDropdowns = document.querySelectorAll('.header-lang-dropdown')
      const insideLangDropdown = Array.from(langDropdowns).some((el) =>
        el.contains(e.target as Node)
      )
      if (!insideLangDropdown) {
        setDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  if (loading) return null

  const navLinks = (
    <>
      <Link href="/" className="header-nav-link" onClick={closeAll}>
        {t.header.navHome}
      </Link>
      <Link href="/image-compare" className="header-nav-link" onClick={closeAll}>
        {t.header.navFindByImage}
      </Link>
      <Link href="/pokedex" className="header-nav-link" onClick={closeAll}>
        {t.header.navPokedex}
      </Link>
      <Link href="/board" className="header-nav-link" onClick={closeAll}>
        {t.header.navBoard}
      </Link>
      <Link href="/ranking" className="header-nav-link" onClick={closeAll}>
        {t.header.navRanking}
      </Link>
      {user && (
        <Link href="/my/results" className="header-nav-link" onClick={closeAll}>
          {t.header.navMyResults}
        </Link>
      )}
    </>
  )

  const authSection = user ? (
    <div ref={userDropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setUserDropdownOpen((prev) => !prev)}
        title={user.email ?? undefined}
        aria-expanded={userDropdownOpen}
        aria-haspopup="menu"
        className="header-user-button"
      >
        {user.email ?? t.header.loggedIn}
        <span style={{ fontSize: '0.65em', opacity: 0.8 }}>
          {userDropdownOpen ? ' ▲' : ' ▼'}
        </span>
      </button>
      {userDropdownOpen && (
        <div role="menu" className="header-dropdown-menu">
          <Link
            href="/profile"
            role="menuitem"
            onClick={closeAll}
            className="header-dropdown-item"
          >
            {t.header.profileSettings}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeAll()
              signOut()
            }}
            className="header-dropdown-item"
          >
            {t.header.logout}
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link href="/login" className="header-nav-link" onClick={closeAll}>
      {t.header.login}
    </Link>
  )

  const langSelector = (
    <div ref={dropdownRef} className="header-lang-dropdown" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="header-lang-button"
        title={t.header.languageSelect}
        aria-expanded={dropdownOpen}
        aria-haspopup="listbox"
      >
        {languageNames[locale]}
        <span style={{ fontSize: '0.6em', opacity: 0.8 }}>{dropdownOpen ? ' ▲' : ' ▼'}</span>
      </button>

      {dropdownOpen && (
        <div role="listbox" className="header-dropdown-menu">
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
              className="header-dropdown-item"
              style={{
                background: locale === loc ? '#646cff' : 'transparent',
                color: locale === loc ? '#fff' : 'inherit',
                fontWeight: locale === loc ? 'bold' : 'normal',
              }}
            >
              {languageNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <header className={`site-header${isScrolled ? ' scrolled' : ''}`}>
      <h1 style={{ marginLeft: 20 }}>
        <Link href="/">
          <Image src="/images/pokemon_logo.png" alt={t.header.siteTitleAlt} width={50} height={50} />
        </Link>
      </h1>

      {/* 데스크톱 네비게이션 */}
      <div className="header-desktop-nav">
        {navLinks}
        {authSection}
        {langSelector}
      </div>

      {/* 모바일 햄버거 버튼 */}
      <button
        type="button"
        className="header-hamburger"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label={t.header.menuOpen}
        aria-expanded={mobileMenuOpen}
      >
        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
      </button>

      {/* 모바일 메뉴 오버레이 */}
      {mobileMenuOpen && (
        <div className="header-mobile-overlay" onClick={closeAll} />
      )}

      {/* 모바일 슬라이드 메뉴 */}
      <div
        ref={mobileMenuRef}
        className={`header-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
      >
        <nav className="header-mobile-nav">
          {navLinks}
          <hr className="header-mobile-divider" />
          {authSection}
          {langSelector}
        </nav>
      </div>
    </header>
  )
}
