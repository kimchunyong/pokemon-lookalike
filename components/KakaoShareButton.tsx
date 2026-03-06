'use client'

import { useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface KakaoShareButtonProps {
  pokemon: any
}

declare global {
  interface Window {
    Kakao: any
  }
}

export default function KakaoShareButton({ pokemon }: KakaoShareButtonProps) {
  const { t } = useLanguage()

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

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `나는 ${pokemon.name}를 닮았어요!`,
        description: pokemon.description,
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

  return (
    <button
      type="button"
      onClick={handleShare}
      style={{
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
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_small.png"
        alt={t.share.kakaoAlt ?? '카카오톡으로 공유하기'}
        style={{ width: '20px', height: '20px' }}
      />
      카카오톡으로 공유하기
    </button>
  )
}
