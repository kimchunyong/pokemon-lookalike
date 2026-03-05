import { Metadata } from 'next'
import { Suspense } from 'react'
import { POKEMON_LIST } from '../../../data/pokemon'
import ResultContent from '../../../components/ResultContent'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return POKEMON_LIST.map((pokemon) => ({
    id: pokemon.id.toString(),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params
  const id = parseInt(rawId)
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

export default async function ResultPage({ params }: Props) {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  const pokemon = POKEMON_LIST.find((p) => p.id === id)

  if (!pokemon) {
    notFound()
  }

  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', marginTop: '90px' }}>불러오는 중...</div>}>
      <ResultContent pokemon={pokemon} />
    </Suspense>
  )
}
