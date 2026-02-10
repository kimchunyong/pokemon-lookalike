'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PolicyNotice from './PolicyNotice'
// import ShareButton from './ShareButton'
import { useLanguage } from '../contexts/LanguageContext'
import KakaoShareButton from './KakaoShareButton'
import { getEvolutionChain, EvolutionStage } from '../utils/evolutionChain'
import { getPokemonWithKoreanName } from '../utils/pokeapi'
import { getEmotionKorean } from '../utils/emotionAnalysis'

interface ResultContentProps {
  pokemon: any
}

export default function ResultContent({ pokemon }: ResultContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userImage, setUserImage] = useState<string | null>(null)
  const [evolutionChain, setEvolutionChain] = useState<EvolutionStage[]>([])
  const { t } = useLanguage()
  
  const similarityParam = searchParams.get('similarity')
  const similarity = similarityParam ? parseFloat(similarityParam) : 0
  
  const emotionParam = searchParams.get('emotion')
  const emotionProbParam = searchParams.get('emotionProb')
  const emotionProb = emotionProbParam ? parseFloat(emotionProbParam) : 0

  useEffect(() => {
    // 세션 스토리지에서 사용자 이미지 가져오기
    const storedImage = sessionStorage.getItem('userImage')
    if (storedImage) {
      setUserImage(storedImage)
    }

    // 진화 트리 데이터 가져오기
    const fetchEvolution = async () => {
      if (pokemon?.id) {
        // 1. 진화 체인 기본 정보 가져오기
        const chain = await getEvolutionChain(pokemon.id)
        
        // 2. 각 단계별 한국어 이름 업데이트 (병렬 처리)
        const updatedChain = await Promise.all(chain.map(async (stage) => {
          // 이름이 영어인 경우(기본값)에만 API 호출 시도
          // getEvolutionChain에서 이미 getPokemonNameKorean을 호출하지만,
          // 정확한 한국어 이름을 위해 getPokemonWithKoreanName을 활용
          try {
            // ID를 모르므로 이름으로 검색하거나, getEvolutionChain을 수정하여 ID를 반환받아야 함
            // 여기서는 간단히 getPokemonWithKoreanName을 활용하되, 
            // evolutionChain.ts에서 이미 ID를 알고 있으므로 그쪽을 보강하는게 좋음.
            // 일단 현재 구조상 이름으로 재조회
            const p = await getPokemonWithKoreanName(stage.name)
            return {
              ...stage,
              koreanName: p.korean_name || stage.koreanName
            }
          } catch {
            return stage
          }
        }))
        
        setEvolutionChain(updatedChain)
      }
    }
    fetchEvolution()
  }, [pokemon])

  if (!pokemon) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t.common.loading}</p>
      </main>
    )
  }

  return (
    <main className="image-compare-page" style={{ marginTop: '80px' }}>
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
          <h2>{emotionParam ? <span style={{ color: '#646cff', fontWeight: 'bold' }}>{getEmotionKorean(emotionParam)}</span> : ''} {pokemon.name}</h2>
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

      {evolutionChain.length > 1 && (
        <div className="evolution-section" style={{ 
          maxWidth: '600px', 
          margin: '2rem auto',
          textAlign: 'center' 
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>진화 과정</h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {evolutionChain.map((stage, index) => (
              <div key={stage.name} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  opacity: stage.isCurrent ? 1 : 0.6,
                  transform: stage.isCurrent ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: stage.isCurrent ? 'rgba(100, 108, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: stage.isCurrent ? '2px solid #646cff' : '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={stage.imageUrl} 
                      alt={stage.koreanName}
                      style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                    />
                  </div>
                  <span style={{ 
                    fontSize: '0.9em', 
                    fontWeight: stage.isCurrent ? 'bold' : 'normal',
                    color: stage.isCurrent ? '#646cff' : '#888'
                  }}>
                    {stage.koreanName}
                  </span>
                  {stage.isCurrent && <span style={{ fontSize: '0.7em', color: '#646cff' }}>(현재)</span>}
                </div>
                {index < evolutionChain.length - 1 && (
                  <div style={{ margin: '0 0.5rem', color: '#444' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
