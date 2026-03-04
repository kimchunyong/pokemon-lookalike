import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프로필 설정',
  description: '닉네임 등 프로필 정보를 관리합니다.',
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
