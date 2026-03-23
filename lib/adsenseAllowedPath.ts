/**
 * AdSense(특히 자동 광고) 스크립트를 로드해도 되는 경로인지 판별합니다.
 * 로그인·OAuth 콜백·마이페이지 등 콘텐츠가 거의 없는 화면에서는 스크립트를 넣지 않아
 * "게시자 콘텐츠가 없는 화면에 Google 게재 광고" 정책 위반을 줄입니다.
 *
 * @see https://support.google.com/adsense/answer/10502938
 */
export function shouldLoadAdSenseScript(pathname: string | null): boolean {
  if (!pathname) return false
  const normalized = pathname.split('?')[0] ?? ''

  if (normalized === '/') return true

  const blocked = [
    '/login',
    '/auth/',
    '/profile',
    '/my/',
    '/board/new',
    '/board/edit',
  ] as const

  for (const prefix of blocked) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return false
  }

  const allowedChecks: Array<(p: string) => boolean> = [
    (p) => p === '/image-compare' || p.startsWith('/image-compare/'),
    (p) => p.startsWith('/result/'),
    (p) => p === '/pokedex' || p.startsWith('/pokedex/'),
    (p) => p === '/ranking' || p.startsWith('/ranking/'),
    (p) => p === '/board' || p.startsWith('/board/'),
    (p) => p === '/faq' || p.startsWith('/faq/'),
    (p) => p === '/contact' || p.startsWith('/contact/'),
    (p) => p === '/privacy' || p.startsWith('/privacy/'),
    (p) => p === '/terms' || p.startsWith('/terms/'),
  ]

  return allowedChecks.some((fn) => fn(normalized))
}
