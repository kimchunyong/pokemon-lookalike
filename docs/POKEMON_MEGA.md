# 메가진화 포켓몬 추가하기

PokeAPI는 메가진화를 **별도 포켓몬 ID**로 제공합니다.  
예: `venusaur-mega` = 10033, `charizard-mega-x` = 10034, `rayquaza-mega` = 10079, 그 외 10278~10325 구간 등.

---

## 1. 메가진화 메타데이터 수집

스크립트로 PokeAPI 전체 목록 중 이름이 `-mega` 인 포켓몬만 골라 한글명·타입·이미지 URL을 만들어 저장합니다.

```bash
node scripts/fetch-mega-pokemon.js
```

→ **`data/pokemon-mega.json`** 생성 (id, name, type, imageUrl, description)

- 이미지 URL: `official-artwork/{id}.png` (기존과 동일, 메가도 동일 규칙)
- 한글명: 원종 species 한글명을 가져와 앞에 "메가"를 붙임 (예: 리자몽 → 메가리자몽, charizard-mega-x → 메가리자몽 X)

---

## 2. 포켓몬 목록에 합치기

**`data/pokemon.ts`** 에서:

1. import 추가:
   ```ts
   import pokemonMegaJson from './pokemon-mega.json'
   ```

2. 메가 배열과 `POKEMON_LIST` 수정:
   ```ts
   const POKEMON_MEGA = pokemonMegaJson as PokemonEntry[]
   export const POKEMON_LIST: PokemonEntry[] = [
     ...POKEMON_GEN1,
     ...POKEMON_GEN2,
     ...POKEMON_GEN3,
     ...POKEMON_GEN4,
     ...POKEMON_MEGA,
   ]
   ```

---

## 3. CLIP 임베딩 생성

메가 포켓몬 ID는 **연속 구간이 두 개**입니다.

- **10033 ~ 10090** (6세대·ORAS 등 공식 메가 대부분)
- **10278 ~ 10325** (확장/팬 메가 등)

각 구간마다 한 번씩 실행해 기존 `pokemon-embeddings.json` 에 병합합니다.

```bash
node scripts/generate-pokemon-embeddings.js 10033 10090
node scripts/generate-pokemon-embeddings.js 10278 10325
```

- 구간 안에 메가가 아닌 ID가 있어도 임베딩만 생성되며, 목록에 없으면 닮은꼴 후보에는 안 나옵니다.
- **공식 메가만** 쓰고 싶다면 `pokemon-mega.json` 을 공식 48종만 넣도록 스크립트/수동 편집으로 줄이면 됩니다.

---

## 4. UI 문구 (선택)

- 메인/도감 등에 "493마리 + 메가진화"처럼 문구를 넣거나,
- `POKEMON_LIST.length` 를 쓰는 곳은 수정 없이도 자동으로 반영됩니다.

---

## 참고

- 메가 포켓몬 ID는 **1~493과 겹치지 않습니다** (10033, 10278 등).  
  결과 페이지 `/result/[id]` 는 그대로 `id` 로 동작합니다.
- PokeAPI의 `-mega` 포켓몬 수는 80개 이상이며, 그중 상당수는 공식 게임에 없는 확장/팬 메가입니다.  
  공식만 쓰려면 `fetch-mega-pokemon.js` 결과를 편집하거나, 스크립트에서 ID 구간(예: 10033~10090)으로만 자르면 됩니다.
