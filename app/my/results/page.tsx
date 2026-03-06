'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { POKEMON_LIST } from '@/data/pokemon'

declare global {
  interface Window {
    Kakao: any
  }
}

interface ResultRow {
  id: string
  pokemon_id: number
  pokemon_name: string
  similarity: number
  emotion: string | null
  emotion_probability: number | null
  created_at: string
}

interface GroupedResult {
  date: string
  rows: ResultRow[]
}

const ARTWORK_URL = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

const LOCALE_MAP: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
}

const formatDate = (iso: string, locale: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString(LOCALE_MAP[locale] ?? 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const groupByDate = (rows: ResultRow[], locale: string): GroupedResult[] => {
  const map = new Map<string, ResultRow[]>()
  rows.forEach((r) => {
    const key = new Date(r.created_at).toLocaleDateString(LOCALE_MAP[locale] ?? 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const arr = map.get(key) ?? []
    arr.push(r)
    map.set(key, arr)
  })
  return Array.from(map.entries()).map(([date, rows]) => ({ date, rows }))
}

export default function MyResultsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [rankingId, setRankingId] = useState<string | null>(null)
  const [currentRanking, setCurrentRanking] = useState<{ pokemon_id: number; similarity: number } | null>(null)

  const fetchResults = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const [{ data: resultsData }, { data: rankingData }] = await Promise.all([
      supabase
        .from('user_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('lookalike_ranking')
        .select('pokemon_id, similarity')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
    setResults((resultsData as ResultRow[]) ?? [])
    const rd = rankingData as { pokemon_id: number; similarity: number } | null
    setCurrentRanking(rd ? { pokemon_id: rd.pokemon_id, similarity: Number(rd.similarity) } : null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    fetchResults()
  }, [user, authLoading, router, fetchResults])

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized() && key) {
      window.Kakao.init(key)
    }
  }, [])

  const handleKakaoShare = useCallback((r: ResultRow) => {
    if (!window.Kakao?.isInitialized()) {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
      if (key) window.Kakao.init(key)
    }
    if (!window.Kakao?.isInitialized()) {
      alert(t.myResults.kakaoInitFail)
      return
    }

    const pokemon = POKEMON_LIST.find((p) => p.id === r.pokemon_id)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const resultUrl = `${origin}/result/${r.pokemon_id}?similarity=${r.similarity}${r.emotion ? `&emotion=${r.emotion}` : ''}`

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `나는 ${r.pokemon_name}를 닮았어요! (${(r.similarity * 100).toFixed(1)}%)`,
        description: pokemon?.description ?? `유사도 ${(r.similarity * 100).toFixed(1)}%`,
        imageUrl: ARTWORK_URL(r.pokemon_id),
        link: { mobileWebUrl: resultUrl, webUrl: resultUrl },
      },
      buttons: [
        {
          title: t.myResults.tryMe,
          link: { mobileWebUrl: `${origin}/image-compare`, webUrl: `${origin}/image-compare` },
        },
      ],
    })
  }, [t])

  const handleRankingRegister = useCallback(
    async (r: ResultRow) => {
      if (!user) return
      setRankingId(r.id)
      const supabase = createClient()
      let displayName = ''
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('nickname, raw_user_meta_data, email')
          .eq('id', user.id)
          .single()
        if (profile) {
          const p = profile as { nickname?: string | null; raw_user_meta_data?: { full_name?: string; name?: string } | null; email?: string | null }
          const nickname = p.nickname?.trim()
          const meta = p.raw_user_meta_data
          displayName = nickname || meta?.full_name || meta?.name || p.email || '알 수 없음'
        }
      } catch {
        displayName = user.email ?? '알 수 없음'
      }
      const { error } = await supabase.from('lookalike_ranking').upsert(
        {
          user_id: user.id,
          pokemon_id: r.pokemon_id,
          pokemon_name: r.pokemon_name,
          similarity: r.similarity,
          display_name: displayName || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      if (error) {
        alert(t.myResults.rankingRegisterFail)
      } else {
        setCurrentRanking({ pokemon_id: r.pokemon_id, similarity: r.similarity })
        alert(t.myResults.rankingRegisterSuccess)
        router.push('/ranking')
      }
      setRankingId(null)
    },
    [user, router, t]
  )

  const isAlreadyRegistered = (r: ResultRow) =>
    currentRanking != null &&
    r.pokemon_id === currentRanking.pokemon_id &&
    Math.round(r.similarity * 10000) === Math.round(currentRanking.similarity * 10000)

  const isRankingDisabled = (r: ResultRow) =>
    rankingId === r.id || isAlreadyRegistered(r)

  const handleDelete = async (id: string) => {
    if (!confirm(t.myResults.deleteConfirm)) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('user_results').delete().eq('id', id)
    setResults((prev) => prev.filter((r) => r.id !== id))
    setDeleting(null)
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '90px' }}>
        {t.common.loadingShort}
      </div>
    )
  }

  const grouped = groupByDate(results, locale)
  const emotionMap: Record<string, string> = {
    happy: t.myResults.emotion.happy,
    sad: t.myResults.emotion.sad,
    angry: t.myResults.emotion.angry,
    surprised: t.myResults.emotion.surprised,
    disgusted: t.myResults.emotion.disgusted,
    fearful: t.myResults.emotion.fearful,
    neutral: t.myResults.emotion.neutral,
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 700, margin: '90px auto 0' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>{t.myResults.title}</h1>
      <p style={{ color: '#888', fontSize: '0.9em', marginBottom: '1.5rem' }}>
        {t.myResults.subtitle}
      </p>

      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999' }}>
          <p style={{ fontSize: '1.1em', marginBottom: '1rem' }}>{t.myResults.empty}</p>
          <Link
            href="/image-compare"
            style={{
              color: '#1976d2',
              textDecoration: 'underline',
            }}
          >
            {t.myResults.goAnalyze} →
          </Link>
        </div>
      ) : (
        grouped.map((group) => (
          <section key={group.date} style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '0.95em',
                color: '#555',
                borderBottom: '1px solid #eee',
                paddingBottom: '0.4rem',
                marginBottom: '0.8rem',
              }}
            >
              {group.date}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {group.rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #eee',
                    borderRadius: 8,
                  }}
                >
                  <img
                    src={ARTWORK_URL(r.pokemon_id)}
                    alt={`포켓몬 닮은꼴 테스트 결과: ${r.pokemon_name}`}
                    width={56}
                    height={56}
                    style={{ objectFit: 'contain', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95em' }}>
                      {r.emotion && (
                        <span style={{ color: '#646cff', marginRight: 4 }}>
                          {emotionMap[r.emotion] ?? r.emotion}
                        </span>
                      )}
                      {r.pokemon_name}
                    </div>
                    <div style={{ fontSize: '0.82em', color: '#888' }}>
                      {t.myResults.similarityLabel} {(r.similarity * 100).toFixed(1)}%
                      {r.emotion_probability != null &&
                        ` · ${t.myResults.emotionProbability} ${(r.emotion_probability * 100).toFixed(0)}%`}
                    </div>
                    <div style={{ fontSize: '0.75em', color: '#aaa' }}>
                      {formatDate(r.created_at, locale)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleKakaoShare(r)}
                      style={{
                        background: '#FEE500',
                        border: 'none',
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.75em',
                        color: '#000',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <img
                        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_small.png"
                        alt="카카오톡으로 공유하기"
                        width={14}
                        height={14}
                      />
                      {t.myResults.share}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRankingRegister(r)}
                      disabled={isRankingDisabled(r)}
                      style={{
                        background: isRankingDisabled(r) ? 'rgba(255,255,255,0.06)' : 'rgba(255, 152, 0, 0.15)',
                        border: `1px solid ${isRankingDisabled(r) ? '#555' : '#ff9800'}`,
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                        cursor: isRankingDisabled(r) ? 'default' : 'pointer',
                        fontSize: '0.75em',
                        color: isRankingDisabled(r) ? '#666' : '#ff9800',
                        fontWeight: 600,
                      }}
                    >
                      {rankingId === r.id
                        ? t.myResults.registering
                        : isAlreadyRegistered(r)
                          ? t.myResults.registered
                          : t.resultContent.registerRanking}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      style={{
                        background: 'none',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        color: '#c62828',
                      }}
                    >
                      {deleting === r.id ? '...' : t.myResults.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

    </main>
  )
}
