'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getPokemonList, searchPokemon, Pokemon, PokemonListResponse } from '../../utils/pokeapi'
import PokemonCard from '../../components/PokemonCard'
import Pagination from '../../components/Pagination'
import { useLanguage } from '../../contexts/LanguageContext'

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

  // 검색 실행
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // 검색어가 비어있으면 일반 목록으로 복귀
        fetchPokemonList(currentPage)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setLoading(true)
      setError(null)

      try {
        const results = await searchPokemon(query)
        setPokemonList(results)
        setTotalPages(1)
        setTotalCount(results.length)
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
          placeholder="포켓몬 이름으로 검색..."
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
    </main>
  )
}
