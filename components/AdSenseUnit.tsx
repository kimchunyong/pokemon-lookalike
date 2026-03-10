'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const AD_CLIENT = 'ca-pub-9163702166115880'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export type AdSenseUnitProps = {
  /** 광고 단위 ID (숫자). 미설정 시 NEXT_PUBLIC_ADSENSE_AD_SLOT 사용 */
  slot?: string
  /** 광고 형식: auto | rectangle | horizontal | vertical */
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  /** 반응형 전체 너비 사용 (true 시 Google 권장 반응형) */
  fullWidthResponsive?: boolean
  /** 고정 크기 사용 시 (예: 728x90). fullWidthResponsive=false 일 때 권장 */
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

/** ca-pub-... 은 게시자 ID이므로 슬롯으로 사용 시 400 에러 발생 */
function parseSlot(value: string | undefined): string {
  const raw = (value ?? process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT ?? '').trim()
  if (!raw || raw.startsWith('ca-pub-')) return ''
  return raw
}

/**
 * Google 애드센스 광고 단위 (공식 가이드 준수)
 * @see https://support.google.com/adsense/answer/9190028
 * - 스크립트는 body 최상단, ins는 그 다음에 배치
 * - ins 직후 (adsbygoogle = window.adsbygoogle || []).push({}) 실행
 */
export default function AdSenseUnit({
  slot: slotProp,
  format = 'auto',
  fullWidthResponsive = true,
  width,
  height,
  className = '',
  style,
}: AdSenseUnitProps) {
  const pathname = usePathname()
  const slot = parseSlot(slotProp)

  useEffect(() => {
    if (!slot) return
    const runPush = () => {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        console.error('AdSense push error:', e)
      }
    }
    // Google 가이드: ins가 DOM에 들어간 뒤 push 실행. RAF로 DOM 커밋 후 실행
    const id = requestAnimationFrame(() => {
      runPush()
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, slot])

  if (!slot) return null

  const isFixedSize = width != null && height != null && !fullWidthResponsive
  const insStyle: React.CSSProperties = {
    display: 'inline-block',
    ...(isFixedSize
      ? { width: `${width}px`, height: `${height}px` }
      : { minWidth: 320, minHeight: 90 }),
    ...style,
  }

  return (
    <ins
      className={`adsbygoogle ${className}`.trim()}
      style={insStyle}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot || '7390261701'}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? 'true' : undefined}
    />
  )
}
