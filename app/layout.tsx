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
    default: '포켓몬 닮은꼴 테스트 | 나와 닮은 포켓몬 AI 매칭',
    template: '%s | 포켓몬 닮은꼴 테스트',
  },
  description:
    '포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기로 나와 닮은 포켓몬을 AI로 확인하세요. 사진 한 장으로 닮은꼴 포켓몬을 찾고, 포켓몬 도감·닮은꼴 랭킹·커뮤니티까지. 무료·개인정보 미저장.',
  keywords: [
    '포켓몬 닮은꼴 테스트',
    '포켓몬 닮은꼴 찾기',
    '나와 닮은 포켓몬',
    '포켓몬 유사도',
    '닮은꼴 포켓몬',
    'AI 포켓몬',
    '이미지로 포켓몬 찾기',
    '포켓몬 도감',
    '닮은꼴 테스트',
    '포켓몬 얼굴 비교',
    '커뮤니티',
  ],
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
    icon: [
      { url: `${baseUrl}/images/pokemon_favicon.ico`, type: 'image/x-icon' },
      { url: `${baseUrl}/images/favicon-32x32.png`, type: 'image/png', sizes: '32x32' },
      { url: `${baseUrl}/images/favicon-16x16.png`, type: 'image/png', sizes: '16x16' },
    ],
    apple: `${baseUrl}/images/apple-touch-icon.png`,
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: '포켓몬 닮은꼴 테스트 | 포켓몬 닮은꼴 찾기 · 나와 닮은 포켓몬 AI',
    description: '포켓몬 닮은꼴 테스트: 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아드려요. 무료·개인정보 미저장.',
    type: 'website',
    siteName: '포켓몬 닮은꼴 찾기',
    locale: 'ko_KR',
    images: [
      {
        url: '/images/og.webp',
        width: 1200,
        height: 630,
        alt: '포켓몬 닮은꼴 찾기 - 나와 닮은 포켓몬 AI 매칭',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '포켓몬 닮은꼴 테스트 | 포켓몬 닮은꼴 찾기 · 나와 닮은 포켓몬 AI',
    description: '포켓몬 닮은꼴 테스트: 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아드려요.',
    images: ['/images/og.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '포켓몬 닮은꼴 찾기',
  alternateName: ['포켓몬 닮은꼴 테스트', '나와 닮은 포켓몬 찾기', 'Pocketmon Face'],
  description:
    '포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기 서비스. 사진을 올리면 AI가 나와 닮은 포켓몬을 찾아줍니다. 포켓몬 도감, 닮은꼴 랭킹, 커뮤니티 제공. 무료이며 개인정보는 저장하지 않습니다.',
  url: baseUrl,
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  inLanguage: 'ko',
  featureList: [
    '포켓몬 닮은꼴 테스트 (이미지 업로드)',
    '포켓몬 닮은꼴 찾기 (이미지 업로드)',
    '나와 닮은 포켓몬 유사도 결과',
    '포켓몬 도감 (1·2·3·4세대 + 메가진화)',
    '닮은꼴 랭킹',
    '커뮤니티 게시판',
  ],
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
        <meta name="naver-site-verification" content="f6404166a2442d36a296a6c879f0317b1d126e72" />
        <meta name="google-adsense-account" content="ca-pub-9163702166115880" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9163702166115880"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
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
