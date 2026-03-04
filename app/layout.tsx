import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '../components/Providers'

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '나와 닮은 포켓몬 찾기 - AI 닮은꼴 매칭 서비스',
    template: '%s | 나와 닮은 포켓몬 찾기',
  },
  description: 'AI 기술로 나와 닮은 포켓몬을 찾아보세요. 포켓몬 도감, 커뮤니티 게시판도 함께 즐길 수 있습니다. 개인정보는 저장되지 않으며, 재미 목적으로만 제공됩니다.',
  keywords: ['포켓몬', '닮은꼴', 'AI', '이미지 비교', '포켓몬 도감', '커뮤니티', '재미'],
  authors: [{ name: 'Pocketmon Face' }],
  creator: 'Pocketmon Face',
  publisher: 'Pocketmon Face',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/favicon-16x16.png',
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: '나와 닮은 포켓몬 찾기 - AI 닮은꼴 매칭',
    description: 'AI 기술로 나와 닮은 포켓몬을 찾아보세요. 포켓몬 도감과 커뮤니티도 함께!',
    type: 'website',
    siteName: 'Pocketmon Face',
    locale: 'ko_KR',
    images: [
      {
        url: '/images/og.webp',
        width: 1200,
        height: 630,
        alt: '나와 닮은 포켓몬 찾기 - AI 닮은꼴 매칭 서비스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '나와 닮은 포켓몬 찾기 - AI 닮은꼴 매칭',
    description: 'AI 기술로 나와 닮은 포켓몬을 찾아보세요. 포켓몬 도감과 커뮤니티도 함께!',
    images: ['/images/og.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '나와 닮은 포켓몬 찾기',
  alternateName: 'Pocketmon Face',
  description: 'AI 기술로 나와 닮은 포켓몬을 찾아보는 서비스',
  url: baseUrl,
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  inLanguage: 'ko',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
