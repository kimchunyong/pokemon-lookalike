'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PolicyNotice from './PolicyNotice'
// import ShareButton from './ShareButton'
import { useLanguage } from '../contexts/LanguageContext'
import KakaoShareButton from './KakaoShareButton'

interface ResultContentProps {
  pokemon: any
}

export default function ResultContent({ pokemon }: ResultContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userImage, setUserImage] = useState<string | null>(null)
  const { t } = useLanguage()
  
  const similarityParam = searchParams.get('similarity')
  const similarity = similarityParam ? parseFloat(similarityParam) : 0

  useEffect(() => {
    // 세션 스토리지에서 사용자 이미지 가져오기
    const storedImage = sessionStorage.getItem('userImage')
    if (storedImage) {
      setUserImage(storedImage)
    }
  }, [])

  if (!pokemon) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t.common.loading}</p>
      </main>
    )
  }

  return (
    <main className="image-compare-page">
      <h1>{t.result.title}</h1>
      <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '1rem' }}>
        {t.result.found}
      </p>

      <div className="pokemon-results" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="pokemon-card">
          <div className="similarity-score">
            {t.imageCompare.similarity}: {similarity ? (similarity * 100).toFixed(1) : 'N/A'}%
          </div>
          {pokemon.imageUrl && (
            <img
              src={pokemon.imageUrl}
              alt={pokemon.name}
              className="pokemon-image"
            />
          )}
          <h2>{pokemon.name}</h2>
          {pokemon.type && (
            <p className="pokemon-type">{t.imageCompare.type}: {pokemon.type}</p>
          )}
          {pokemon.description && (
            <p className="pokemon-description">{pokemon.description}</p>
          )}
          
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <KakaoShareButton pokemon={pokemon} />
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '1rem', 
        borderRadius: '8px',
        margin: '2rem 0',
        fontSize: '0.9em',
        color: '#888'
      }}>
        <p>
          <strong>{t.result.reference}</strong>
        </p>
      </div>

      <PolicyNotice />

      <div className="navigation-section">
        <button type="button" onClick={() => router.push('/image-compare')}>
          {t.result.findAgain}
        </button>
        <button type="button" onClick={() => router.push('/')} style={{ marginLeft: '1rem' }}>
          {t.result.backHome}
        </button>
      </div>
    </main>
  )
}
