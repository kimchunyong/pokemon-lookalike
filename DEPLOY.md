# Cloudflare Pages 배포 (파일 1000개 초과 시)

정적 빌드 결과물이 **1000개 이상**이면 Cloudflare 대시보드의 "직접 업로드"로는 배포할 수 없습니다. **Wrangler CLI**를 사용하면 최대 20,000개까지 배포 가능합니다.

## 1. Wrangler 로그인

```bash
npx wrangler login
```

브라우저가 열리면 Cloudflare 계정으로 로그인합니다.

## 2. 프로젝트 이름 확인

Cloudflare Pages 대시보드에서 사용 중인 **프로젝트 이름**을 확인합니다.  
`package.json`의 `deploy` 스크립트는 `--project-name=pokemon-lookalike`를 사용합니다. 다른 이름이면 해당 스크립트를 수정하거나, 아래처럼 직접 실행할 때 `--project-name=실제이름`으로 지정하세요.

## 3. 배포

```bash
npm run deploy
```

또는 프로젝트 이름을 지정해서:

```bash
npm run build
npx wrangler pages deploy dist --project-name=실제프로젝트이름
```

## 한 줄 요약

- **웹 업로드**: 1000개 파일 제한 → 현재 빌드는 1500개 이상이라 불가
- **Wrangler CLI**: 20,000개까지 가능 → `npm run deploy` 사용
