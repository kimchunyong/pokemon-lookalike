import * as tf from '@tensorflow/tfjs'

let model = null

/**
 * MobileNet 모델 로드
 */
async function loadModel() {
  if (model) return model

  try {
    // MobileNet 모델 로드 (이미지 특징 추출용)
    // @tensorflow-models/mobilenet을 사용하거나 직접 모델 로드
    const modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json'
    model = await tf.loadLayersModel(modelUrl)
    
    // 모델이 제대로 로드되었는지 확인
    if (!model) {
      throw new Error('모델 로드 실패')
    }
    
    return model
  } catch (error) {
    console.error('모델 로드 실패:', error)
    // Fallback: 간단한 특징 추출 방법 사용
    console.warn('MobileNet 모델 로드 실패, 간단한 방법 사용')
    return null
  }
}

/**
 * 이미지를 텐서로 변환하고 전처리
 */
function preprocessImage(imageElement) {
  return tf.tidy(() => {
    // 이미지를 텐서로 변환
    let tensor = tf.browser.fromPixels(imageElement)
    
    // MobileNet 입력 크기로 리사이즈 (224x224)
    const resized = tf.image.resizeBilinear(tensor, [224, 224])
    
    // 정규화 (0-255 -> 0-1)
    const normalized = resized.div(255.0)
    
    // 배치 차원 추가
    const batched = normalized.expandDims(0)
    
    return batched
  })
}

/**
 * 이미지에서 특징 벡터 추출
 */
async function extractFeatures(imageElement) {
  const loadedModel = await loadModel()
  
  return tf.tidy(() => {
    const preprocessed = preprocessImage(imageElement)
    
    if (loadedModel) {
      try {
        // MobileNet 모델 사용
        // 모델의 출력을 특징 벡터로 사용 (1000차원)
        const predictions = loadedModel.predict(preprocessed)
        
        // 특징 벡터로 사용 (정규화)
        const features = predictions.squeeze()
        const normalized = features.div(features.norm())
        
        return normalized
      } catch (error) {
        console.warn('MobileNet 특징 추출 실패, 간단한 방법 사용:', error)
        // Fallback: 간단한 특징 추출
        return extractSimpleFeatures(preprocessed)
      }
    } else {
      // Fallback: 간단한 특징 추출
      return extractSimpleFeatures(preprocessed)
    }
  })
}

/**
 * 간단한 특징 추출 (Fallback)
 * 이미지를 작은 크기로 리사이즈하고 평탄화
 */
function extractSimpleFeatures(preprocessedImage) {
  return tf.tidy(() => {
    // 이미지를 32x32로 리사이즈하여 특징 추출
    const resized = tf.image.resizeBilinear(preprocessedImage, [32, 32])
    const flattened = resized.reshape([-1])
    
    // 정규화
    const normalized = flattened.div(flattened.norm() || 1)
    
    return normalized
  })
}

/**
 * 두 특징 벡터 간의 코사인 유사도 계산
 */
function cosineSimilarity(vec1, vec2) {
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
function loadImageFromUrl(url) {
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
 * @param {string} imageUrl1 - 첫 번째 이미지 URL (업로드된 이미지)
 * @param {string} imageUrl2 - 두 번째 이미지 URL (포켓몬 이미지)
 * @returns {Promise<number>} 유사도 점수 (0-1)
 */
export async function compareImages(imageUrl1, imageUrl2) {
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
    
    // 메모리 정리
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
 * @param {string} userImageUrl - 사용자가 업로드한 이미지 URL
 * @param {Array} pokemonList - 포켓몬 목록 [{ id, name, imageUrl, ... }]
 * @returns {Promise<Array>} 유사도 점수와 함께 정렬된 포켓몬 목록
 */
export async function findSimilarPokemon(userImageUrl, pokemonList) {
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

  // 유사도 순으로 정렬
  return comparisons.sort((a, b) => b.similarity - a.similarity)
}
