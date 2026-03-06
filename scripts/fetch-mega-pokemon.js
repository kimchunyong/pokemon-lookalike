/**
 * PokeAPI에서 메가진화 포켓몬(-mega) 목록을 가져와 JSON으로 저장한다.
 *
 * 사용법: node scripts/fetch-mega-pokemon.js
 * 결과물: data/pokemon-mega.json
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '..', 'data', 'pokemon-mega.json')

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

/** 메가 폼 표시 이름: "메가" + 한글명, -mega-x / -mega-y / -mega-z 면 " X" / " Y" / " Z" 붙임 */
function megaDisplayName(apiName, baseKoreanName) {
  if (!baseKoreanName) return apiName
  let suffix = ''
  if (apiName.includes('-mega-x')) suffix = ' X'
  else if (apiName.includes('-mega-y')) suffix = ' Y'
  else if (apiName.includes('-mega-z')) suffix = ' Z'
  return `메가${baseKoreanName}${suffix}`
}

async function main() {
  const listUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1400'
  const { results } = await fetchJson(listUrl)
  const megaEntries = results.filter((r) => r.name.includes('-mega'))
  console.log(`메가진화 포켓몬 ${megaEntries.length}마리 발견`)

  const list = []
  for (let i = 0; i < megaEntries.length; i++) {
    const { name: apiName, url } = megaEntries[i]
    try {
      const pokemon = await fetchJson(url)
      const species = await fetchJson(pokemon.species.url)
      const baseKoreanName = getKoreanName(species)
      const displayName = megaDisplayName(apiName, baseKoreanName) || apiName

      const types = (pokemon.types || [])
        .map((t) => TYPE_KO[t.type?.name] ?? t.type?.name)
        .filter(Boolean)
      const typeStr = types.join('/') || '노말'
      const description = baseKoreanName
        ? `메가진화한 ${baseKoreanName}의 형태입니다.`
        : `${displayName}의 데이터입니다.`

      list.push({
        id: pokemon.id,
        name: displayName,
        type: typeStr,
        imageUrl: IMG(pokemon.id),
        description,
      })
      process.stdout.write(`\r[${i + 1}/${megaEntries.length}] #${pokemon.id} ${displayName}`)
    } catch (err) {
      console.error(`\n${apiName} FAIL:`, err.message)
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(list, null, 2), 'utf-8')
  console.log(`\n저장 완료: ${OUTPUT_PATH} (${list.length}마리)`)
}

main().catch(console.error)
