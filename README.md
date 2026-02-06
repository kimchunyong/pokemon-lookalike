# 나와 닮은 포켓몬 찾기

AI 기술을 활용하여 나와 닮은 포켓몬을 찾아보는 재미있는 웹 서비스입니다.

## ⚠️ 중요 안내사항

### 구글 애드센스 정책 준수

이 서비스는 구글 애드센스 정책을 준수합니다:

- **재미 목적**: 재미와 오락 목적으로만 제공되며, 결과는 AI 알고리즘에 기반합니다.
- **개인정보 보호**: 업로드한 이미지는 브라우저에서만 처리되며 서버에 저장되지 않습니다.
- **저작권**: 포켓몬 이미지는 PokeAPI 공개 데이터를 사용하며, 비상업적 교육 목적으로만 사용됩니다.
- **면책 조항**: 결과는 참고용이며, 실제 얼굴 유사도를 보장하지 않습니다.

## 기술 스택

- **Next.js 13** (App Router, SSR 지원)
- **React 18**
- **TypeScript**
- **TensorFlow.js** (클라이언트 사이드 이미지 분석)
- **PokeAPI** (포켓몬 데이터)
- **Tailwind CSS** (스타일링)

## 주요 기능

1. **이미지 업로드**: 얼굴 이미지를 업로드하여 분석
2. **AI 매칭**: TensorFlow.js를 사용한 이미지 유사도 분석
3. **결과 표시**: 닮은 포켓몬 상위 5개 표시
4. **포켓몬 도감**: 전체 포켓몬 목록 조회 및 검색 기능
5. **다국어 지원**: 한국어, 영어, 일본어, 중국어 지원
6. **공유 기능**: 결과 이미지 저장 및 카카오톡/링크 공유
7. **개인정보 보호**: 모든 처리는 클라이언트 사이드에서만 수행

## 프로젝트 구조

```
pokemon-lookalike/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   ├── image-compare/     # 이미지 비교 페이지
│   ├── pokedex/           # 포켓몬 도감 페이지
│   │   ├── page.tsx       # 도감 목록
│   │   └── detail/        # 포켓몬 상세 정보
│   └── result/            # 결과 페이지
│       └── [id]/          # 결과 상세
├── components/            # React 컴포넌트
│   ├── ImageUpload.tsx    # 이미지 업로드 컴포넌트
│   ├── PokemonCard.tsx    # 포켓몬 카드 컴포넌트
│   ├── ShareButton.tsx    # 공유 버튼 컴포넌트
│   ├── LanguageSelector.tsx # 언어 선택 컴포넌트
│   └── PolicyNotice.tsx   # 정책 고지 컴포넌트
├── contexts/              # React Context
│   └── LanguageContext.tsx # 다국어 지원 컨텍스트
├── i18n/                  # 다국어 설정
│   ├── index.ts           # i18n 설정
│   └── locales/           # 언어별 번역 파일
├── utils/                 # 유틸리티 함수
│   ├── imageComparison.ts # TensorFlow.js 이미지 비교
│   ├── pokeapi.ts         # PokeAPI 연동
│   └── shareImage.ts      # 이미지 공유 유틸리티
├── data/                  # 데이터
│   └── pokemon.ts         # 포켓몬 정적 데이터
└── next.config.js         # Next.js 설정
```

## 실행 방법

### 개발 서버

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 배포

### Vercel (권장)

```bash
npm i -g vercel
vercel
```

### Cloudflare Pages

1. Cloudflare Pages 대시보드 접속
2. GitHub 레포지토리 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `.next`

## 개인정보 보호

- 업로드한 이미지는 **브라우저 메모리에만** 저장됩니다
- 서버로 전송되지 않으며, 페이지를 떠나면 삭제됩니다
- TensorFlow.js 모델은 클라이언트 사이드에서만 실행됩니다

## 저작권

- 포켓몬 이미지: PokeAPI (https://pokeapi.co/)
- 포켓몬은 Pokémon Company의 저작권이 있습니다
- 이 서비스는 비상업적 교육 목적으로만 사용됩니다

## 라이선스

MIT License
