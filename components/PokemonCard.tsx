'use client'

import { Pokemon } from '../utils/pokeapi'
import { getTypeNameKorean } from '../utils/pokeapi'
import { getKoreanNameById } from '../data/pokemon'
import Link from 'next/link'

interface PokemonCardProps {
  pokemon: Pokemon
}

function displayName(pokemon: Pokemon): string {
  return getKoreanNameById(pokemon.id) ?? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '/placeholder-pokemon.png'

  const types = pokemon.types.map((t) => getTypeNameKorean(t.type.name))
  const name = displayName(pokemon)

  return (
    <Link href={`/pokedex/detail?id=${pokemon.id}`}>
      <div className="pokemon-card-pokedex">
        <div className="pokemon-card-image-container">
          <img src={imageUrl} alt={name} className="pokemon-card-image" loading="lazy" />
        </div>
        <div className="pokemon-card-info">
          <div className="pokemon-card-id">#{String(pokemon.id).padStart(3, '0')}</div>
          <h3 className="pokemon-card-name">
            {name}
          </h3>
          <div className="pokemon-card-types">
            {types.map((type, index) => (
              <span
                key={index}
                className={`pokemon-type-badge type-${pokemon.types[index].type.name}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
