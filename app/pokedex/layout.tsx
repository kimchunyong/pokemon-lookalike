import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '포켓몬 도감',
  description: '전체 포켓몬 목록을 검색하고 상세 정보를 확인하세요. 타입, 능력치, 진화 정보를 한눈에 볼 수 있습니다.',
  openGraph: {
    title: '포켓몬 도감',
    description: '전체 포켓몬 목록과 상세 정보를 확인하세요.',
  },
}

export default function PokedexLayout({ children }: { children: React.ReactNode }) {
  return children
}
