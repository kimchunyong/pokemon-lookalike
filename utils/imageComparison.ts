// 클라이언트 사이드에서만 사용되는 TensorFlow.js 유틸리티
'use client'

import * as tf from '@tensorflow/tfjs'

let model: tf.LayersModel | null = null

/**
 * MobileNet 모델 로드
 */
async function loadModel(): Promise<tf.LayersModel | null> {
  if (model) return model

  try {
    // MobileNet 모델 로드 (이미지 특징 추출용)
    const modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json'
    model = await tf.loadLayersModel(modelUrl)
    
    if (!model) {
      throw new Error('모델 로드 실패')
    }
    
    return model
  } catch (error) {
    console.error('모델 로드 실패:', error)
    console.warn('MobileNet 모델 로드 실패, 간단한 방법 사용')
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
 * 이미지에서 특징 벡터 추출
 */
async function extractFeatures(imageElement: HTMLImageElement) {
  const loadedModel = await loadModel()
  
  return tf.tidy(() => {
    const preprocessed = preprocessImage(imageElement)
    
    if (loadedModel) {
      try {
        const predictions = loadedModel.predict(preprocessed) as tf.Tensor
        const features = predictions.squeeze()
        const normalized = features.div(features.norm())
        return normalized
      } catch (error) {
        console.warn('MobileNet 특징 추출 실패, 간단한 방법 사용:', error)
        return extractSimpleFeatures(preprocessed)
      }
    } else {
      return extractSimpleFeatures(preprocessed)
    }
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
 * 두 이미지 간의 유사도 계산
 */
export async function compareImages(
  imageUrl1: string,
  imageUrl2: string
): Promise<number> {
  try {
    const [img1, img2] = await Promise.all([
      loadImageFromUrl(imageUrl1),
      loadImageFromUrl(imageUrl2),
    ])

    const [features1, features2] = await Promise.all([
      extractFeatures(img1),
      extractFeatures(img2),
    ])

    const similarity = cosineSimilarity(features1, features2)
    
    features1.dispose()
    features2.dispose()

    return similarity
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
