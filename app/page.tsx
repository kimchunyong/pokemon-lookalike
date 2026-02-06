'use client'

import Link from 'next/link'
import PolicyNotice from '../components/PolicyNotice'
import { useLanguage } from '../contexts/LanguageContext'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <main className="home-page">
      <h1>{t.home.title}</h1>
      <p>{t.home.subtitle}</p>
      <p style={{ fontSize: '0.9em', color: '#888', marginTop: '0.5rem' }}>
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
    </main>
  )
}
