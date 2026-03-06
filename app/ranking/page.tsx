'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const ARTWORK_URL = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

type RankingRow = {
  id: string
  user_id: string
  pokemon_id: number
  pokemon_name: string
  similarity: number
  display_name: string | null
  created_at: string
  updated_at: string
}

const CROWN_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const
const CARD_BG = [
  'linear-gradient(135deg, #3a3600 0%, #1a1800 100%)',
  'linear-gradient(135deg, #2a2a30 0%, #18181c 100%)',
  'linear-gradient(135deg, #3a2a1a 0%, #1c1408 100%)',
] as const
const CARD_BORDER = [
  'rgba(255, 215, 0, 0.5)',
  'rgba(192, 192, 192, 0.4)',
  'rgba(205, 127, 50, 0.4)',
] as const

function TopThreeCard({
  row,
  rank,
  unknownLabel,
}: {
  row: RankingRow
  rank: number
  unknownLabel: string
}) {
  const isFirst = rank === 0
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: isFirst ? 160 : 130,
        order: rank === 0 ? 1 : rank === 1 ? 0 : 2,
        marginTop: isFirst ? 0 : 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: isFirst ? 28 : 22 }}>
          {rank === 0 ? '👑' : rank === 1 ? '🥈' : '🥉'}
        </span>
      </div>

      <div
        style={{
          background: CARD_BG[rank],
          border: `2px solid ${CARD_BORDER[rank]}`,
          borderRadius: 16,
          padding: '1rem 0.6rem 0.8rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: isFirst
            ? '0 0 24px rgba(255, 215, 0, 0.15)'
            : '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        <img
          src={ARTWORK_URL(row.pokemon_id)}
          alt={row.pokemon_name}
          width={isFirst ? 80 : 64}
          height={isFirst ? 80 : 64}
          style={{ objectFit: 'contain', marginBottom: 8 }}
        />
        <div
          style={{
            fontWeight: 700,
            fontSize: isFirst ? '0.95em' : '0.85em',
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.3,
            wordBreak: 'keep-all',
            marginBottom: 4,
          }}
        >
          {row.display_name ?? unknownLabel}
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: isFirst ? '1.05em' : '0.9em',
            color: CROWN_COLORS[rank],
            marginBottom: 4,
          }}
        >
          {(Number(row.similarity) * 100).toFixed(1)}%
        </div>
        <div
          style={{
            fontSize: '0.72em',
            color: '#aaa',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '2px 10px',
          }}
        >
          {row.pokemon_name}
        </div>
      </div>
    </div>
  )
}

function RankingListItem({
  row,
  rank,
  unknownLabel,
}: {
  row: RankingRow
  rank: number
  unknownLabel: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.7rem 1rem',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          width: 36,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '1em', color: '#888' }}>{rank + 1}</span>
      </div>
      <img
        src={ARTWORK_URL(row.pokemon_id)}
        alt={row.pokemon_name}
        width={40}
        height={40}
        style={{
          objectFit: 'contain',
          flexShrink: 0,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.95em', color: '#fff' }}>
          {row.display_name ?? unknownLabel}
        </div>
        <div style={{ fontSize: '0.78em', color: '#777' }}>{row.pokemon_name}</div>
      </div>
      <span
        style={{
          flexShrink: 0,
          fontWeight: 700,
          fontSize: '1em',
          color: '#646cff',
        }}
      >
        {(Number(row.similarity) * 100).toFixed(1)}%
      </span>
    </div>
  )
}

export default function RankingPage() {
  const { t } = useLanguage()
  const [list, setList] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('lookalike_ranking')
        .select(
          'id, user_id, pokemon_id, pokemon_name, similarity, display_name, created_at, updated_at'
        )
        .order('similarity', { ascending: false })
        .limit(100)
      if (!error) setList((data as RankingRow[]) ?? [])
      setLoading(false)
    }
    fetchRanking()
  }, [])

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center', marginTop: '90px' }}>
        <p>{t.ranking.loading}</p>
      </main>
    )
  }

  const top3 = list.slice(0, 3)
  const rest = list.slice(3)

  return (
    <main style={{ padding: '1.5rem', maxWidth: 520, margin: '90px auto 2rem', minHeight: 'calc(100vh - 314px)' }}>
      <h1 style={{ marginBottom: '0.25rem', color: '#fff', textAlign: 'center' }}>
        {t.ranking.title}
      </h1>
      <p
        style={{
          color: '#888',
          fontSize: '0.85em',
          marginBottom: '1.8rem',
          textAlign: 'center',
        }}
      >
        {t.ranking.subtitle}
      </p>

      {list.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#888',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
          }}
        >
          <p style={{ fontSize: '1em', marginBottom: '0.5rem' }}>{t.ranking.emptyTitle}</p>
          <p style={{ fontSize: '0.9em' }}>
            <Link href="/image-compare" style={{ color: '#646cff', textDecoration: 'underline' }}>
              {t.ranking.emptyAction}
            </Link>
            {t.ranking.emptyHint}
          </p>
        </div>
      ) : (
        <>
          {top3.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '0.6rem',
                marginBottom: '2rem',
                padding: '0 0.5rem',
              }}
            >
              {top3.map((row, i) => (
                <TopThreeCard
                  key={row.id}
                  row={row}
                  rank={i}
                  unknownLabel={t.common.unknown}
                />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {rest.map((row, i) => (
                <RankingListItem
                  key={row.id}
                  row={row}
                  rank={i + 3}
                  unknownLabel={t.common.unknown}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
