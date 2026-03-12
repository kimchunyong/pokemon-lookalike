'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import PolicyNotice from './PolicyNotice'
// import ShareButton from './ShareButton'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getAuthorDisplayNameFromUser } from '@/lib/getAuthorDisplayName'
import KakaoShareButton from './KakaoShareButton'
import NativeShareButton from './NativeShareButton'
import { getEvolutionChain, EvolutionStage } from '../utils/evolutionChain'
import { getPokemonWithKoreanName } from '../utils/pokeapi'
import { getEmotionKorean } from '../utils/emotionAnalysis'
import { trackEvent } from '@/lib/ga'
import { inferMbtiCode } from '@/utils/mbti'
import type { MbtiTypeRow } from '@/utils/mbti'
import { POKEMON_LIST } from '@/data/pokemon'
import MbtiPentagonChart from './MbtiPentagonChart'
import AdSenseSlot from './AdSenseSlot'

const ARTWORK_URL = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

const MBTI_ANALYSIS_STEPS = [
  '얼굴형에서 외향성 수치 추출 중...',
  '눈매로 보는 고집 지수 측정 중...',
  '인상 기반 감성 지표 분석 중...',
  '포켓몬 타입과 성향 매칭 중...',
  '감정 데이터와 판단 축 교차 분석 중...',
  '최종 MBTI 유형 조합 중...',
]

const MBTI_ANALYSIS_STEP_MS = 650

interface ResultContentProps {
  pokemon: any
}

