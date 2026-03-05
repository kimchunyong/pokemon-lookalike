'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
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

const emotionMap: Record<string, string> = {
  happy: '행복',
  sad: '슬픔',
  angry: '분노',
  surprised: '놀람',
  disgusted: '혐오',
  fearful: '공포',
  neutral: '무표정',
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const groupByDate = (rows: ResultRow[]): GroupedResult[] => {
  const map = new Map<string, ResultRow[]>()
  rows.forEach((r) => {
    const key = new Date(r.created_at).toLocaleDateString('ko-KR', {
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
  const router = useRouter()
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [rankingId, setRankingId] = useState<string | null>(null)

  const fetchResults = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('user_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setResults((data as ResultRow[]) ?? [])
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
      alert('카카오톡 SDK 초기화에 실패했습니다.')
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
          title: '나도 해보기',
          link: { mobileWebUrl: `${origin}/image-compare`, webUrl: `${origin}/image-compare` },
        },
      ],
    })
  }, [])

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
        alert('랭킹 등록에 실패했습니다.')
      } else {
        alert('랭킹전에 등록되었습니다!')
        router.push('/ranking')
      }
      setRankingId(null)
    },
    [user, router]
  )

  const handleDelete = async (id: string) => {
    if (!confirm('이 결과를 삭제하시겠습니까?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('user_results').delete().eq('id', id)
    setResults((prev) => prev.filter((r) => r.id !== id))
    setDeleting(null)
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '90px' }}>불러오는 중...</div>
    )
  }

  const grouped = groupByDate(results)

  return (
    <main style={{ padding: '2rem', maxWidth: 700, margin: '90px auto 0' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>내 닮은꼴 히스토리</h1>
      <p style={{ color: '#888', fontSize: '0.9em', marginBottom: '1.5rem' }}>
        최근 100건까지 표시됩니다.
      </p>

      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999' }}>
          <p style={{ fontSize: '1.1em', marginBottom: '1rem' }}>아직 저장된 결과가 없습니다.</p>
          <Link
            href="/image-compare"
            style={{
              color: '#1976d2',
              textDecoration: 'underline',
            }}
          >
            닮은꼴 분석하러 가기 →
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
                    alt={r.pokemon_name}
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
                      유사도 {(r.similarity * 100).toFixed(1)}%
                      {r.emotion_probability != null &&
                        ` · 감정 확률 ${(r.emotion_probability * 100).toFixed(0)}%`}
                    </div>
                    <div style={{ fontSize: '0.75em', color: '#aaa' }}>
                      {formatDate(r.created_at)}
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
                        alt=""
                        width={14}
                        height={14}
                      />
                      공유
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRankingRegister(r)}
                      disabled={rankingId === r.id}
                      style={{
                        background: 'rgba(255, 152, 0, 0.15)',
                        border: '1px solid #ff9800',
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                        cursor: rankingId === r.id ? 'default' : 'pointer',
                        fontSize: '0.75em',
                        color: '#ff9800',
                        fontWeight: 600,
                      }}
                    >
                      {rankingId === r.id ? '등록 중...' : '랭킹 등록'}
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
                      {deleting === r.id ? '...' : '삭제'}
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
