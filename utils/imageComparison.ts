'use client'

import pokemonEmbeddingsRaw from '../data/pokemon-embeddings.json'
import {
  extractDominantColorsFromImageUrl,
  getPokemonTypeColor,
  colorSimilarity,
} from './colorFeatures'

const pokemonEmbeddings: Record<string, number[]> = pokemonEmbeddingsRaw as Record<string, number[]>

/** 다중 특징 가중치: CLIP, 색상 */
const W_CLIP = 0.7
const W_COLOR = 0.3

/** 감정(face-api expression) → 보너스를 줄 포켓몬 타입 목록. 해당 타입이 있으면 raw에 곱함 */
const EMOTION_TYPE_BOOST: Record<string, string[]> = {
  happy: ['노말', '페어리'],
  angry: ['불꽃', '격투'],
  sad: ['물', '얼음'],
  surprised: ['전기', '에스퍼'],
  fearful: ['고스트', '에스퍼'],
  disgusted: ['독', '땅'],
  neutral: [],
}

/** 3위 이하 순위 변동용 스코어 노이즈 (±NOISE_SCALE/2) */
const NOISE_SCALE = 0.02

const MODEL_ID = 'Xenova/clip-vit-base-patch16'

let clipPipeline: { processor: any; model: any } | null = null

async function loadCLIP() {
  if (clipPipeline) return clipPipeline

  const { AutoProcessor, CLIPVisionModelWithProjection } = await import(
    '@huggingface/transformers'
  )

  const [processor, model] = await Promise.all([
    AutoProcessor.from_pretrained(MODEL_ID),
    CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { dtype: 'fp32' }),
  ])

  clipPipeline = { processor, model }
  return clipPipeline
}

async function extractCLIPEmbedding(imageUrl: string): Promise<number[]> {
  const { RawImage } = await import('@huggingface/transformers')
  const { processor, model } = await loadCLIP()

  const image = await RawImage.read(imageUrl)
  const inputs = await processor(image)
  const { image_embeds } = await model(inputs)

  return Array.from(image_embeds.data as Float32Array)
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * CLIP에서 특정 포켓몬이 과도하게 상위에 나올 때 raw 유사도에 적용하는 계수.
 * 1보다 작을수록 순위가 내려감. (예: 남자 사진에서 피카츄가 자주 1위로 나오는 편향 완화)
 */
/*
const OVER_REPRESENTED_PENALTY: Record<number, number> = {
  25: 0.88,  // 피카츄: 남성 얼굴과 임베딩이 자주 비슷하게 나오는 경향 완화
  172: 0.88, // 피츄: 동일 계열이라 같은 편향 완화
}
*/

/**
 * 전체 포켓몬 raw 유사도 분포를 기반으로 동적 스케일링.
 * 매 비교마다 실제 min/max를 사용하므로 사진이 달라져도 항상 자연스러운 분포가 나온다.
 *
 * - 1위: 85~95% 범위
 * - 하위권: 자연스럽게 낮아짐
 * - maxPercent: 1위에 부여할 최대 퍼센트 (기본 93%)
 * - minPercent: 꼴찌에 부여할 최소 퍼센트 (기본 15%)
 */
function dynamicScale(
  rawScores: number[],
  maxPercent = 0.93,
  minPercent = 0.15,
  power = 1.3
): number[] {
  const max = Math.max(...rawScores)
  const min = Math.min(...rawScores)
  const range = max - min

  if (range < 1e-6) return rawScores.map(() => maxPercent)

  return rawScores.map((raw) => {
    const normalized = (raw - min) / range
    const curved = Math.pow(normalized, power)
    return minPercent + (maxPercent - minPercent) * curved
  })
}

export async function compareImages(imageUrl1: string, imageUrl2: string): Promise<number> {
  try {
    const [emb1, emb2] = await Promise.all([
      extractCLIPEmbedding(imageUrl1),
      extractCLIPEmbedding(imageUrl2),
    ])
    return cosineSimilarity(emb1, emb2)
  } catch (error) {
    console.error('이미지 비교 중 오류:', error)
    throw error
  }
}

export type FindSimilarPokemonOptions = {
  emotion?: string | null
}

export async function findSimilarPokemon(
  userImageUrl: string,
  pokemonList: Array<{ id: number; name: string; type?: string; imageUrl: string; [key: string]: any }>,
  options?: FindSimilarPokemonOptions
) {
  const emotion = options?.emotion ?? null
  const boostTypes = emotion ? EMOTION_TYPE_BOOST[emotion] ?? [] : []

  const [userEmbedding, userColors] = await Promise.all([
    extractCLIPEmbedding(userImageUrl),
    extractDominantColorsFromImageUrl(userImageUrl, 3).catch(() => [] as number[][]),
  ])

  const rawResults = pokemonList.map((pokemon) => {
    const pokemonEmb = pokemonEmbeddings[String(pokemon.id)]
    const clipSim = pokemonEmb ? cosineSimilarity(userEmbedding, pokemonEmb) : -1
    const typeStr = pokemon.type ?? '노말'
    const pokemonColor = getPokemonTypeColor(typeStr)
    const colorSim = userColors.length > 0 ? colorSimilarity(userColors, pokemonColor) : 0.5
    let raw =
      clipSim >= 0
        ? W_CLIP * clipSim + W_COLOR * colorSim
        : W_COLOR * colorSim
    const emotionMult =
      boostTypes.length > 0 && typeStr.split('/').some((t) => boostTypes.includes(t.trim()))
        ? 1.05
        : 1.0
    raw *= emotionMult
    raw += (Math.random() - 0.5) * NOISE_SCALE
    /*
    const penalty = OVER_REPRESENTED_PENALTY[pokemon.id]
    if (penalty != null && raw > -1) raw *= penalty
    */
    return { ...pokemon, raw }
  })

  const rawScores = rawResults.map((r) => r.raw)
  const scaledScores = dynamicScale(rawScores)

  const results = rawResults.map((r, i) => ({
    ...r,
    similarity: scaledScores[i],
  }))

  const sorted = results.sort((a, b) => b.similarity - a.similarity)

  console.log(
    '[multi-feature] top8:',
    sorted.slice(0, 8).map((p) => `${p.name} raw=${p.raw.toFixed(4)} → ${(p.similarity * 100).toFixed(1)}%`),
    'bottom5:',
    sorted.slice(-5).map((p) => `${p.name} raw=${p.raw.toFixed(4)} → ${(p.similarity * 100).toFixed(1)}%`)
  )

  return sorted
}
