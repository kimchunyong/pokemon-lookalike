'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getPokemon, Pokemon, getTypeNameKorean } from '../../../utils/pokeapi'
import { useLanguage } from '../../../contexts/LanguageContext'
import { getKoreanNameById, POKEMON_LOOKALIKE_DESCRIPTIONS } from '../../../data/pokemon'

export default function PokemonDetailPage() {
  return (
    <Suspense fallback={
      <main className="pokemon-detail-page">
        <div className="loading-container"><p>로딩 중...</p></div>
      </main>
    }>
      <PokemonDetailContent />
    </Suspense>
  )
}

function PokemonDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPokemon = async () => {
      const id = searchParams?.get('id')
      if (!id) {
        setError('포켓몬 ID가 필요합니다.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await getPokemon(id)
        setPokemon(data)
      } catch (err) {
        console.error('Failed to fetch Pokemon:', err)
        setError('포켓몬 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [searchParams])

  if (loading) {
    return (
      <main className="pokemon-detail-page">
        <div className="loading-container">
          <p>{t.common.loading}</p>
        </div>
      </main>
    )
  }

  if (error || !pokemon) {
    return (
      <main className="pokemon-detail-page">
        <div className="error-container">
          <p>{error || '포켓몬을 찾을 수 없습니다.'}</p>
          <button onClick={() => router.push('/pokedex')} className="back-button">
            도감으로 돌아가기
          </button>
        </div>
      </main>
    )
  }

  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '/placeholder-pokemon.png'

  const types = pokemon.types.map((t) => getTypeNameKorean(t.type.name))
  const heightInMeters = (pokemon.height / 10).toFixed(1)
  const weightInKg = (pokemon.weight / 10).toFixed(1)
  const displayName = getKoreanNameById(pokemon.id) ?? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
  const lookalikeDesc = POKEMON_LOOKALIKE_DESCRIPTIONS[pokemon.id]

  return (
    <main className="pokemon-detail-page">
      <div className="pokemon-detail-back-button">
        <button
          onClick={() => router.push('/pokedex')}
          className="pokedex-back-button"
          aria-label={t.common.back}
        >
          ← {t.common.back}
        </button>
      </div>

      <div className="pokemon-detail-container">
        <div className="pokemon-detail-header">
          <div className="pokemon-detail-image-section">
            <div className="pokemon-detail-image-wrapper">
              <img src={imageUrl} alt={displayName} className="pokemon-detail-image" />
            </div>
          </div>

          <div className="pokemon-detail-info-section">
            <div className="pokemon-detail-id">#{String(pokemon.id).padStart(3, '0')}</div>
            <h1 className="pokemon-detail-name">
              {displayName}
            </h1>

            <div className="pokemon-detail-types">
              {types.map((type, index) => (
                <span
                  key={index}
                  className={`pokemon-type-badge type-${pokemon.types[index].type.name}`}
                >
                  {type}
                </span>
              ))}
            </div>

            <div className="pokemon-detail-stats">
              <div className="stat-item">
                <span className="stat-label">키</span>
                <span className="stat-value">{heightInMeters}m</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">몸무게</span>
                <span className="stat-value">{weightInKg}kg</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">기본 경험치</span>
                <span className="stat-value">{pokemon.base_experience}</span>
              </div>
            </div>
          </div>
        </div>

        {lookalikeDesc && (
          <section className="pokemon-detail-lookalike" aria-labelledby="lookalike-heading">
            <h2 id="lookalike-heading">닮은꼴 테스트 한줄 설명</h2>
            <p className="lookalike-sentence">{lookalikeDesc}</p>
          </section>
        )}

        <div className="pokemon-detail-description">
          <h2>상세 정보</h2>
          <div className="description-content">
            <p>
              <strong>포켓몬 ID:</strong> #{String(pokemon.id).padStart(3, '0')}
            </p>
            <p>
              <strong>이름:</strong> {displayName}
            </p>
            <p>
              <strong>타입:</strong> {types.join(', ')}
            </p>
            <p>
              <strong>키:</strong> {heightInMeters}m
            </p>
            <p>
              <strong>몸무게:</strong> {weightInKg}kg
            </p>
            <p>
              <strong>기본 경험치:</strong> {pokemon.base_experience}
            </p>
          </div>
        </div>

        {pokemon.sprites.front_shiny && (
          <div className="pokemon-detail-shiny">
            <h2>색이 다른 모습</h2>
            <div className="shiny-images">
              <div className="shiny-image-item">
                <img
                  src={pokemon.sprites.front_shiny}
                  alt={`${displayName} 색이 다른 모습`}
                  className="shiny-image"
                />
                <p>앞면</p>
              </div>
              {pokemon.sprites.other?.['official-artwork']?.front_shiny && (
                <div className="shiny-image-item">
                  <img
                    src={pokemon.sprites.other['official-artwork'].front_shiny}
                    alt={`${displayName} 색이 다른 모습 공식 아트`}
                    className="shiny-image"
                  />
                  <p>공식 아트워크</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
