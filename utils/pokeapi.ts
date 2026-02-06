/**
 * PokeAPI 유틸리티 함수
 * 포켓몬 데이터를 가져오는 함수들
 */

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonSprites {
  front_default: string
  front_shiny: string | null
  other?: {
    'official-artwork'?: {
      front_default: string
      front_shiny?: string
    }
  }
}

export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  types: PokemonType[]
  sprites: PokemonSprites
  base_experience: number
}

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

/**
 * 포켓몬 목록 가져오기 (페이지네이션)
 */
export async function getPokemonList(offset: number = 0, limit: number = 20): Promise<PokemonListResponse> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon list')
  }
  return response.json()
}

/**
 * 개별 포켓몬 정보 가져오기
 */
export async function getPokemon(idOrName: number | string): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon: ${idOrName}`)
  }
  return response.json()
}

/**
 * 포켓몬 이름으로 검색
 */
export async function searchPokemon(query: string): Promise<Pokemon[]> {
  try {
    // 먼저 전체 목록을 가져와서 필터링 (PokeAPI에 직접 검색 엔드포인트가 없음)
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1000`)
    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon list for search')
    }
    
    const data: PokemonListResponse = await response.json()
    const matchingPokemon = data.results.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    )
    
    // 매칭된 포켓몬들의 상세 정보 가져오기
    const pokemonPromises = matchingPokemon.slice(0, 50).map(pokemon => {
      const id = pokemon.url.split('/').filter(Boolean).pop()
      return getPokemon(id || pokemon.name)
    })
    
    return Promise.all(pokemonPromises)
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

/**
 * 타입 이름을 한국어로 변환
 */
export function getTypeNameKorean(typeName: string): string {
  const typeMap: Record<string, string> = {
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
  return typeMap[typeName] || typeName
}

/**
 * 포켓몬 이름을 한국어로 변환 (간단한 매핑)
 */
export function getPokemonNameKorean(name: string, id: number): string {
  // 실제로는 PokeAPI의 species 엔드포인트에서 한국어 이름을 가져와야 하지만,
  // 여기서는 간단하게 ID 기반으로 매핑하거나 영어 이름을 그대로 사용
  // 필요시 나중에 species API를 호출하여 한국어 이름을 가져올 수 있음
  return name.charAt(0).toUpperCase() + name.slice(1)
}
