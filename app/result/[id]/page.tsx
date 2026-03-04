import { Metadata } from 'next'
import { POKEMON_LIST } from '../../../data/pokemon'
import ResultContent from '../../../components/ResultContent'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export async function generateStaticParams() {
  return POKEMON_LIST.map((pokemon) => ({
    id: pokemon.id.toString(),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseInt(params.id)
  const pokemon = POKEMON_LIST.find((p) => p.id === id)

  if (!pokemon) {
    return {
      title: '포켓몬을 찾을 수 없습니다',
    }
  }

  return {
    title: `나는 ${pokemon.name}를 닮았어요! | 나와 닮은 포켓몬 찾기`,
    description: `${pokemon.description}`,
    openGraph: {
      title: `나는 ${pokemon.name}를 닮았어요!`,
      description: pokemon.description,
      images: [
        {
          url: pokemon.imageUrl,
          width: 800,
          height: 800,
          alt: pokemon.name,
        },
      ],
    },
  }
}

export default function ResultPage({ params }: Props) {
  const id = parseInt(params.id)
  const pokemon = POKEMON_LIST.find((p) => p.id === id)

  if (!pokemon) {
    notFound()
  }

  return <ResultContent pokemon={pokemon} />
}
