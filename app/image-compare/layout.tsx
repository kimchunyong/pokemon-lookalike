import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '포켓몬 닮은꼴 테스트 | 이미지로 포켓몬 닮은꼴 찾기',
  description:
    '포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기: 사진 한 장 올리면 AI가 나와 닮은 포켓몬을 찾아줍니다. 무료 포켓몬 닮은꼴 찾기, 유사도 순 결과, 포켓몬 도감 연동. 개인정보 미저장.',
  keywords: [
    '포켓몬 닮은꼴 테스트',
    '포켓몬 닮은꼴 찾기',
    '이미지로 포켓몬 닮은꼴 찾기',
    '닮은꼴 테스트',
    '이미지로 닮은 포켓몬',
    '나와 닮은 포켓몬',
    '포켓몬 유사도',
    'AI 닮은꼴',
  ],
  openGraph: {
    title: '포켓몬 닮은꼴 테스트 | 포켓몬 닮은꼴 찾기 - 이미지로 나와 닮은 포켓몬',
    description: '포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기: 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아드려요. 무료.',
  },
}

export default function ImageCompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
