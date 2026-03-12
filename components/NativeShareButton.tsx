'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { trackEvent } from '@/lib/ga'

interface NativeShareButtonProps {
  pokemon: any
  mbtiCode?: string | null
  variant?: 'default' | 'secondary'
}

export default function NativeShareButton({
  pokemon,
  mbtiCode = null,
  variant = 'default',
}: NativeShareButtonProps) {
  const { t } = useLanguage()
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && Boolean(navigator.share))
  }, [])

  const handleShare = async () => {
    if (!navigator.share) return

    trackEvent({ label: mbtiCode ? 'Native Share With MBTI' : 'Native Share Button' })

    const title = mbtiCode
      ? `나는 ${pokemon.name}를 닮았어요! (${mbtiCode} 유추)`
      : `나는 ${pokemon.name}를 닮았어요!`
    const text = mbtiCode
      ? `${pokemon.description} · MBTI 유추: ${mbtiCode}`
      : pokemon.description ?? ''
    const url = typeof window !== 'undefined' ? window.location.href : ''

    try {
      await navigator.share({
        title,
        text: text || title,
        url,
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Native share failed:', err)
      }
    }
  }

  if (!isSupported) return null

  const isSecondary = variant === 'secondary'
  const defaultStyle = {
    backgroundColor: 'rgba(100, 108, 255, 0.9)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  }
  const secondaryStyle = {
    padding: '0.5rem 1rem',
    fontSize: '0.85em',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#ccc',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const label = (t.share as Record<string, string>)?.nativeShareLabel ?? t.share.share ?? '공유하기'

  return (
    <button
      type="button"
      onClick={handleShare}
      style={isSecondary ? secondaryStyle : defaultStyle}
      onMouseOver={(e) => !isSecondary && (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseOut={(e) => !isSecondary && (e.currentTarget.style.transform = 'scale(1)')}
      aria-label={label}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {label}
    </button>
  )
}
