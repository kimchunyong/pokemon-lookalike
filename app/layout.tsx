import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import LanguageSelector from '../components/LanguageSelector'
import AuthHeader from '../components/AuthHeader'

export const metadata: Metadata = {
  title: '나와 닮은 포켓몬 찾기 - 재미있는 AI 매칭 서비스',
  description: 'AI 기술을 활용하여 나와 닮은 포켓몬을 찾아보는 재미있는 서비스입니다. 개인정보는 저장되지 않으며, 재미 목적으로만 제공됩니다.',
  keywords: ['포켓몬', 'AI', '이미지 비교', '재미'],
  authors: [{ name: 'Pokemon Lookalike' }],
  robots: 'index, follow',
  openGraph: {
    title: '나와 닮은 포켓몬 찾기',
    description: 'AI 기술을 활용하여 나와 닮은 포켓몬을 찾아보세요',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="BFGV8tpR-gkDiLtEyXLEK_aOfQ-EW0top_HnDsBDY0U" />
        <meta name="google-adsense-account" content="ca-pub-9163702166115880" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9163702166115880"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <AuthHeader />
            <LanguageSelector />
            {children}
          </AuthProvider>
        </LanguageProvider>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
