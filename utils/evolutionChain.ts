import { POKEAPI_BASE_URL, getPokemon, getPokemonNameKorean } from './pokeapi'

export interface EvolutionChainLink {
  species: {
    name: string
    url: string
  }
  evolves_to: EvolutionChainLink[]
}

export interface EvolutionChain {
  chain: EvolutionChainLink
}

export interface EvolutionStage {
  name: string
  koreanName: string
  imageUrl: string
  isCurrent: boolean
}

/**
 * 포켓몬의 진화 체인 정보를 가져옵니다.
 */
export async function getEvolutionChain(pokemonId: number): Promise<EvolutionStage[]> {
  try {
    // 1. 포켓몬 종(Species) 정보 가져오기
    const speciesResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${pokemonId}`)
    if (!speciesResponse.ok) return []
    
    const speciesData = await speciesResponse.json()
    const evolutionChainUrl = speciesData.evolution_chain.url
    
    // 2. 진화 체인 데이터 가져오기
    const evolutionResponse = await fetch(evolutionChainUrl)
    if (!evolutionResponse.ok) return []
    
    const evolutionData: EvolutionChain = await evolutionResponse.json()
    
    // 3. 진화 단계 파싱 (평면화)
    const stages: EvolutionStage[] = []
    let currentLink: EvolutionChainLink | undefined = evolutionData.chain
    
    while (currentLink) {
      const speciesName = currentLink.species.name
      const id = parseInt(currentLink.species.url.split('/').filter(Boolean).pop() || '0')
      
      // 이미지와 한국어 이름 가져오기
      // 주의: 성능 최적화를 위해 필요한 정보만 빠르게 구성
      // 실제로는 getPokemon 등을 호출하거나 정적 데이터를 활용할 수 있음
      const pokemonInfo = await getPokemon(id)
      const koreanName = getPokemonNameKorean(speciesName, id)
      
      stages.push({
        name: speciesName,
        koreanName: koreanName, // 실제로는 API에서 가져오거나 매핑 필요
        imageUrl: pokemonInfo.sprites.other?.['official-artwork']?.front_default || pokemonInfo.sprites.front_default,
        isCurrent: id === pokemonId
      })
      
      // 다음 진화 단계로 이동 (단순화를 위해 첫 번째 분기만 따라감)
      currentLink = currentLink.evolves_to[0]
    }
    
    return stages
  } catch (error) {
    console.error('Failed to fetch evolution chain:', error)
    return []
  }
}
