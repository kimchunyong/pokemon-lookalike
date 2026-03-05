/**
 * 포켓몬 151마리의 CLIP 이미지 임베딩을 사전 계산하여 JSON으로 저장한다.
 *
 * 사용법: node scripts/generate-pokemon-embeddings.js
 *
 * 결과물: data/pokemon-embeddings.json
 *   { "1": [0.012, -0.034, ...], "2": [...], ... }
 *   키: 포켓몬 ID(문자열), 값: 512차원 float 배열
 */

import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@huggingface/transformers'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MODEL_ID = 'Xenova/clip-vit-base-patch16'
const OUTPUT_PATH = resolve(__dirname, '..', 'data', 'pokemon-embeddings.json')
const TOTAL = 151

const IMG_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

async function main() {
  console.log('CLIP 모델 로딩 중...')
  const processor = await AutoProcessor.from_pretrained(MODEL_ID)
  const model = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID)
  console.log('모델 로드 완료!')

  const embeddings = {}
  let success = 0
  let fail = 0

  for (let id = 1; id <= TOTAL; id++) {
    try {
      const url = IMG_URL(id)
      const image = await RawImage.read(url)
      const inputs = await processor(image)
      const { image_embeds } = await model(inputs)

      const vec = Array.from(image_embeds.data).map((v) => Math.round(v * 1e6) / 1e6)
      embeddings[String(id)] = vec
      success++
      process.stdout.write(`\r[${success + fail}/${TOTAL}] #${id} OK`)
    } catch (err) {
      fail++
      process.stdout.write(`\r[${success + fail}/${TOTAL}] #${id} FAIL: ${err.message}`)
    }
  }

  console.log(`\n\n완료: 성공 ${success}, 실패 ${fail}`)
  console.log(`임베딩 차원: ${Object.values(embeddings)[0]?.length ?? 'N/A'}`)

  writeFileSync(OUTPUT_PATH, JSON.stringify(embeddings), 'utf-8')
  console.log(`저장 완료: ${OUTPUT_PATH}`)
}

main().catch(console.error)
