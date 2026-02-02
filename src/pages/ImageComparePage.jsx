import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload'
import { findSimilarPokemon } from '../utils/imageComparison'
import { POKEMON_LIST } from '../data/pokemon'

function ImageComparePage() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleImageSelect = (imageUrl) => {
    setUploadedImage(imageUrl)
    setResults(null)
    setError(null)
  }

  const handleCompare = async () => {
    if (!uploadedImage || POKEMON_LIST.length === 0) {
      setError('이미지를 업로드해주세요.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const similarPokemon = await findSimilarPokemon(
        uploadedImage,
        POKEMON_LIST
      )

      setResults(similarPokemon)
    } catch (err) {
      console.error('비교 중 오류:', err)
      setError('이미지 비교 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewResult = (pokemon) => {
    navigate('/result', { state: { pokemon, similarity: pokemon.similarity } })
  }

  return (
    <main className="image-compare-page">
      <h1>이미지로 닮은 포켓몬 찾기</h1>
      
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
            {isProcessing ? '분석 중...' : '닮은 포켓몬 찾기'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {isProcessing && (
        <div className="loading">
          <p>이미지를 분석하고 있습니다. 잠시만 기다려주세요...</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="results-section">
          <h2>닮은 포켓몬 결과</h2>
          <div className="pokemon-results">
            {results.slice(0, 5).map((pokemon, index) => (
              <div key={pokemon.id || index} className="pokemon-card">
                <div className="similarity-score">
                  유사도: {(pokemon.similarity * 100).toFixed(1)}%
                </div>
                {pokemon.imageUrl && (
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="pokemon-image"
                  />
                )}
                <h3>{pokemon.name}</h3>
                {pokemon.type && (
                  <p className="pokemon-type">타입: {pokemon.type}</p>
                )}
                {pokemon.description && (
                  <p className="pokemon-description">{pokemon.description}</p>
                )}
                <button
                  type="button"
                  onClick={() => handleViewResult(pokemon)}
                  className="view-detail-button"
                >
                  자세히 보기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="navigation-section">
        <button type="button" onClick={() => navigate('/')}>
          홈으로
        </button>
      </div>
    </main>
  )
}

export default ImageComparePage
