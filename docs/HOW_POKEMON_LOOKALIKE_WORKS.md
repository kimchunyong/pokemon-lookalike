# 포켓몬 닮은꼴 유추가 동작하는 방식

이 문서는 **사용자 사진 → 닮은 포켓몬 순위**가 어떻게 만들어지는지, 그리고 그 과정에서 **TensorFlow.js**와 **CLIP(이미지 임베딩)** 이 어떻게 쓰이는지 설명합니다.

---

## 1. 전체 파이프라인 요약

```
[사용자 업로드 이미지]
        ↓
① TensorFlow.js (face-api.js): 얼굴 감지 + 감정 분석 + 얼굴 크롭
        ↓
[얼굴 크롭 이미지 또는 원본] + [감정 라벨]
        ↓
② CLIP(Transformers.js): 사용자 이미지 → 512차원 임베딩
③ 색상 추출(Canvas): 사용자 이미지 → 대표 색상
        ↓
④ 포켓몬과 비교: 사전 계산된 포켓몬 임베딩 + 타입별 대표색과
   코사인 유사도(CLIP) + 색상 유사도 조합 → 감정 보너스 적용
        ↓
⑤ 동적 스케일링 → 최종 유사도 % 및 순위
```

- **닮은꼴 “수치”를 만드는 핵심**은 **CLIP 이미지 임베딩 + 색상 유사도**입니다.
- **TensorFlow.js**는 **얼굴이 어디 있는지, 어떤 표정인지**를 찾고, **그 얼굴만 잘라서** CLIP에 넘기는 단계에서 사용됩니다.

---

## 2. TensorFlow.js가 쓰이는 부분: 얼굴 감지·감정·크롭

**라이브러리**: `@vladmandic/face-api` (내부적으로 TensorFlow.js 사용)

**역할**:

1. **얼굴 검출 (TinyFaceDetector)**  
   - 사용자 사진에서 얼굴 영역 한 개를 찾습니다.  
   - TensorFlow.js WebGL 백엔드로 실행됩니다.

2. **표정 인식 (faceExpressionNet)**  
   - 검출된 얼굴에 대해 `neutral`, `happy`, `angry`, `sad` 등 **감정(표정)** 확률을 냅니다.  
   - 이 감정 라벨은 나중에 “어떤 포켓몬 타입에 살짝 가산을 줄지” 결정하는 데만 쓰입니다.

3. **얼굴 크롭**  
   - 검출된 얼굴 박스에 패딩을 붙여서 **얼굴만 잘라낸 이미지**를 만듭니다.  
   - 이 크롭 이미지를 **CLIP 유사도 계산용 입력**으로 사용합니다.  
   - 배경·옷이 덜 섞이게 해서 “얼굴끼리 닮았는지”에 더 가깝게 비교합니다.

**코드 위치**: `utils/emotionAnalysis.ts`  
- `loadEmotionModels()`: `faceapi.tf.setBackend('webgl')`, `faceapi.tf.ready()`, TinyFaceDetector / faceExpressionNet / faceLandmark68Net 로드  
- `analyzeEmotionAndGetFaceCrop()`: 한 번의 얼굴 검출로 감정 + 크롭 이미지(data URL) 반환  

**이미지 비교 페이지에서의 사용** (`app/image-compare/page.tsx`):

```ts
const { emotion: emotionResult, faceCroppedDataUrl } = await analyzeEmotionAndGetFaceCrop(img)
const imageForSimilarity = faceCroppedDataUrl ?? uploadedImage  // 얼굴 있으면 크롭, 없으면 원본
const similarPokemon = await findSimilarPokemon(imageForSimilarity, POKEMON_LIST, {
  emotion: emotionResult?.expression ?? null,
})
```

정리하면:

- **TensorFlow.js**는 “누가(얼굴), 어떤 표정인지” + “그 얼굴만 잘라낸 이미지”를 만드는 단계에서만 쓰이고,  
- **닮은꼴 점수(유사도 수치)를 직접 계산하는 것은 CLIP + 색상 유사도**입니다.

---

## 3. 닮은꼴 유사도를 만드는 부분: CLIP + 색상 (TensorFlow.js 아님)

**이미지 → 벡터(임베딩)**  
- **모델**: `Xenova/clip-vit-base-patch16` (Hugging Face Transformers.js, 브라우저에서 실행)  
- **역할**: 이미지 한 장을 **512차원 벡터**로 바꿉니다.  
- 사용자 이미지(얼굴 크롭 또는 원본)는 **실시간**으로 이 모델에 넣어서 임베딩을 구합니다.  
- 포켓몬 이미지는 **미리** 같은 CLIP으로 임베딩을 계산해 `data/pokemon-embeddings.json`에 저장해 두고, 비교 시에는 이 값을 읽기만 합니다.

**유사도 계산**  
- **코사인 유사도**: 사용자 임베딩 vs 각 포켓몬 임베딩.  
- **색상 유사도**: 사용자 이미지에서 Canvas로 대표 색을 뽑고, 포켓몬 타입별 대표색과 비교 (`utils/colorFeatures.ts`).  
- 최종 “원시 점수”는  
  `raw = 0.7 * (CLIP 코사인 유사도) + 0.3 * (색상 유사도)`  
  여기에 감정에 따른 타입 보너스(예: happy → 노말/페어리 1.05배)와 소량의 랜덤 노이즈를 넣습니다.  
- 이 원시 점수들을 **동적 스케일링**해서 1위는 대략 86~99% 구간이 되도록 하고, 나머지 순위는 그에 맞춰 %로 바꿉니다.

**코드 위치**: `utils/imageComparison.ts`  
- `extractCLIPEmbedding()`: Transformers.js로 CLIP 임베딩 추출  
- `findSimilarPokemon()`: 위 공식대로 CLIP + 색상 + 감정 보너스 + 스케일링 후 정렬

---

## 4. TensorFlow.js로 “포켓몬 닮은꼴”이 유추되는 방식 (요약)

- **TensorFlow.js**는 **포켓몬과의 유사도 수치를 직접 계산하지 않습니다.**  
- TensorFlow.js는 **입력 이미지를 “얼굴 중심”으로 정리하고, 감정 정보를 붙이는 역할**만 합니다.  
  - 얼굴 감지 → 크롭 → CLIP 입력 품질 향상  
  - 감정 인식 → 포켓몬 타입 보너스로 반영  

- **실제 “닮은꼴 유추(순위와 %)”**는  
  - **CLIP 이미지 임베딩(Transformers.js)**  
  - **색상 유사도(순수 JS)**  
  - **사전 계산된 포켓몬 임베딩**  
  을 조합해서 이루어집니다.

즉, “TensorFlow.js로 포켓몬 닮은꼴을 유추한다”기보다는,  
**TensorFlow.js(face-api)로 얼굴·감정을 처리하고, 그 결과를 CLIP 기반 유사도 파이프라인에 넣어서 포켓몬 닮은꼴 순위를 만든다**고 보는 것이 정확합니다.

---

## 5. 참고: MobileNet + TensorFlow.js (현재 미사용)

- `scripts/generate-mobilenet-embeddings.js`는 **TensorFlow.js + MobileNet**으로 포켓몬 이미지 임베딩을 만드는 스크립트입니다.  
- 현재 서비스에서는 **CLIP 임베딩**만 사용하고, MobileNet 임베딩은 사용하지 않습니다.  
- 따라서 “포켓몬 닮은꼴 유추”의 메인 경로에는 이 스크립트가 관여하지 않습니다.
