import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://pokemon-lookalike.shop'

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
