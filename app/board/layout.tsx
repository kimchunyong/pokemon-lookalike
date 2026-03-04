import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '커뮤니티',
  description: '포켓몬 닮은꼴 결과를 공유하고, 다른 사용자와 소통하는 커뮤니티 게시판입니다.',
  openGraph: {
    title: '커뮤니티 게시판',
    description: '포켓몬 닮은꼴 결과 공유 및 소통 커뮤니티',
  },
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return children
}
