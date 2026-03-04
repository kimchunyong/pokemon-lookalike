// 클라이언트 사이드에서만 사용되는 TensorFlow.js 유틸리티
'use client'

import * as tf from '@tensorflow/tfjs'

let featureModel: tf.LayersModel | null = null

/**
 * MobileNet v2 모델을 로드하고, 최종 분류층 대신
 * 중간 특징층(global_average_pooling2d)의 출력을 반환하는 모델을 생성한다.
 * 이렇게 하면 1000-class softmax 확률이 아닌 1280차원 시각적 특징 벡터를 얻을 수 있어
 * 사람 얼굴 ↔ 포켓몬 일러스트 간에도 의미 있는 유사도가 나온다.
 */
async function loadModel(): Promise<tf.LayersModel | null> {
  if (featureModel) return featureModel

  try {
    const modelUrl =
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json'
    const fullModel = await tf.loadLayersModel(modelUrl)

    const featureLayer = fullModel.layers.find((l) => l.name === 'global_average_pooling2d_1')

    if (featureLayer) {
      featureModel = tf.model({
        inputs: fullModel.input,
        outputs: featureLayer.output as tf.SymbolicTensor,
      })
    } else {
      const poolLayer = [...fullModel.layers]
        .reverse()
        .find((l) => l.name.includes('global_average_pooling') || l.name.includes('avg_pool'))

      if (poolLayer) {
        featureModel = tf.model({
          inputs: fullModel.input,
          outputs: poolLayer.output as tf.SymbolicTensor,
        })
      } else {
        const secondToLast = fullModel.layers[fullModel.layers.length - 2]
        featureModel = tf.model({
          inputs: fullModel.input,
          outputs: secondToLast.output as tf.SymbolicTensor,
        })
      }
    }

    return featureModel
  } catch (error) {
    console.error('모델 로드 실패:', error)
    console.warn('MobileNet v2 모델 로드 실패, 간단한 방법 사용')
    return null
  }
}

/**
 * 이미지를 텐서로 변환하고 전처리
 */
function preprocessImage(imageElement: HTMLImageElement) {
  return tf.tidy(() => {
    let tensor = tf.browser.fromPixels(imageElement)
    const resized = tf.image.resizeBilinear(tensor, [224, 224])
    const normalized = resized.div(255.0)
    const batched = normalized.expandDims(0)
    return batched
  })
}

/**
 * 이미지에서 특징 벡터 추출 (1280차원 시각적 특징)
 */
async function extractFeatures(imageElement: HTMLImageElement) {
  const loadedModel = await loadModel()

  return tf.tidy(() => {
    const preprocessed = preprocessImage(imageElement)

    if (loadedModel) {
      try {
        const output = loadedModel.predict(preprocessed) as tf.Tensor
        const features = output.squeeze()
        return features.div(features.norm())
      } catch (error) {
        console.warn('MobileNet 특징 추출 실패, 간단한 방법 사용:', error)
        return extractSimpleFeatures(preprocessed)
      }
    }
    return extractSimpleFeatures(preprocessed)
  })
}

/**
 * 간단한 특징 추출 (Fallback)
 */
function extractSimpleFeatures(preprocessedImage: tf.Tensor) {
  return tf.tidy(() => {
    const resized = tf.image.resizeBilinear(preprocessedImage as tf.Tensor3D, [32, 32])
    const flattened = resized.reshape([-1])
    const normalized = flattened.div(flattened.norm() || 1)
    return normalized
  })
}

/**
 * 두 특징 벡터 간의 코사인 유사도 계산
 */
function cosineSimilarity(vec1: tf.Tensor, vec2: tf.Tensor) {
  return tf.tidy(() => {
    const dotProduct = vec1.mul(vec2).sum()
    const norm1 = vec1.norm()
    const norm2 = vec2.norm()
    const similarity = dotProduct.div(norm1.mul(norm2))
    return similarity.dataSync()[0]
  })
}

/**
 * 이미지 URL 또는 Data URL에서 이미지 요소 생성
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 코사인 유사도 원본값(보통 0.3~0.85)을 체감 유사도(0~1)로 변환.
 * 최소 기준(floor) 이하는 0, 최대 기준(ceil) 이상은 1로 매핑한다.
 */
function scaleToPerceptual(raw: number, floor = 0.3, ceil = 0.85): number {
  const clamped = Math.max(0, Math.min(1, (raw - floor) / (ceil - floor)))
  return clamped
}

/**
 * 두 이미지 간의 유사도 계산
 */
export async function compareImages(imageUrl1: string, imageUrl2: string): Promise<number> {
  try {
    const [img1, img2] = await Promise.all([
      loadImageFromUrl(imageUrl1),
      loadImageFromUrl(imageUrl2),
    ])

    const [features1, features2] = await Promise.all([extractFeatures(img1), extractFeatures(img2)])

    const raw = cosineSimilarity(features1, features2)

    features1.dispose()
    features2.dispose()

    return scaleToPerceptual(raw)
  } catch (error) {
    console.error('이미지 비교 중 오류:', error)
    throw error
  }
}

/**
 * 여러 포켓몬 이미지와 비교하여 가장 유사한 포켓몬 찾기
 */
export async function findSimilarPokemon(
  userImageUrl: string,
  pokemonList: Array<{ id: number; name: string; imageUrl: string; [key: string]: any }>
) {
  const comparisons = await Promise.all(
    pokemonList.map(async (pokemon) => {
      try {
        const similarity = await compareImages(userImageUrl, pokemon.imageUrl)
        return {
          ...pokemon,
          similarity,
        }
      } catch (error) {
        console.error(`포켓몬 ${pokemon.name} 비교 실패:`, error)
        return {
          ...pokemon,
          similarity: 0,
        }
      }
    })
  )

  return comparisons.sort((a, b) => b.similarity - a.similarity)
}
