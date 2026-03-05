import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const rawBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://pokemon-lookalike.shop'
const baseUrl = rawBaseUrl.startsWith('http://')
  ? rawBaseUrl.replace('http://', 'https://')
  : rawBaseUrl

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth/', '/profile', '/my/', '/board/new', '/board/edit'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
