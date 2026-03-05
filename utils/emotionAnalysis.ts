let faceapi: any = null
let modelsLoaded = false

/**
 * face-api.js 모델을 로드합니다.
 */
export async function loadEmotionModels() {
  if (modelsLoaded && faceapi) return

  const MODEL_URL = '/models'

  try {
    if (!faceapi) {
      faceapi = await import('@vladmandic/face-api')
    }

    // @ts-ignore
    await faceapi.tf.setBackend('webgl')
    // @ts-ignore
    await faceapi.tf.ready()

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ])
    modelsLoaded = true
    console.log('Emotion models loaded')
  } catch (error) {
    console.error('Failed to load emotion models:', error)
    throw error
  }
}

export interface EmotionResult {
  expression: string
  probability: number
}

/**
 * 이미지에서 감정을 분석합니다.
 */
export async function analyzeEmotion(
  imageElement: HTMLImageElement
): Promise<EmotionResult | null> {
  try {
    console.log('Start analyzing emotion...')
    if (!modelsLoaded) {
      console.log('Loading models...')
      await loadEmotionModels()
    }

    // 얼굴 감지 및 표정 인식
    console.log('Detecting face...')

    // TinyFaceDetector 옵션 조정
    // inputSize: 160, 224, 320, 416, 512, 608 (32로 나누어 떨어져야 함)
    // scoreThreshold: 0.1 ~ 0.9
    const detectorOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.3,
    })

    const detections = await faceapi
      .detectSingleFace(imageElement, detectorOptions)
      .withFaceLandmarks()
      .withFaceExpressions()

    console.log('Detections:', detections)

    if (!detections) {
      console.warn('No face detected for emotion analysis')
      return null
    }

    // 가장 높은 확률의 표정 찾기
    const expressions = detections.expressions as Record<string, number>
    console.log('Expressions:', expressions)
    const sortedExpressions = Object.entries(expressions).sort((a, b) => b[1] - a[1])

    if (sortedExpressions.length > 0) {
      console.log('Top expression:', sortedExpressions[0])
      return {
        expression: sortedExpressions[0][0],
        probability: sortedExpressions[0][1],
      }
    }

    return null
  } catch (error) {
    console.error('Emotion analysis failed:', error)
    return null
  }
}

/**
 * 얼굴이 감지된 경우 얼굴 영역을 패딩해서 잘라낸 이미지의 data URL을 반환합니다.
 * 유사도 비교 시 배경·옷 등이 섞이지 않아 더 정확한 비교에 활용할 수 있습니다.
 */
export async function getFaceCroppedDataUrl(
  imageElement: HTMLImageElement
): Promise<string | null> {
  try {
    if (!modelsLoaded) await loadEmotionModels()

    const detectorOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.3,
    })
    const detection = await faceapi.detectSingleFace(imageElement, detectorOptions)
    if (!detection?.box) return null

    const pad = 0.2
    const { x, y, width, height } = detection.box
    const w = width * (1 + pad * 2)
    const h = height * (1 + pad * 2)
    const sx = Math.max(0, x - width * pad)
    const sy = Math.max(0, y - height * pad)
    const sw = Math.min(w, imageElement.naturalWidth - sx)
    const sh = Math.min(h, imageElement.naturalHeight - sy)

    const minSize = 224
    const dw = Math.max(Math.round(sw), minSize)
    const dh = Math.max(Math.round(sh), minSize)
    const canvas = document.createElement('canvas')
    canvas.width = dw
    canvas.height = dh
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(
      imageElement,
      sx, sy, sw, sh,
      0, 0, dw, dh
    )
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.warn('Face crop failed:', error)
    return null
  }
}

/**
 * 감정 분석과 얼굴 크롭을 한 번의 얼굴 검출로 수행합니다.
 * 유사도 비교에는 faceCroppedDataUrl을 사용하면 더 정확합니다.
 */
export async function analyzeEmotionAndGetFaceCrop(
  imageElement: HTMLImageElement
): Promise<{ emotion: EmotionResult | null; faceCroppedDataUrl: string | null }> {
  try {
    if (!modelsLoaded) await loadEmotionModels()

    const detectorOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.3,
    })
    const detections = await faceapi
      .detectSingleFace(imageElement, detectorOptions)
      .withFaceLandmarks()
      .withFaceExpressions()

    if (!detections) {
      return { emotion: null, faceCroppedDataUrl: null }
    }

    const expressions = detections.expressions as Record<string, number>
    const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1])
    const emotion: EmotionResult | null =
      sorted.length > 0
        ? { expression: sorted[0][0], probability: sorted[0][1] }
        : null

    const pad = 0.2
    const { x, y, width, height } = detections.detection.box
    const w = width * (1 + pad * 2)
    const h = height * (1 + pad * 2)
    const sx = Math.max(0, x - width * pad)
    const sy = Math.max(0, y - height * pad)
    const sw = Math.min(w, imageElement.naturalWidth - sx)
    const sh = Math.min(h, imageElement.naturalHeight - sy)
    const minSize = 224
    const dw = Math.max(Math.round(sw), minSize)
    const dh = Math.max(Math.round(sh), minSize)
    const canvas = document.createElement('canvas')
    canvas.width = dw
    canvas.height = dh
    const ctx = canvas.getContext('2d')
    let faceCroppedDataUrl: string | null = null
    if (ctx) {
      ctx.drawImage(
        imageElement,
        sx, sy, sw, sh,
        0, 0, dw, dh
      )
      faceCroppedDataUrl = canvas.toDataURL('image/png')
    }

    return { emotion, faceCroppedDataUrl }
  } catch (error) {
    console.warn('Emotion/face crop failed:', error)
    return { emotion: null, faceCroppedDataUrl: null }
  }
}

/**
 * 감정을 한국어로 변환합니다.
 */
export function getEmotionKorean(expression: string): string {
  const map: Record<string, string> = {
    neutral: '평온한',
    happy: '행복한',
    sad: '슬픈',
    angry: '화난',
    fearful: '두려운',
    disgusted: '역겨운',
    surprised: '놀란',
  }
  return map[expression] || expression
}
