'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getPokemonList, searchPokemon, getPokemon, Pokemon, PokemonListResponse } from '../../utils/pokeapi'
import PokemonCard from '../../components/PokemonCard'
import Pagination from '../../components/Pagination'
import { useLanguage } from '../../contexts/LanguageContext'
import { POKEMON_LIST } from '../../data/pokemon'

const POKEMON_PER_PAGE = 20

export default function PokedexPage() {
  const router = useRouter()
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { t } = useLanguage()

  // 포켓몬 목록 가져오기
  const fetchPokemonList = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * POKEMON_PER_PAGE
      const listData: PokemonListResponse = await getPokemonList(offset, POKEMON_PER_PAGE)

      setTotalCount(listData.count)
      setTotalPages(Math.ceil(listData.count / POKEMON_PER_PAGE))

      // 각 포켓몬의 상세 정보 가져오기
      const pokemonPromises = listData.results.map((pokemon) => {
        const id = pokemon.url.split('/').filter(Boolean).pop()
        return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())
      })

      const pokemonData = await Promise.all(pokemonPromises)
      setPokemonList(pokemonData)
    } catch (err) {
      console.error('Failed to fetch Pokemon list:', err)
      setError('포켓몬 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 검색 실행 (한국어 이름 우선, 없으면 영어로 PokeAPI 검색)
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchPokemonList(currentPage)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setLoading(true)
      setError(null)

      try {
        const trimmed = query.trim()
        const koreanMatches = POKEMON_LIST.filter((p) =>
          p.name.toLowerCase().includes(trimmed.toLowerCase())
        )
        if (koreanMatches.length > 0) {
          const pokemonData = await Promise.all(
            koreanMatches.slice(0, 50).map((p) => getPokemon(p.id))
          )
          setPokemonList(pokemonData)
          setTotalCount(pokemonData.length)
        } else {
          const results = await searchPokemon(trimmed)
          setPokemonList(results)
          setTotalCount(results.length)
        }
        setTotalPages(1)
      } catch (err) {
        console.error('Search failed:', err)
        setError('검색 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [currentPage, fetchPokemonList]
  )

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 검색어 변경 핸들러 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      } else {
        setIsSearching(false)
        fetchPokemonList(currentPage)
      }
    }, 500) // 500ms 디바운싱

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch, fetchPokemonList, currentPage])

  // 초기 로드 및 페이지 변경
  useEffect(() => {
    if (!isSearching) {
      fetchPokemonList(currentPage)
    }
  }, [currentPage, fetchPokemonList, isSearching])

  return (
    <main className="pokedex-page">
      <div className="pokedex-back-button-container">
        <button
          onClick={() => router.push('/')}
          className="pokedex-back-button"
          aria-label={t.common.back}
        >
          ← {t.common.back}
        </button>
      </div>

      <div className="pokedex-header">
        <h1>포켓몬 도감</h1>
        <p className="pokedex-subtitle">총 {totalCount.toLocaleString()}마리의 포켓몬</p>
      </div>

      <div className="pokedex-search">
        <input
          type="text"
          placeholder="포켓몬 이름으로 검색 (한국어·영어)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pokedex-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              setIsSearching(false)
            }}
            className="pokedex-search-clear"
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="error-message" style={{ margin: '1rem 0' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p>{t.common.loading}</p>
        </div>
      ) : (
        <>
          {pokemonList.length > 0 ? (
            <>
              <div className="pokemon-grid">
                {pokemonList.map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>

              {!isSearching && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}

              {isSearching && (
                <div className="search-results-info">
                  <p>검색 결과: {pokemonList.length}마리</p>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </>
      )}

      <section className="pokedex-faq-section" aria-labelledby="pokedex-faq-heading">
        <h2 id="pokedex-faq-heading">어떻게 나의 닮은꼴 포켓몬을 찾나요?</h2>
        <p className="pokedex-faq-lead">
          포켓몬 닮은꼴 테스트는 사진 한 장으로 AI가 나와 닮은 포켓몬을 찾아드립니다. 위 도감에서 결과로 나온 포켓몬의 타입·능력치·진화 정보를 확인할 수 있어요.
        </p>

        <h3>자주 묻는 질문</h3>
        <dl className="pokedex-faq-list">
          <dt>닮은꼴은 어떻게 정해지나요?</dt>
          <dd>
            업로드한 사진을 AI가 분석해, 1·2·3·4세대와 메가진화 포켓몬 공식 이미지와 비교합니다. 얼굴·인상·색감 등이 비슷한 순서대로 유사도(%)로 보여줍니다.
          </dd>
          <dt>사진은 어디에 저장되나요?</dt>
          <dd>
            개인정보를 저장하지 않습니다. 분석은 브라우저와 서버에서 처리되며, 원하시면 결과만 저장할 수 있습니다.
          </dd>
          <dt>도감과 닮은꼴 테스트의 관계는?</dt>
          <dd>
            테스트 결과로 나온 포켓몬을 이 도감에서 검색해 타입, 키, 몸무게, 진화 정보, 닮은꼴 한줄 설명까지 확인할 수 있습니다.
          </dd>
        </dl>

        <h3>AI 분석 원리 (쉽게 설명)</h3>
        <p>
          이미지 인식 AI가 사진에서 특징을 추출한 뒤, 각 포켓몬 이미지의 특징과 비교해 &quot;얼마나 비슷한지&quot; 점수를 냅니다. 
          전기 타입·불꽃 타입 같은 분위기와 색감도 반영해, 단순한 얼굴 형태가 아니라 전체적인 인상으로 매칭합니다.
        </p>
      </section>
    </main>
  )
}
