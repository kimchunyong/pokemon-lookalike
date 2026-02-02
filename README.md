# 나와 닮은 포켓몬스터

퀴즈를 풀고 자신과 닮은 포켓몬을 찾아보는 웹사이트입니다.

## 기술 스택

- **JavaScript** + **React** (Vite)
- **react-router-dom** (홈 / 퀴즈 / 결과 라우팅)

## 프로젝트 구조

```
pokemon-lookalike/
├── public/
├── src/
│   ├── components/   # 퀴즈 카드, 결과 카드 등
│   ├── data/         # pokemon.js, quiz.js (포켓몬·퀴즈 데이터)
│   ├── hooks/        # 퀴즈 상태, 점수 계산
│   ├── pages/        # HomePage, QuizPage, ResultPage
│   ├── App.jsx
│   └── main.jsx
├── PROJECT_PLAN.md   # 기획·기능·개발 단계 정리
├── package.json
└── vite.config.js
```

## 실행 방법

```bash
cd pokemon-lookalike
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

## 기획·기능 상세

기능 정의, 화면 구성, 데이터 설계, 개발 단계는 **PROJECT_PLAN.md** 를 참고하세요.
