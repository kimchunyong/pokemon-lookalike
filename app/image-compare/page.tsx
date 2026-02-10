'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '../../components/ImageUpload'
import { findSimilarPokemon } from '../../utils/imageComparison'
import { analyzeEmotion, getEmotionKorean, loadEmotionModels } from '../../utils/emotionAnalysis'
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
      // 이미지 엘리먼트 생성
      const img = new Image()
      img.src = uploadedImage
      await new Promise((resolve) => {
        img.onload = resolve
      })

      // 병렬 처리: 포켓몬 유사도 분석 및 감정 분석
      const [similarPokemon, emotionResult] = await Promise.all([
        findSimilarPokemon(uploadedImage, POKEMON_LIST),
        analyzeEmotion(img)
      ])

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
        <div className="loading">
          <p>{t.imageCompare.processing}</p>
          <p style={{ fontSize: '0.8em', color: '#888', marginTop: '0.5rem' }}>
            {t.imageCompare.processingNotice}
          </p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="results-section">
          

          <h2>{t.imageCompare.results}</h2>
          <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '1rem' }}>
            {t.imageCompare.resultsNotice}
          </p>
          <div className="pokemon-results">
            {results.slice(0, 5).map((pokemon, index) => (
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
                  {/* {uploadedImage && (
                    <ShareButton
                      userImageUrl={uploadedImage}
                      pokemon={pokemon}
                    />
                  )} */}
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
