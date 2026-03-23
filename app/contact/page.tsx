'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ContactPage() {
  const { t } = useLanguage()
  return (
    <div
      style={{
        padding: '1.5rem',
        maxWidth: 720,
        margin: '0 auto',
        minHeight: 'calc(100vh - 201px)',
      }}
    >
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{t.contact.title}</h1>
      <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
        {t.contact.description}
      </p>
      <section
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.15rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
        }}
        aria-labelledby="contact-scope"
      >
        <h2 id="contact-scope" style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
          {(t.contact as Record<string, string>).scopeTitle}
        </h2>
        <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.95em' }}>
          {(t.contact as Record<string, string>).scopeP1}
        </p>
      </section>
      <section
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.15rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
        }}
        aria-labelledby="contact-response"
      >
        <h2 id="contact-response" style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
          {(t.contact as Record<string, string>).responseTitle}
        </h2>
        <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.95em' }}>
          {(t.contact as Record<string, string>).responseP1}
        </p>
      </section>
      <p style={{ marginBottom: '1rem', fontSize: '0.95em' }}>
        <Link href="/faq" style={{ color: '#646cff' }}>
          {(t.contact as Record<string, string>).faqLink}
        </Link>
      </p>
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)' }}>
          <strong>{t.contact.email}</strong>:{' '}
          <a href="mailto:lovemy5853@gmail.com" style={{ color: '#1976d2' }}>
            lovemy5853@gmail.com
          </a>
        </p>
        <p style={{ margin: '0.5rem 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
          {t.contact.replyNote}
        </p>
      </div>
      <p style={{ fontSize: 14 }}>
        <Link href="/" style={{ color: '#1976d2' }}>
          {t.contact.backHome}
        </Link>
      </p>
    </div>
  )
}
