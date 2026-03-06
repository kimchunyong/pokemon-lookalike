# 포켓몬 종류 늘리기 (4세대 이상 추가)

현재 앱은 **1·2·3세대 386마리**를 사용합니다. 4세대(387~493) 이상을 추가하려면 아래 순서대로 진행하면 됩니다.

---

## 1. 새 세대 메타데이터 가져오기

PokeAPI에서 해당 세대 포켓몬 목록을 JSON으로 저장하는 스크립트를 추가합니다.

- **참고**: `scripts/fetch-gen2-pokemon.js`, `scripts/fetch-gen3-pokemon.js` 를 복사해 ID 구간과 출력 파일만 바꾸면 됩니다.

**예: 4세대(387~493) 추가**

1. `scripts/fetch-gen4-pokemon.js` 생성  
   - `GEN4_START = 387`, `GEN4_END = 493`  
   - `OUTPUT_PATH = .../data/pokemon-gen4.json`

2. 실행:
   ```bash
   node scripts/fetch-gen4-pokemon.js
   ```
   → `data/pokemon-gen4.json` 생성됨

---

## 2. 포켓몬 목록에 합치기

`data/pokemon.ts` 에서:

1. 상단에 import 추가:
   ```ts
   import pokemonGen4Json from './pokemon-gen4.json'
   ```

2. Gen4 배열과 `POKEMON_LIST` 수정:
   ```ts
   const POKEMON_GEN4 = pokemonGen4Json as PokemonEntry[]
   export const POKEMON_LIST: PokemonEntry[] = [
     ...POKEMON_GEN1,
     ...POKEMON_GEN2,
     ...POKEMON_GEN3,
     ...POKEMON_GEN4,
   ]
   ```

---

## 3. CLIP 임베딩 생성

새로 추가한 ID 구간에 대해 임베딩을 생성한 뒤 기존 `pokemon-embeddings.json` 과 병합합니다.

```bash
node scripts/generate-pokemon-embeddings.js 387 493
```

- **주의**: 인자 두 개(시작 ID, 끝 ID)를 주면 **끝 ID가 386보다 커도** 그 구간까지 생성·병합합니다.
- 기존 `data/pokemon-embeddings.json` 이 있으면 로드한 뒤, 지정한 구간만 추가/덮어쓰고 다시 저장합니다.

전체를 처음부터 다시 만들려면:

```bash
node scripts/generate-pokemon-embeddings.js 1 493
```

---

## 4. 문구 수정 (선택)

UI에 세대/마리 수가 하드코딩된 부분이 있으면 수정합니다.

| 위치 | 현재 예시 | 수정 예시 |
|------|------------|-----------|
| `app/page.tsx` | 1·2·3세대 포켓몬 386마리 | 1·2·3·4세대 포켓몬 493마리 |
| `app/image-compare/page.tsx` | (이용 방법 문구) | 필요 시 세대/마리 수 반영 |
| `app/pokedex/layout.tsx` | 1·2·3세대 386마리 | 1·2·3·4세대 493마리 |
| `app/layout.tsx` | 1·2·3세대 386마리 | 1·2·3·4세대 493마리 |

`POKEMON_LIST.length` 를 쓰는 곳(예: sitemap, 결과 개수)은 코드 수정 없이 자동으로 새 마리 수가 반영됩니다.

---

## 세대별 ID 구간 참고

| 세대 | ID 구간 | 마리 수 |
|------|---------|--------|
| 1 | 1 ~ 151 | 151 |
| 2 | 152 ~ 251 | 100 |
| 3 | 252 ~ 386 | 135 |
| 4 | 387 ~ 493 | 107 |
| 5 | 494 ~ 649 | 156 |
| 6 | 650 ~ 721 | 72 |
| 7 | 722 ~ 809 | 88 |
| 8 | 810 ~ 905 | 96 |
| 9 | 906 ~ 1025 | 120 |

(PokeAPI 기준, 시점에 따라 일부 차이 있을 수 있음)

---

## 메가진화 추가

메가진화(메가이상해꽃, 메가리자몽 등)까지 포함하려면 **별도 가이드**를 따르면 됩니다.

→ **[docs/POKEMON_MEGA.md](./POKEMON_MEGA.md)**  
- PokeAPI는 메가를 별도 ID(10033~10090, 10278~10325 등)로 제공함  
- `scripts/fetch-mega-pokemon.js` 로 메타데이터 수집 → `pokemon.ts` 에 합치기 → 위와 동일하게 임베딩 구간 두 번 실행
