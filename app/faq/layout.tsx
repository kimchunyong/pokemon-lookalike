import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description:
    '포켓몬 닮은꼴 테스트·닮은꼴 찾기 FAQ. 어떻게 닮은꼴을 찾나요? 사진 저장 여부, AI 분석 원리, 결과 저장·랭킹·도감 이용 방법 등 자주 묻는 질문과 답변.',
  keywords: ['포켓몬 닮은꼴 FAQ', '자주 묻는 질문', '닮은꼴 테스트 방법', 'AI 포켓몬 매칭'],
  openGraph: {
    title: '자주 묻는 질문 | 포켓몬 닮은꼴 찾기',
    description: '포켓몬 닮은꼴 테스트·찾기 관련 자주 묻는 질문과 답변.',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
