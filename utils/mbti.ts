/**
 * 닮은꼴 포켓몬 기반 MBTI 유추 (재미 목적).
 * 포켓몬 타입·설명·감정으로 결정적으로 한 유형을 고릅니다.
 */

const MBTI_CODES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
] as const

function hash(s: string): number {
  return s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

/** 포켓몬 타입 문자열에서 첫 번째 타입만 사용 (예: "풀/독" → "풀") */
function primaryType(typeStr: string): string {
  return (typeStr || '노말').split('/')[0].trim() || '노말'
}

/**
 * 포켓몬과 감정으로 MBTI 코드를 결정적으로 유추합니다.
 * 같은 포켓몬 + 같은 감정이면 항상 같은 유형이 나옵니다.
 */
export function inferMbtiCode(
  pokemon: { id: number; type: string; description?: string },
  emotion: string | null
): string {
  const typePart = primaryType(pokemon.type)
  const emotionPart = emotion || 'neutral'
  const descPart = (pokemon.description || '').slice(0, 50)
  const combined = `${pokemon.id}-${typePart}-${emotionPart}-${descPart}`
  const idx = Math.abs(hash(combined)) % MBTI_CODES.length
  return MBTI_CODES[idx]
}

export type PersonalityStats = {
  cuteness: number
  attack: number
  friendliness: number
  intelligence: number
  laziness: number
}

export type MbtiTypeRow = {
  code: string
  name_ko: string
  description: string
  color_hex: string
  good_match_pokemon_ids: number[]
  bad_match_pokemon_ids: number[]
  sort_order: number
  personality_stats?: PersonalityStats
  fantasy_match_pokemon_id?: number | null
}
