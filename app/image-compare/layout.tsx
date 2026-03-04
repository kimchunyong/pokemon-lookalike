import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '닮은 포켓몬 찾기',
  description: '사진을 업로드하면 AI가 닮은 포켓몬을 찾아드립니다. 개인정보는 저장되지 않으며, 브라우저에서만 처리됩니다.',
  openGraph: {
    title: '닮은 포켓몬 찾기',
    description: '사진 한 장으로 나와 닮은 포켓몬을 찾아보세요!',
  },
}

export default function ImageCompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
