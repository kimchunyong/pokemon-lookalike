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
  const pd = t.pokedexPage as Record<string, string>

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
      setError(pd.loadListError)
    } finally {
      setLoading(false)
    }
  }, [pd.loadListError])

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
        setError(pd.searchError)
      } finally {
        setLoading(false)
      }
    },
    [currentPage, fetchPokemonList, pd.searchError]
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

      <section
        className="pokedex-intro-section"
        aria-labelledby="pokedex-intro-heading"
        style={{
          maxWidth: 720,
          margin: '0 auto 1.25rem',
          padding: '1rem 1.15rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          fontSize: '0.9em',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        <h2 id="pokedex-intro-heading" style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.95)' }}>
          {pd.introTitle}
        </h2>
        <p style={{ margin: '0 0 0.6rem' }}>{pd.introP1}</p>
        <p style={{ margin: 0 }}>{pd.introP2}</p>
      </section>

      <div className="pokedex-header">
        <h1>{pd.title}</h1>
        <p className="pokedex-subtitle">
          {pd.subtitle.replace('{{count}}', totalCount.toLocaleString())}
        </p>
      </div>

      <div className="pokedex-search">
        <input
          type="text"
          placeholder={pd.searchPlaceholder}
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
            aria-label={pd.searchClearAria}
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
                  <p>{pd.searchResults.replace('{{count}}', String(pokemonList.length))}</p>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <p>{pd.noResults}</p>
            </div>
          )}
        </>
      )}

      <section className="pokedex-faq-section" aria-labelledby="pokedex-faq-heading">
        <h2 id="pokedex-faq-heading">{pd.bottomTitle}</h2>
        <p className="pokedex-faq-lead">{pd.bottomLead}</p>

        <h3>{pd.bottomFaqTitle}</h3>
        <dl className="pokedex-faq-list">
          <dt>{pd.bottomQ1}</dt>
          <dd>{pd.bottomA1}</dd>
          <dt>{pd.bottomQ2}</dt>
          <dd>{pd.bottomA2}</dd>
          <dt>{pd.bottomQ3}</dt>
          <dd>{pd.bottomA3}</dd>
        </dl>

        <h3>{pd.bottomAiTitle}</h3>
        <p>{pd.bottomAiP}</p>
      </section>
    </main>
  )
}
