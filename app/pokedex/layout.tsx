import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '포켓몬 도감',
  description:
    '포켓몬 닮은꼴 찾기와 함께 보는 포켓몬 도감. 1·2·3·4세대와 메가진화 검색·타입·능력치·진화 정보. 나와 닮은 포켓몬 결과에서 더 알아보기.',
  keywords: ['포켓몬 도감', '포켓몬 닮은꼴', '포켓몬 목록', '포켓몬 타입', '포켓몬 진화'],
  openGraph: {
    title: '포켓몬 도감 | 포켓몬 닮은꼴 찾기',
    description: '포켓몬 닮은꼴 찾기와 함께 보는 포켓몬 도감. 1·2·3·4세대와 메가진화 상세 정보.',
  },
}

export default function PokedexLayout({ children }: { children: React.ReactNode }) {
  return children
}
