import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '../components/Providers'

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const viewport: Viewport = {
  themeColor: '#242424',
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '포켓몬 닮은꼴 테스트 | 포켓몬 닮은꼴 찾기 · 나와 닮은 포켓몬 AI',
    template: '%s | 포켓몬 닮은꼴 테스트',
  },
  description:
    '포켓몬 닮은꼴 테스트, 포켓몬 닮은꼴 찾기로 사진 한 장만 올리면 AI가 나와 닮은 포켓몬을 찾아줍니다. 무료 포켓몬 닮은꼴 테스트·닮은꼴 찾기, MBTI 유추·성격 능력치·환상의 짝꿍·포켓몬 도감·랭킹. 개인정보 미저장.',
  keywords: [
    '포켓몬 닮은꼴 테스트',
    '포켓몬 닮은꼴 찾기',
    '닮은꼴 테스트',
    '닮은꼴 찾기',
    '포켓몬 닮은꼴 테스트 무료',
    '포켓몬 닮은꼴 찾기 사진',
    '나와 닮은 포켓몬',
    '닮은꼴 포켓몬',
    '포켓몬 MBTI',
    '닮은꼴 MBTI',
    '포켓몬 성격 유추',
    '포켓몬 유사도',
    'AI 포켓몬',
    '이미지로 포켓몬 찾기',
    '포켓몬 도감',
    '포켓몬 얼굴 비교',
    '포켓몬 닮은꼴',
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
    description: '포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기: 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아드려요. 무료, MBTI 유추·성격 능력치·환상의 짝꿍. 개인정보 미저장.',
    type: 'website',
    siteName: '포켓몬 닮은꼴 찾기',
    locale: 'ko_KR',
    images: [
      {
        url: '/images/og.webp',
        width: 1200,
        height: 630,
        alt: '포켓몬 닮은꼴 테스트, 포켓몬 닮은꼴 찾기 - 나와 닮은 포켓몬 AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '포켓몬 닮은꼴 테스트 | 포켓몬 닮은꼴 찾기 · 나와 닮은 포켓몬 AI',
    description: '포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기: 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아드려요. 무료.',
    images: ['/images/og.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '포켓몬 닮은꼴 찾기',
  alternateName: [
    '포켓몬 닮은꼴 테스트',
    '포켓몬 닮은꼴 찾기',
    '닮은꼴 테스트',
    '닮은꼴 찾기',
    '나와 닮은 포켓몬 찾기',
    '포켓몬 닮은꼴',
    'Pocketmon Face',
  ],
  description:
    '포켓몬 닮은꼴 테스트, 포켓몬 닮은꼴 찾기 서비스. 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아줍니다. 무료 포켓몬 닮은꼴 테스트·닮은꼴 찾기, MBTI 유추, 성격 능력치, 환상의 짝꿍, 포켓몬 도감, 닮은꼴 랭킹, 커뮤니티. 개인정보 저장하지 않음.',
  url: baseUrl,
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  inLanguage: 'ko',
  featureList: [
    '포켓몬 닮은꼴 테스트 (이미지 업로드)',
    '포켓몬 닮은꼴 찾기 (이미지 업로드)',
    '나와 닮은 포켓몬 유사도 결과',
    '닮은 포켓몬 기반 MBTI 유추 (16유형, 성격 능력치, 환상의 짝꿍)',
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: '포켓몬 닮은꼴 테스트는 어떻게 하나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '포켓몬 닮은꼴 테스트는 이미지로 찾기 페이지에서 사진을 업로드하면 됩니다. AI가 나와 닮은 포켓몬을 유사도 순으로 보여주며, 포켓몬 닮은꼴 찾기 결과에서 MBTI 유추·성격 능력치·환상의 짝꿍도 확인할 수 있습니다. 무료이며 개인정보는 저장하지 않습니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '포켓몬 닮은꼴 찾기는 무료인가요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '네. 포켓몬 닮은꼴 찾기(포켓몬 닮은꼴 테스트)는 무료로 이용할 수 있습니다. 사진 한 장으로 나와 닮은 포켓몬을 AI가 찾아주며, 포켓몬 도감·닮은꼴 랭킹·커뮤니티도 이용 가능합니다. 개인정보는 브라우저에서만 처리되며 저장되지 않습니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '나와 닮은 포켓몬은 어떻게 찾나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '포켓몬 닮은꼴 찾기 서비스에서 이미지로 찾기를 선택한 뒤 얼굴이 나온 사진을 업로드하세요. AI가 1·2·3·4세대 및 메가진화 포켓몬과 비교해 나와 닮은 포켓몬을 유사도 순으로 보여줍니다. 감정 분석과 MBTI 유추도 함께 제공됩니다.',
                  },
                },
              ],
            }),
          }}
          suppressHydrationWarning
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9163702166115880"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
