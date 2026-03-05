'use client'

import Link from 'next/link'
import PolicyNotice from '../components/PolicyNotice'
import { useLanguage } from '../contexts/LanguageContext'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <main className="home-page-wrapper">
      <div className="home-page-video-backdrop" aria-hidden>
        <video className="home-page-video" autoPlay loop muted playsInline>
          <source src="/video/pokemon_main_video.mp4" type="video/mp4" />
        </video>
        <div className="home-page-video-overlay" />
      </div>


      <div className="home-page">
        <section
          className="home-seo-content"
          aria-label="포켓몬 닮은꼴 찾기 소개"
          style={{
            marginTop: '2.5rem',
            padding: '1.5rem',
            maxWidth: 640,
            textAlign: 'left',
            fontSize: '0.95em',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.95)' }}>
            포켓몬 닮은꼴 찾기란?
          </h2>
          <p>
            포켓몬 닮은꼴 찾기는 사진 한 장으로 <strong>나와 닮은 포켓몬</strong>을 AI가 찾아주는 서비스입니다.
            이미지를 업로드하면 1·2·3세대 포켓몬 386마리 중에서 얼굴 유사도가 높은 포켓몬을 순서대로 보여드립니다.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            포켓몬 닮은꼴 찾기 결과를 바탕으로 <strong>포켓몬 도감</strong>에서 해당 포켓몬의 타입·능력치·진화 정보를 확인할 수 있고,
            로그인 후 <strong>닮은꼴 랭킹</strong>에 등록하거나 커뮤니티에서 다른 유저와 결과를 공유할 수 있습니다.
          </p>
        </section>

        <h1>{t.home.title}</h1>
        <p>{t.home.subtitle}</p>
        <p style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.85)', marginTop: '0.5rem' }}>
          {t.home.disclaimer}
        </p>

        <div className="option-buttons">
          <Link href="/image-compare">
            <button type="button" className="primary-button">
              {t.home.findByImage}
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
