import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 관리자 페이지나 비공개 페이지가 있다면 여기에 추가
      // disallow: '/private/',
    },
    sitemap: 'https://pokemon-lookalike.pages.dev/sitemap.xml',
  }
}