export default function ResultContent({ pokemon }: ResultContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userImage, setUserImage] = useState<string | null>(null)
  const [locationSearch, setLocationSearch] = useState('')
  const intentExecutedRef = useRef(false)
  const [evolutionChain, setEvolutionChain] = useState<EvolutionStage[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [rankingStatus, setRankingStatus] = useState<'idle' | 'registering' | 'registered' | 'error'>('idle')
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'done' | 'error'>('idle')
  const [mbtiExpanded, setMbtiExpanded] = useState(false)
  const [mbtiData, setMbtiData] = useState<MbtiTypeRow | null>(null)
  const [mbtiLoading, setMbtiLoading] = useState(false)
  const [mbtiAnalysisPhase, setMbtiAnalysisPhase] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [mbtiAnalysisStep, setMbtiAnalysisStep] = useState(0)
  const mbtiHasShownResultRef = useRef(false)
  const resultCaptureRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (typeof window === 'undefined') return
    setLocationSearch(window.location.search)
  }, [pathname])

  const searchParams = useMemo(() => new URLSearchParams(locationSearch), [locationSearch])
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

  useEffect(() => {
    if (!pokemon?.id) return
    const code = inferMbtiCode(pokemon, emotionParam ?? null)
    setMbtiLoading(true)
    void createClient()
      .from('mbti_types')
      .select('code, name_ko, description, color_hex, good_match_pokemon_ids, bad_match_pokemon_ids, sort_order, personality_stats, fantasy_match_pokemon_id')
      .eq('code', code)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setMbtiData(data as MbtiTypeRow)
      })
      .then(() => setMbtiLoading(false), () => setMbtiLoading(false))
  }, [pokemon?.id, emotionParam])

  const mbtiAnalysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!mbtiExpanded || mbtiAnalysisPhase !== 'analyzing') return
    const totalSteps = MBTI_ANALYSIS_STEPS.length
    if (mbtiAnalysisStep >= totalSteps) {
      mbtiHasShownResultRef.current = true
      setMbtiAnalysisPhase('done')
      return
    }
    mbtiAnalysisTimerRef.current = setTimeout(() => {
      setMbtiAnalysisStep((s) => {
        if (s + 1 >= totalSteps) {
          mbtiHasShownResultRef.current = true
          setMbtiAnalysisPhase('done')
        }
        return Math.min(s + 1, totalSteps)
      })
    }, MBTI_ANALYSIS_STEP_MS)
    return () => {
      if (mbtiAnalysisTimerRef.current) clearTimeout(mbtiAnalysisTimerRef.current)
    }
  }, [mbtiExpanded, mbtiAnalysisPhase, mbtiAnalysisStep])

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
    // 유저당 1건만 유지: upsert로 기존 행이 있으면 현재 결과로 갱신, 없으면 삽입
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

  const goToLoginWithIntent = useCallback(
    (intent: 'saveResult' | 'registerRanking') => {
      if (typeof window === 'undefined') return
      const returnPath = pathname + window.location.search
      sessionStorage.setItem('authReturnPath', returnPath)
      sessionStorage.setItem('authIntent', intent)
      router.push('/login')
    },
    [pathname, router]
  )

  useEffect(() => {
    if (authLoading || !user || intentExecutedRef.current || !pokemon) return
    const intent = searchParams.get('intent')
    if (intent !== 'saveResult' && intent !== 'registerRanking') return
    intentExecutedRef.current = true
    if (intent === 'saveResult') {
      handleSave()
    } else {
      handleRankingRegister()
    }
    const next = new URLSearchParams(searchParams.toString())
    next.delete('intent')
    const nextSearch = next.toString()
    const cleanPath = pathname + (nextSearch ? `?${nextSearch}` : '')
    setLocationSearch(nextSearch ? `?${nextSearch}` : '')
    router.replace(cleanPath)
  }, [authLoading, user, pokemon, searchParams, pathname, router, handleSave, handleRankingRegister])

  const handleSaveResultImage = useCallback(async () => {
    const el = resultCaptureRef.current
    if (!el) return

    trackEvent({ label: 'Result Save Image Button' })
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
        <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '0.5rem' }}>{t.result.found}</p>
        <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '1rem', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          {t.result.reference}
        </p>

        <div className="pokemon-results" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <div className="pokemon-card">
          <div className="similarity-score">
            {t.imageCompare.similarity}: {similarity ? (similarity * 100).toFixed(1) : 'N/A'}%
          </div>
          {pokemon.imageUrl && (
            <img src={pokemon.imageUrl} alt={`포켓몬 닮은꼴 테스트 결과: ${pokemon.name}`} className="pokemon-image" />
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
                  onClick={() => goToLoginWithIntent('saveResult')}
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
                  {t.resultContent.loginAndSaveResult}
                </button>
                <button
                  type="button"
                  onClick={() => goToLoginWithIntent('registerRanking')}
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
                  {t.resultContent.loginAndRegisterRanking}
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

      <div
        className="mbti-section"
        style={{
          maxWidth: '600px',
          margin: '2rem auto',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (!mbtiExpanded) {
              trackEvent({ label: 'Result MBTI Expand' })
              if (mbtiHasShownResultRef.current && mbtiData) {
                setMbtiAnalysisPhase('done')
                setMbtiAnalysisStep(MBTI_ANALYSIS_STEPS.length)
              } else {
                setMbtiAnalysisPhase('analyzing')
                setMbtiAnalysisStep(0)
              }
            } else {
              setMbtiAnalysisPhase('idle')
              setMbtiAnalysisStep(0)
            }
            setMbtiExpanded((v) => !v)
          }}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '1em',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{margin: '0.5rem 0'}}>{(t.resultContent as Record<string, string>).mbtiSectionTitle ?? '내 얼굴에서 이런 성격이 나온다고?'}</span>
          <span style={{ transform: mbtiExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>
        {mbtiExpanded && (
          <div style={{ marginTop: '0.5rem', padding: '0 1.25rem 1.25rem' }}>
            {mbtiAnalysisPhase === 'analyzing' && (
              <div
                style={{
                  padding: '1.5rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: '3px solid rgba(100, 108, 255, 0.3)',
                    borderTopColor: '#646cff',
                    borderRadius: '50%',
                    animation: 'mbti-spin 0.8s linear infinite',
                  }}
                />
                <p
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                    fontSize: '0.95em',
                    textAlign: 'center',
                    minHeight: '1.5em',
                  }}
                >
                  {MBTI_ANALYSIS_STEPS[mbtiAnalysisStep]}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '1em',
                      animation: 'mbti-blink 1s steps(2) infinite',
                    }}
                  >
                    _
                  </span>
                </p>
                <p style={{ margin: 0, fontSize: '0.75em', color: '#666' }}>
                  {mbtiAnalysisStep + 1} / {MBTI_ANALYSIS_STEPS.length}
                </p>
              </div>
            )}
            {mbtiAnalysisPhase === 'done' && (
              <>
            {mbtiLoading && (
              <p style={{ color: '#888', margin: '1rem 0' }}>{t.common.loading}</p>
            )}
            {!mbtiLoading && !mbtiData && (
              <p style={{ color: '#888', margin: '1rem 0' }}>MBTI 유형 정보를 불러올 수 없습니다.</p>
            )}
            {!mbtiLoading && mbtiData && (
              <>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 8,
                  background: `${mbtiData.color_hex}22`,
                  border: `1px solid ${mbtiData.color_hex}`,
                  marginBottom: '1rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '1.1em', fontWeight: 700, color: mbtiData.color_hex }}>
                  {mbtiData.code} · {mbtiData.name_ko}
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.95em', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                  {mbtiData.description}
                </p>
              </div>
              <p style={{ fontSize: '0.8em', color: '#888', marginBottom: '1rem' }}>
                {(t.resultContent as Record<string, string>).mbtiDisclaimer ?? '재미로만 참고해 주세요. 성격 검사 결과가 아닙니다.'}
              </p>
              {mbtiData.personality_stats && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>
                    {(t.resultContent as Record<string, string>).mbtiPersonalityChart ?? '성격 능력치'}
                  </h4>
                  <MbtiPentagonChart stats={mbtiData.personality_stats} />
                </div>
              )}
              {(() => {
                const fantasyId = mbtiData.fantasy_match_pokemon_id ?? mbtiData.good_match_pokemon_ids?.[0]
                const fantasyPokemon = fantasyId != null ? POKEMON_LIST.find((p) => p.id === fantasyId) : null
                const fantasyName = fantasyPokemon?.name ?? ''
                const tpl = (t.resultContent as Record<string, string>).mbtiFantasyMatch ?? "당신({{pokemonName}})과 잘 맞는 관상은 '{{matchName}}' 관상입니다."
                const sentence = tpl.replace('{{pokemonName}}', pokemon.name).replace('{{matchName}}', fantasyName)
                return fantasyName ? (
                  <p style={{ fontSize: '0.95em', color: '#8bc34a', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {sentence}
                  </p>
                ) : null
              })()}
              {(mbtiData.good_match_pokemon_ids?.length ?? 0) > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9em', color: '#8bc34a', marginBottom: '0.5rem' }}>
                    {(t.resultContent as Record<string, string>).mbtiGoodMatch ?? '궁합 좋은 포켓몬'}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {mbtiData.good_match_pokemon_ids
                      .map((id) => POKEMON_LIST.find((p) => p.id === id))
                      .filter(Boolean)
                      .map((p) => (
                        <a
                          key={p!.id}
                          href={`/result/${p!.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            router.push(`/result/${p!.id}`)
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            color: '#fff',
                            textDecoration: 'none',
                            fontSize: '0.85em',
                          }}
                        >
                          <img
                            src={p!.imageUrl}
                            alt={p!.name}
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain' }}
                          />
                          <span>{p!.name}</span>
                        </a>
                      ))}
                  </div>
                </div>
              )}
              {(mbtiData.bad_match_pokemon_ids?.length ?? 0) > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9em', color: '#f44336', marginBottom: '0.5rem' }}>
                    {(t.resultContent as Record<string, string>).mbtiBadMatch ?? '궁합 나쁜 포켓몬'}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {mbtiData.bad_match_pokemon_ids
                      .map((id) => POKEMON_LIST.find((p) => p.id === id))
                      .filter(Boolean)
                      .map((p) => (
                        <a
                          key={p!.id}
                          href={`/result/${p!.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            router.push(`/result/${p!.id}`)
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            color: '#fff',
                            textDecoration: 'none',
                            fontSize: '0.85em',
                          }}
                        >
                          <img
                            src={p!.imageUrl}
                            alt={p!.name}
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain' }}
                          />
                          <span>{p!.name}</span>
                        </a>
                      ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => router.push('/pokedex')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85em',
                    background: 'rgba(100,108,255,0.2)',
                    border: '1px solid #646cff',
                    color: '#646cff',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  {(t.resultContent as Record<string, string>).mbtiViewPokedex ?? '도감에서 보기'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <KakaoShareButton
                  pokemon={pokemon}
                  mbtiCode={mbtiData?.code ?? null}
                  variant="secondary"
                />
                <NativeShareButton
                  pokemon={pokemon}
                  mbtiCode={mbtiData?.code ?? null}
                  variant="secondary"
                />
              </div>
              </div>
              </>
            )}
              </>
            )}
          </div>
        )}
      </div>

      <aside aria-label="광고" style={{ margin: '1.5rem auto', maxWidth: 640, minHeight: 90, display: 'flex', justifyContent: 'center' }}>
        <AdSenseSlot slot="7390261701" format="horizontal" />
      </aside>

      <div className="result-save-image-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <KakaoShareButton pokemon={pokemon} mbtiCode={mbtiData?.code ?? null} />
          <NativeShareButton pokemon={pokemon} mbtiCode={mbtiData?.code ?? null} />
        </div>
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
                      alt={`진화 과정: ${stage.koreanName}`}
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
