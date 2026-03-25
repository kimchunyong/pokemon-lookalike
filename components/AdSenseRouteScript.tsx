'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { shouldLoadAdSenseScript } from '@/lib/adsenseAllowedPath'

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9163702166115880'

/**
 * adsbygoogle.js는 **홈(`/`)에서만** 로드합니다. 다른 URL에서는 스크립트가 없어
 * 자동 광고·수동 단위가 그 페이지에서 동작하지 않습니다.
 */
export default function AdSenseRouteScript() {
  const pathname = usePathname()
  const load = shouldLoadAdSenseScript(pathname)

  if (!load) return null

  return (
    <Script src={ADSENSE_SRC} strategy="lazyOnload" crossOrigin="anonymous" />
  )
}
