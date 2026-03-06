import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const rawBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://pokemon-lookalike.shop'
const baseUrl = rawBaseUrl.startsWith('http://')
  ? rawBaseUrl.replace('http://', 'https://')
  : rawBaseUrl

/** sitemap URL은 항상 https로 노출 */
function getSitemapUrl(): string {
  const url = new URL('/sitemap.xml', baseUrl)
  url.protocol = 'https:'
  return url.toString()
}

/**
 * 표준 지시어만 사용 (User-agent, Allow, Disallow, Sitemap).
 * Content-Signal 등 비표준 지시어는 Googlebot이 무시하므로 사용하지 않음.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth/', '/profile', '/my/', '/board/new', '/board/edit'],
      },
    ],
    sitemap: getSitemapUrl(),
  }
}
