'use client'

import type { PersonalityStats } from '@/utils/mbti'

const LABELS: { key: keyof PersonalityStats; label: string }[] = [
  { key: 'cuteness', label: '귀여움' },
  { key: 'attack', label: '공격력' },
  { key: 'friendliness', label: '친화력' },
  { key: 'intelligence', label: '지능' },
  { key: 'laziness', label: '게으름' },
]

const DEFAULT_STATS: PersonalityStats = {
  cuteness: 50,
  attack: 50,
  friendliness: 50,
  intelligence: 50,
  laziness: 50,
}

interface MbtiPentagonChartProps {
  stats: PersonalityStats
  color?: string
  size?: number
}

export default function MbtiPentagonChart({ stats, color = '#646cff', size = 160 }: MbtiPentagonChartProps) {
  const s = { ...DEFAULT_STATS, ...stats }
  const cx = size / 2
  const cy = size / 2
  const rMax = size * 0.38

  const toPoint = (i: number, value: number) => {
    const angleDeg = i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    const r = (value / 100) * rMax
    return {
      x: cx + r * Math.sin(angleRad),
      y: cy - r * Math.cos(angleRad),
    }
  }

  const values = LABELS.map(({ key }) => Math.min(100, Math.max(0, s[key] ?? 50)))
  const points = values.map((v, i) => toPoint(i, v))
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  const axisEnds = LABELS.map((_, i) => toPoint(i, 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* 배경 오각형 (100% 그리드) */}
        <polygon
          points={axisEnds.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        {/* 데이터 오각형 */}
        <polygon
          points={polygonPoints}
          fill={`${color}40`}
          stroke={color}
          strokeWidth="2"
        />
        {/* 축 레이블 */}
        {LABELS.map(({ label }, i) => {
          const end = axisEnds[i]
          const labelR = rMax + 14
          const angleRad = (i * 72 * Math.PI) / 180
          const lx = cx + labelR * Math.sin(angleRad)
          const ly = cy - labelR * Math.cos(angleRad)
          return (
            <text
              key={label}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="10"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
