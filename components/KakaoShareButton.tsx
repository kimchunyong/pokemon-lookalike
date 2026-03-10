'use client'

import { useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { trackEvent } from '@/lib/ga'

interface KakaoShareButtonProps {
  pokemon: any
  /** MBTI 유형 코드(재미용 유추). 있으면 공유 문구에 포함됩니다. */
  mbtiCode?: string | null
  /** 'secondary': MBTI 섹션용 스타일 + "나와 잘 맞는 친구에게 공유" 문구 */
  variant?: 'default' | 'secondary'
}

declare global {
  interface Window {
    Kakao: any
  }
}

export default function KakaoShareButton({ pokemon, mbtiCode, variant = 'default' }: KakaoShareButtonProps) {
  const { t } = useLanguage()
  const isSecondary = variant === 'secondary'
  const label = isSecondary
    ? ((t.resultContent as Record<string, string>)?.mbtiShareToMatchingFriend ?? '나와 잘 맞는 친구에게 공유')
    : '카카오톡으로 공유하기'

  useEffect(() => {
    // Kakao SDK가 이미 로드되어 있고 초기화되지 않았다면 초기화 시도
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY

    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      if (key) {
        window.Kakao.init(key)
        console.log('Kakao SDK 초기화 성공')
      } else {
        console.log('Kakao SDK 초기화 실패')
      }
    }
  }, [])

  const handleShare = () => {
    trackEvent({ label: mbtiCode ? 'Kakao Share With MBTI' : 'Kakao Share Button' })

    if (!window.Kakao) {
      alert('카카오톡 SDK가 로드되지 않았습니다.')
      return
    }

    if (!window.Kakao.isInitialized()) {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
      if (key) {
        window.Kakao.init(key)
      }
    }

    if (!window.Kakao.isInitialized()) {
      alert(t.myResults.kakaoInitFail)
      return
    }

    const currentUrl = window.location.href

    const title = mbtiCode ? `나는 ${pokemon.name}를 닮았어요! (${mbtiCode} 유추)` : `나는 ${pokemon.name}를 닮았어요!`
    const description = mbtiCode ? `${pokemon.description} · MBTI 유추: ${mbtiCode}` : pokemon.description

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: pokemon.imageUrl,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: t.myResults.viewResult,
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
    })
  }

  const defaultStyle = {
    backgroundColor: '#FEE500',
    color: '#000000',
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

  return (
    <button
      type="button"
      onClick={handleShare}
      style={isSecondary ? secondaryStyle : defaultStyle}
      onMouseOver={(e) => !isSecondary && (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseOut={(e) => !isSecondary && (e.currentTarget.style.transform = 'scale(1)')}
    >
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_small.png"
        alt={t.share.kakaoAlt ?? '카카오톡으로 공유하기'}
        style={{ width: '20px', height: '20px' }}
      />
      {label}
    </button>
  )
}
