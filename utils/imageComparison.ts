'use client'

import pokemonEmbeddingsRaw from '../data/pokemon-embeddings.json'

const pokemonEmbeddings: Record<string, number[]> = pokemonEmbeddingsRaw as Record<string, number[]>

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
 * 151마리 전체의 raw 유사도 분포를 기반으로 동적 스케일링.
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

export async function findSimilarPokemon(
  userImageUrl: string,
  pokemonList: Array<{ id: number; name: string; imageUrl: string; [key: string]: any }>
) {
  const userEmbedding = await extractCLIPEmbedding(userImageUrl)

  const rawResults = pokemonList.map((pokemon) => {
    const pokemonEmb = pokemonEmbeddings[String(pokemon.id)]
    const raw = pokemonEmb ? cosineSimilarity(userEmbedding, pokemonEmb) : -1
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
    '[CLIP] top5:',
    sorted.slice(0, 5).map((p) => `${p.name} raw=${p.raw.toFixed(4)} → ${(p.similarity * 100).toFixed(1)}%`),
    'bottom5:',
    sorted.slice(-5).map((p) => `${p.name} raw=${p.raw.toFixed(4)} → ${(p.similarity * 100).toFixed(1)}%`)
  )

  return sorted
}
