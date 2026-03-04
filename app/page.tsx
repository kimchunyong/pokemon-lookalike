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
          <Link href="/pokedex">
            <button type="button" className="primary-button">
              📖 포켓몬 도감
            </button>
          </Link>
        </div>

        <PolicyNotice />
      </div>
    </main>
  )
}
