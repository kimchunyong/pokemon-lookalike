import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이미지로 포켓몬 닮은꼴 찾기',
  description:
    '포켓몬 닮은꼴 찾기: 사진을 올리면 AI가 나와 닮은 포켓몬을 찾아줍니다. 유사도 순 결과, 포켓몬 도감 연동. 개인정보 미저장, 브라우저에서만 처리.',
  keywords: ['포켓몬 닮은꼴 찾기', '이미지로 닮은 포켓몬', '나와 닮은 포켓몬', '포켓몬 유사도', 'AI 닮은꼴'],
  openGraph: {
    title: '포켓몬 닮은꼴 찾기 - 이미지로 나와 닮은 포켓몬 찾기',
    description: '사진 한 장으로 포켓몬 닮은꼴 찾기. AI가 닮은꼴 포켓몬을 유사도 순으로 보여드려요.',
  },
}

export default function ImageCompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
