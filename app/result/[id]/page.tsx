import { Metadata } from 'next'
import { Suspense } from 'react'
import { POKEMON_LIST } from '../../../data/pokemon'
import ResultContent from '../../../components/ResultContent'
import CommonLoadingFallback from '../../../components/CommonLoadingFallback'
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

  const description = `포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기 결과: 나와 닮은 포켓몬 ${pokemon.name}. MBTI 유추(16유형)·성격 능력치·환상의 짝꿍. ${pokemon.description} 무료 포켓몬 닮은꼴 찾기.`
  return {
    title: `나는 ${pokemon.name}를 닮았어요! | 포켓몬 닮은꼴 테스트`,
    description,
    openGraph: {
      title: `나와 닮은 포켓몬 ${pokemon.name} | 포켓몬 닮은꼴 테스트 · 포켓몬 닮은꼴 찾기`,
      description: `포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기 결과 - ${pokemon.name}. MBTI 유추·성격 능력치·환상의 짝꿍. ${pokemon.description}`,
      images: [
        {
          url: pokemon.imageUrl,
          width: 800,
          height: 800,
          alt: `${pokemon.name} - 포켓몬 닮은꼴 테스트, 포켓몬 닮은꼴 찾기`,
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
    <Suspense fallback={<CommonLoadingFallback />}>
      <ResultContent pokemon={pokemon} />
    </Suspense>
  )
}
