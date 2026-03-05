/**
 * MobileNet v2로 포켓몬 1·2·3세대 386마리의 이미지 임베딩을 사전 계산하여 JSON으로 저장한다.
 * 클라이언트에서 사용하는 것과 동일한 모델/전처리를 사용하여 일관성을 보장한다.
 *
 * 사용법: node scripts/generate-mobilenet-embeddings.js
 * 결과물: data/pokemon-mobilenet-embeddings.json
 */

import * as tf from '@tensorflow/tfjs'

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '..', 'data', 'pokemon-mobilenet-embeddings.json')
const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json'
const TOTAL = 386

const IMG_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

async function fetchImageAsTensor(url) {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const { PNG } = await import('pngjs')

  return new Promise((resolve, reject) => {
    new PNG().parse(Buffer.from(buffer), (err, data) => {
      if (err) return reject(err)

      const { width, height } = data
      const rgb = new Float32Array(width * height * 3)
      for (let i = 0; i < width * height; i++) {
        rgb[i * 3] = data.data[i * 4] / 255.0
        rgb[i * 3 + 1] = data.data[i * 4 + 1] / 255.0
        rgb[i * 3 + 2] = data.data[i * 4 + 2] / 255.0
      }

      const tensor = tf.tensor3d(rgb, [height, width, 3])
      const resized = tf.image.resizeBilinear(tensor, [224, 224])
      const batched = resized.expandDims(0)
      tensor.dispose()
      resized.dispose()
      resolve(batched)
    })
  })
}

async function main() {
  console.log('MobileNet v2 모델 로딩 중...')
  const fullModel = await tf.loadLayersModel(MODEL_URL)

  const featureLayer = fullModel.layers.find((l) => l.name === 'global_average_pooling2d_1')
    ?? [...fullModel.layers].reverse().find(
      (l) => l.name.includes('global_average_pooling') || l.name.includes('avg_pool')
    )

  if (!featureLayer) {
    console.error('특징 추출 레이어를 찾을 수 없습니다')
    process.exit(1)
  }

  const featureModel = tf.model({
    inputs: fullModel.input,
    outputs: featureLayer.output,
  })
  console.log(`모델 로드 완료! 특징 레이어: ${featureLayer.name}`)

  const embeddings = {}
  let success = 0
  let fail = 0

  for (let id = 1; id <= TOTAL; id++) {
    try {
      const url = IMG_URL(id)
      const input = await fetchImageAsTensor(url)
      const output = featureModel.predict(input)
      const features = output.squeeze()
      const normalized = features.div(features.norm())
      const vec = Array.from(await normalized.data()).map((v) => Math.round(v * 1e6) / 1e6)

      embeddings[String(id)] = vec
      success++

      input.dispose()
      output.dispose()
      features.dispose()
      normalized.dispose()

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
