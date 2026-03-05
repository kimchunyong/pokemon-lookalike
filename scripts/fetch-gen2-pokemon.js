/**
 * PokeAPI에서 2세대 포켓몬(152~251) 메타데이터를 가져와 JSON으로 저장한다.
 *
 * 사용법: node scripts/fetch-gen2-pokemon.js
 * 결과물: data/pokemon-gen2.json
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '..', 'data', 'pokemon-gen2.json')
const GEN2_START = 152
const GEN2_END = 251

const TYPE_KO = {
  normal: '노말',
  fire: '불꽃',
  water: '물',
  electric: '전기',
  grass: '풀',
  ice: '얼음',
  fighting: '격투',
  poison: '독',
  ground: '땅',
  flying: '비행',
  psychic: '에스퍼',
  bug: '벌레',
  rock: '바위',
  ghost: '고스트',
  dragon: '드래곤',
  dark: '악',
  steel: '강철',
  fairy: '페어리',
}

const IMG = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} ${res.status}`)
  return res.json()
}

function getKoreanName(species) {
  const ko = species.names?.find((n) => n.language?.name === 'ko')
  return ko?.name ?? null
}

function getKoreanFlavorText(species) {
  const entries = species.flavor_text_entries?.filter((e) => e.language?.name === 'ko') ?? []
  const entry = entries.find((e) => e.version?.name === 'gold') ?? entries[0]
  return entry?.flavor_text?.replace(/\s+/g, ' ').trim() ?? ''
}

async function main() {
  const list = []

  for (let id = GEN2_START; id <= GEN2_END; id++) {
    try {
      const [pokemon, species] = await Promise.all([
        fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ])

      const name = getKoreanName(species)
      if (!name) {
        console.warn(`#${id}: Korean name not found, skipping`)
        continue
      }

      const types = pokemon.types
        .map((t) => TYPE_KO[t.type?.name] ?? t.type?.name)
        .filter(Boolean)
      const typeStr = types.join('/')
      const description = getKoreanFlavorText(species) || `${name}의 데이터입니다.`

      list.push({
        id,
        name,
        type: typeStr,
        imageUrl: IMG(id),
        description,
      })
      process.stdout.write(`\r[${id - GEN2_START + 1}/${GEN2_END - GEN2_START + 1}] #${id} ${name}`)
    } catch (err) {
      console.error(`\n#${id} FAIL:`, err.message)
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(list, null, 2), 'utf-8')
  console.log(`\n저장 완료: ${OUTPUT_PATH} (${list.length}마리)`)
}

main().catch(console.error)
