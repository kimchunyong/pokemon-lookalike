import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인',
  description: 'Google 계정으로 로그인하여 닮은꼴 결과 저장, 커뮤니티 등 다양한 기능을 이용하세요.',
  robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
