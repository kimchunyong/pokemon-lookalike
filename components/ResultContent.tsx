'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import PolicyNotice from './PolicyNotice'
// import ShareButton from './ShareButton'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getAuthorDisplayNameFromUser } from '@/lib/getAuthorDisplayName'
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [rankingStatus, setRankingStatus] = useState<'idle' | 'registering' | 'registered' | 'error'>('idle')
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'done' | 'error'>('idle')
  const resultCaptureRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { user } = useAuth()

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
        const updatedChain = await Promise.all(
          chain.map(async (stage) => {
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
                koreanName: p.korean_name || stage.koreanName,
              }
            } catch {
              return stage
            }
          })
        )

        setEvolutionChain(updatedChain)
      }
    }
    fetchEvolution()
  }, [pokemon])

  const handleSave = useCallback(async () => {
    if (!user || !pokemon) return
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.from('user_results').insert({
      user_id: user.id,
      pokemon_id: pokemon.id,
      pokemon_name: pokemon.name,
      similarity,
      emotion: emotionParam ?? null,
      emotion_probability: emotionProb || null,
    })
    setSaveStatus(error ? 'error' : 'saved')
  }, [user, pokemon, similarity, emotionParam, emotionProb])

  const handleRankingRegister = useCallback(async () => {
    if (!user || !pokemon) return
    setRankingStatus('registering')
    const supabase = createClient()
    let displayName = getAuthorDisplayNameFromUser(user)
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('nickname, raw_user_meta_data, email')
        .eq('id', user.id)
        .single()
      if (profile) {
        const nickname = (profile as { nickname?: string | null; raw_user_meta_data?: { full_name?: string; name?: string } | null; email?: string | null }).nickname?.trim()
        const meta = (profile as { raw_user_meta_data?: { full_name?: string; name?: string } | null }).raw_user_meta_data
        const email = (profile as { email?: string | null }).email
        if (nickname) displayName = nickname
        else displayName = (meta?.full_name || meta?.name || email || t.common.unknown).trim() || t.common.unknown
      }
    } catch {
      // keep getAuthorDisplayNameFromUser fallback
    }
    const { data: existing } = await supabase
      .from('lookalike_ranking')
      .select('similarity')
      .eq('user_id', user.id)
      .single()
    const existingSim = (existing as { similarity: number } | null)?.similarity ?? -1
    if (similarity <= existingSim) {
      setRankingStatus('registered')
      return
    }
    const { error } = await supabase.from('lookalike_ranking').upsert(
      {
        user_id: user.id,
        pokemon_id: pokemon.id,
        pokemon_name: pokemon.name,
        similarity,
        display_name: displayName || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    setRankingStatus(error ? 'error' : 'registered')
  }, [user, pokemon, similarity, t])

  const handleSaveResultImage = useCallback(async () => {
    const el = resultCaptureRef.current
    if (!el) return
    setCaptureStatus('capturing')
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#1a1a1a',
        logging: false,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `pokemon-lookalike-${pokemon.name}-${(similarity * 100).toFixed(0)}.png`
      link.href = dataUrl
      link.click()
      setCaptureStatus('done')
    } catch (err) {
      console.error('Result image capture failed:', err)
      setCaptureStatus('error')
    }
  }, [pokemon, similarity])

  if (!pokemon) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t.common.loading}</p>
      </main>
    )
  }

  return (
    <main className="image-compare-page" style={{ marginTop: '80px' }}>
      <div ref={resultCaptureRef} className="result-capture-area">
        <h1>{t.result.title}</h1>
        <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '1rem' }}>{t.result.found}</p>

        <div className="pokemon-results" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <div className="pokemon-card">
          <div className="similarity-score">
            {t.imageCompare.similarity}: {similarity ? (similarity * 100).toFixed(1) : 'N/A'}%
          </div>
          {pokemon.imageUrl && (
            <img src={pokemon.imageUrl} alt={pokemon.name} className="pokemon-image" />
          )}
          <h2>
            {emotionParam ? (
              <span style={{ color: '#646cff', fontWeight: 'bold' }}>
                {getEmotionKorean(emotionParam)}
              </span>
            ) : (
              ''
            )}{' '}
            {pokemon.name}
          </h2>
          {pokemon.type && (
            <p className="pokemon-type">
              {t.imageCompare.type}: {pokemon.type}
            </p>
          )}
          {pokemon.description && <p className="pokemon-description">{pokemon.description}</p>}

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.8rem',
              flexWrap: 'wrap',
            }}
          >
            <KakaoShareButton pokemon={pokemon} />
            {user ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 8,
                    border: saveStatus === 'saved' ? '1px solid #4caf50' : '1px solid #646cff',
                    background:
                      saveStatus === 'saved'
                        ? 'rgba(76, 175, 80, 0.15)'
                        : 'rgba(100, 108, 255, 0.15)',
                    color: saveStatus === 'saved' ? '#4caf50' : '#646cff',
                    cursor: saveStatus === 'saved' ? 'default' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9em',
                  }}
                >
                  {saveStatus === 'idle' && t.resultContent.saveToMyResults}
                  {saveStatus === 'saving' && t.resultContent.saving}
                  {saveStatus === 'saved' && t.resultContent.saved}
                  {saveStatus === 'error' && t.resultContent.saveError}
                </button>
                <button
                  type="button"
                  onClick={handleRankingRegister}
                  disabled={rankingStatus === 'registering' || rankingStatus === 'registered'}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 8,
                    border:
                      rankingStatus === 'registered'
                        ? '1px solid #ff9800'
                        : '1px solid #ff9800',
                    background:
                      rankingStatus === 'registered'
                        ? 'rgba(255, 152, 0, 0.2)'
                        : 'rgba(255, 152, 0, 0.15)',
                    color: '#ff9800',
                    cursor:
                      rankingStatus === 'registered' ? 'default' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9em',
                  }}
                >
                  {rankingStatus === 'idle' && t.resultContent.registerRanking}
                  {rankingStatus === 'registering' && t.resultContent.registering}
                  {rankingStatus === 'registered' && t.resultContent.registeredDone}
                  {rankingStatus === 'error' && t.resultContent.registerError}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 8,
                    border: '1px solid #888',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                  }}
                >
                  로그인하고 결과 저장
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 8,
                    border: '1px solid #888',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                  }}
                >
                  로그인하고 랭킹전 등록
                </button>
              </>
            )}
          </div>
          {(saveStatus === 'saved' || rankingStatus === 'registered') && (
            <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85em' }}>
              {saveStatus === 'saved' && (
                <button
                  type="button"
                  onClick={() => router.push('/my/results')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: 'inherit',
                  }}
                >
                  내 히스토리 보기 →
                </button>
              )}
              {rankingStatus === 'registered' && (
                <button
                  type="button"
                  onClick={() => router.push('/ranking')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff9800',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: 'inherit',
                    marginLeft: saveStatus === 'saved' ? '0.5rem' : 0,
                  }}
                >
                  유사도 순위 보기 →
                </button>
              )}
            </p>
          )}
          </div>
        </div>
      </div>

      <div className="result-save-image-row" style={{ maxWidth: '500px', margin: '0 auto 1rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={handleSaveResultImage}
          disabled={captureStatus === 'capturing'}
          className="result-save-image-button"
        >
          {captureStatus === 'idle' && (t.resultContent.saveImage ?? '결과 이미지 저장')}
          {captureStatus === 'capturing' && (t.resultContent.savingImage ?? '저장 중...')}
          {captureStatus === 'done' && (t.resultContent.savedImage ?? '저장 완료 ✓')}
          {captureStatus === 'error' && (t.resultContent.saveImageError ?? '저장 실패')}
        </button>
        {captureStatus === 'done' && (
          <p className="result-save-image-hint" style={{ marginTop: '0.5rem', fontSize: '0.85em', color: '#888' }}>
            {t.resultContent.saveImageHint ?? '저장된 이미지를 갤러리에서 인스타 스토리에 올려보세요!'}
          </p>
        )}
      </div>

      {evolutionChain.length > 1 && (
        <div
          className="evolution-section"
          style={{
            maxWidth: '600px',
            margin: '2rem auto',
            textAlign: 'center',
          }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>진화 과정</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {evolutionChain.map((stage, index) => (
              <div key={stage.name} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: stage.isCurrent ? 1 : 0.6,
                    transform: stage.isCurrent ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: stage.isCurrent
                        ? 'rgba(100, 108, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: stage.isCurrent
                        ? '2px solid #646cff'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={stage.imageUrl}
                      alt={stage.koreanName}
                      style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.9em',
                      fontWeight: stage.isCurrent ? 'bold' : 'normal',
                      color: stage.isCurrent ? '#646cff' : '#888',
                    }}
                  >
                    {stage.koreanName}
                  </span>
                  {stage.isCurrent && (
                    <span style={{ fontSize: '0.7em', color: '#646cff' }}>(현재)</span>
                  )}
                </div>
                {index < evolutionChain.length - 1 && (
                  <div style={{ margin: '0 0.5rem', color: '#444' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem',
          borderRadius: '8px',
          margin: '2rem 0',
          fontSize: '0.9em',
          color: '#888',
        }}
      >
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
