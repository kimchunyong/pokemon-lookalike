'use client'

/** 포켓몬 타입(한글) → 대표 RGB [0-255] */
const TYPE_TO_COLOR: Record<string, [number, number, number]> = {
  노말: [200, 190, 180],
  불꽃: [240, 120, 40],
  물: [80, 140, 220],
  풀: [100, 200, 80],
  전기: [250, 220, 60],
  얼음: [140, 220, 240],
  격투: [180, 80, 60],
  독: [160, 80, 160],
  땅: [180, 140, 90],
  비행: [160, 180, 220],
  에스퍼: [220, 120, 200],
  벌레: [160, 190, 60],
  바위: [160, 150, 120],
  고스트: [100, 90, 140],
  드래곤: [120, 100, 220],
  악: [100, 90, 80],
  강철: [180, 180, 200],
  페어리: [240, 180, 200],
}

/**
 * data URL 또는 이미지 URL에서 dominant color 최대 n개 추출 (브라우저 전제).
 * 샘플 픽셀을 4비트 양자화 버킷으로 묶어 상위 버킷의 평균 RGB 반환.
 */
export function extractDominantColorsFromImageUrl(
  imageUrl: string,
  n = 3
): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 64
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve([])
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        const data = ctx.getImageData(0, 0, size, size).data

        const bucketKey = (r: number, g: number, b: number) =>
          (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4)
        const buckets: Record<
          number,
          { sumR: number; sumG: number; sumB: number; count: number }
        > = {}

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          if (a < 128) continue
          const k = bucketKey(r, g, b)
          if (!buckets[k]) buckets[k] = { sumR: 0, sumG: 0, sumB: 0, count: 0 }
          buckets[k].sumR += r
          buckets[k].sumG += g
          buckets[k].sumB += b
          buckets[k].count += 1
        }

        const entries = Object.entries(buckets)
          .map(([k, v]) => ({
            key: Number(k),
            ...v,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, n)

        const colors = entries.map((e) => [
          Math.round(e.sumR / e.count),
          Math.round(e.sumG / e.count),
          Math.round(e.sumB / e.count),
        ])
        resolve(colors)
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image for color extraction'))
    img.src = imageUrl
  })
}

/**
 * 포켓몬 type 문자열(예: "풀/독")에서 1타입 기준 대표 색상 [R,G,B] 반환.
 */
export function getPokemonTypeColor(typeStr: string): [number, number, number] {
  const primary = typeStr.split('/')[0]?.trim() || '노말'
  return TYPE_TO_COLOR[primary] ?? TYPE_TO_COLOR['노말']
}

/**
 * 사용자 dominant colors와 포켓몬 대표색 1개 간 유사도. 0~1 (1 = 매우 유사).
 * 최소 거리 기반으로 정규화 (거리 0 → 1, 거리 255*sqrt(3) → 0).
 */
export function colorSimilarity(
  userColors: number[][],
  pokemonColor: [number, number, number]
): number {
  if (userColors.length === 0) return 0.5
  const maxDist = 255 * Math.sqrt(3)
  const distances = userColors.map(([r, g, b]) => {
    const dr = r - pokemonColor[0]
    const dg = g - pokemonColor[1]
    const db = b - pokemonColor[2]
    return Math.sqrt(dr * dr + dg * dg + db * db)
  })
  const minDist = Math.min(...distances)
  return Math.max(0, 1 - minDist / maxDist)
}
