import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '닮은꼴 랭킹',
  description:
    '포켓몬 닮은꼴 찾기 랭킹. 나와 닮은 포켓몬 결과를 등록한 유저들의 닮은꼴 순위. 포켓몬 닮은꼴 찾기 서비스와 함께 즐기세요.',
  keywords: ['포켓몬 닮은꼴 랭킹', '닮은꼴 순위', '나와 닮은 포켓몬 랭킹', '포켓몬 유사도 순위'],
  openGraph: {
    title: '닮은꼴 랭킹 | 포켓몬 닮은꼴 찾기',
    description: '포켓몬 닮은꼴 찾기로 찾은 나와 닮은 포켓몬 랭킹. 유사도 순위를 확인하세요.',
  },
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children
}
