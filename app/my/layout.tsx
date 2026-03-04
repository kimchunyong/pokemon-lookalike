import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '내 결과',
  description: '나의 포켓몬 닮은꼴 분석 결과 히스토리를 확인합니다.',
  robots: { index: false, follow: false },
}

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return children
}
