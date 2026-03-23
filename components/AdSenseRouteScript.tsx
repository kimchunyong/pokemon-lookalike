'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { shouldLoadAdSenseScript } from '@/lib/adsenseAllowedPath'

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9163702166115880'

/**
 * 전역 adsbygoogle.js는 자동 광고(계정 설정 시)가 모든 URL에 삽입될 수 있습니다.
 * 콘텐츠가 충분한 경로에서만 로드합니다.
 */
export default function AdSenseRouteScript() {
  const pathname = usePathname()
  const load = shouldLoadAdSenseScript(pathname)

  if (!load) return null

  return (
    <Script src={ADSENSE_SRC} strategy="lazyOnload" crossOrigin="anonymous" />
  )
}
