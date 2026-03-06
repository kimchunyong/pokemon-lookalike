'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer
      style={{
        padding: '1.5rem 1rem',
        marginTop: '3rem',
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
      }}
    >
      <nav
        aria-label={t.footer.navAria}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <Link href="/terms" style={{ color: '#fff', textDecoration: 'none' }}>
          {t.footer.terms}
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/privacy" style={{ color: '#fff', textDecoration: 'none' }}>
          {t.footer.privacy}
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>
          {t.footer.contact}
        </Link>
      </nav>
      <p>&copy; {new Date().getFullYear()} Pocketmon Face. All rights reserved.</p>
    </footer>
  )
}
