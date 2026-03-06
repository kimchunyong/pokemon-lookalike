import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '포켓몬 도감',
  description:
    '포켓몬 닮은꼴 찾기와 함께 보는 포켓몬 도감. 1·2·3·4세대와 메가진화 검색·타입·능력치·진화 정보. 나와 닮은 포켓몬 결과 한줄 설명, 어떻게 닮은꼴을 찾는지 FAQ·AI 분석 원리 안내.',
  keywords: [
    '포켓몬 도감',
    '포켓몬 닮은꼴',
    '포켓몬 목록',
    '포켓몬 타입',
    '포켓몬 진화',
    '닮은꼴 테스트',
    'AI 포켓몬 매칭',
  ],
  openGraph: {
    title: '포켓몬 도감 | 포켓몬 닮은꼴 찾기',
    description:
      '포켓몬 닮은꼴 찾기와 함께 보는 포켓몬 도감. 1·2·3·4세대와 메가진화 상세 정보. 닮은꼴 한줄 설명·FAQ·AI 원리.',
  },
}

export default function PokedexLayout({ children }: { children: React.ReactNode }) {
  return children
}
