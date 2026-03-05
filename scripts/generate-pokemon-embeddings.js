/**
 * 포켓몬 1·2·3세대 386마리의 CLIP 이미지 임베딩을 사전 계산하여 JSON으로 저장한다.
 *
 * 사용법:
 *   node scripts/generate-pokemon-embeddings.js           # 1~386 전체 생성
 *   node scripts/generate-pokemon-embeddings.js 252 386   # 252~386만 생성 후 기존 파일과 병합
 *
 * 결과물: data/pokemon-embeddings.json
 *   { "1": [0.012, -0.034, ...], "2": [...], ... }
 *   키: 포켓몬 ID(문자열), 값: 512차원 float 배열
 */

import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@huggingface/transformers'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MODEL_ID = 'Xenova/clip-vit-base-patch16'
const OUTPUT_PATH = resolve(__dirname, '..', 'data', 'pokemon-embeddings.json')
const TOTAL = 386

const IMG_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

const fromId = Math.max(1, parseInt(process.argv[2], 10) || 1)
const toId = Math.min(TOTAL, parseInt(process.argv[3], 10) || TOTAL)

async function main() {
  let embeddings = {}
  if (fromId > 1 && existsSync(OUTPUT_PATH)) {
    const raw = readFileSync(OUTPUT_PATH, 'utf-8')
    embeddings = JSON.parse(raw)
    console.log(`기존 임베딩 로드: ${Object.keys(embeddings).length}개, ${fromId}~${toId}만 추가 생성`)
  }

  console.log('CLIP 모델 로딩 중...')
  const processor = await AutoProcessor.from_pretrained(MODEL_ID)
  const model = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID)
  console.log('모델 로드 완료!')

  const count = toId - fromId + 1
  let success = 0
  let fail = 0

  for (let id = fromId; id <= toId; id++) {
    try {
      const url = IMG_URL(id)
      const image = await RawImage.read(url)
      const inputs = await processor(image)
      const { image_embeds } = await model(inputs)

      const vec = Array.from(image_embeds.data).map((v) => Math.round(v * 1e6) / 1e6)
      embeddings[String(id)] = vec
      success++
      process.stdout.write(`\r[${success + fail}/${count}] #${id} OK`)
    } catch (err) {
      fail++
      process.stdout.write(`\r[${success + fail}/${count}] #${id} FAIL: ${err.message}`)
    }
  }

  console.log(`\n\n완료: 성공 ${success}, 실패 ${fail}`)
  console.log(`저장 시 총 키 수: ${Object.keys(embeddings).length}`)
  console.log(`임베딩 차원: ${Object.values(embeddings)[0]?.length ?? 'N/A'}`)

  writeFileSync(OUTPUT_PATH, JSON.stringify(embeddings), 'utf-8')
  console.log(`저장 완료: ${OUTPUT_PATH}`)
}

main().catch(console.error)
