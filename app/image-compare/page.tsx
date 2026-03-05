'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../../components/ImageUpload'
import { findSimilarPokemon } from '../../utils/imageComparison'
import { analyzeEmotionAndGetFaceCrop, getEmotionKorean } from '../../utils/emotionAnalysis'
import { POKEMON_LIST } from '../../data/pokemon'
import PolicyNotice from '../../components/PolicyNotice'
// import ShareButton from '../../components/ShareButton'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ImageComparePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<Array<any>>([])
  const [error, setError] = useState<string | null>(null)
  const [detectedEmotion, setDetectedEmotion] = useState<{ expression: string; probability: number } | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleImageSelect = (imageUrl: string | null) => {
    setUploadedImage(imageUrl)
    setResults([])
    setError(null)
    setDetectedEmotion(null)
  }

  const handleCompare = async () => {
    if (!uploadedImage || POKEMON_LIST.length === 0) {
      setError(t.imageCompare.uploadError)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const img = new Image()
      img.src = uploadedImage
      await new Promise((resolve) => {
        img.onload = resolve
      })

      // 얼굴 감지 후: 감정 분석 + 얼굴 크롭 URL 확보 (한 번의 검출로 처리)
      const { emotion: emotionResult, faceCroppedDataUrl } = await analyzeEmotionAndGetFaceCrop(img)
      // 얼굴이 있으면 크롭 이미지로 유사도 비교(더 정확), 없으면 원본 사용
      const imageForSimilarity = faceCroppedDataUrl ?? uploadedImage

      const similarPokemon = await findSimilarPokemon(imageForSimilarity, POKEMON_LIST)

      setResults(similarPokemon)
      setDetectedEmotion(emotionResult)
    } catch (err) {
      console.error('비교 중 오류:', err)
      setError(t.imageCompare.compareError)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewResult = (pokemon: any) => {
    if (uploadedImage) {
      sessionStorage.setItem('userImage', uploadedImage)
    }
    
    let url = `/result/${pokemon.id}?similarity=${pokemon.similarity}`
    if (detectedEmotion) {
      url += `&emotion=${detectedEmotion.expression}&emotionProb=${detectedEmotion.probability}`
    }
    
    router.push(url)
  }

  return (
    <main className="image-compare-page" style={{ marginTop: '90px' }}>
      <h1>{t.imageCompare.title}</h1>
      <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '1rem' }}>
        {t.imageCompare.description}
      </p>

      <section
        aria-label="포켓몬 닮은꼴 찾기 방법"
        style={{
          marginTop: '2rem',
          padding: '1.25rem',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
          fontSize: '0.9em',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
          포켓몬 닮은꼴 찾기 이용 방법
        </h2>
        <p>
          포켓몬 닮은꼴 찾기는 이미지를 업로드한 뒤 &quot;닮은 포켓몬 찾기&quot; 버튼을 누르면 됩니다.
          AI가 나와 닮은 포켓몬을 유사도 순으로 보여주며, 자세히 보기에서 포켓몬 도감 정보와 공유 기능을 이용할 수 있습니다.
        </p>
      </section>
      
      <div className="upload-section">
        <ImageUpload onImageSelect={handleImageSelect} />
      </div>

      {uploadedImage && (
        <div className="action-section">
          <button
            type="button"
            onClick={handleCompare}
            disabled={isProcessing}
            className="compare-button"
          >
            {isProcessing ? t.imageCompare.analyzing : t.imageCompare.findPokemon}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {isProcessing && (
        <div className="pokeball-loading-wrapper" role="status" aria-live="polite">
          <div className="pokeball-loader" aria-hidden="true" />
          <p className="pokeball-loading-text">{t.imageCompare.processing}</p>
          <div className="pokeball-loading-bar-track">
            <div className="pokeball-loading-bar-fill" />
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="results-section">
          <h2>{t.imageCompare.results}</h2>
          <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '1rem' }}>
            {t.imageCompare.resultsNotice}
          </p>

          <div className="pokemon-results">
            {results.slice(0, 8).map((pokemon: any, index: number) => (
              <div key={pokemon.id || index} className="pokemon-card">
                <div className="similarity-score">
                  {t.imageCompare.similarity}: {(pokemon.similarity * 100).toFixed(1)}%
                </div>
                {pokemon.imageUrl && (
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="pokemon-image"
                  />
                )}
                <h3>{detectedEmotion ? <span style={{ color: '#646cff', fontWeight: 'bold' }}>{getEmotionKorean(detectedEmotion.expression)}</span> : ''} {pokemon.name}</h3>
                {pokemon.type && (
                  <p className="pokemon-type">{t.imageCompare.type}: {pokemon.type}</p>
                )}
                {pokemon.description && (
                  <p className="pokemon-description">{pokemon.description}</p>
                )}
                <div className="pokemon-card-actions">
                  <button
                    type="button"
                    onClick={() => handleViewResult(pokemon)}
                    className="view-detail-button"
                  >
                    {t.imageCompare.viewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PolicyNotice />


      <div className="navigation-section">
        <button type="button" onClick={() => router.push('/')}>
          {t.common.home}
        </button>
      </div>
    </main>
  )
}
