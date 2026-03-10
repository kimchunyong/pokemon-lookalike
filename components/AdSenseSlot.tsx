'use client'

import { useEffect, useRef, useState } from 'react'
import AdSenseUnit from './AdSenseUnit'
import type { AdSenseUnitProps } from './AdSenseUnit'

type AdSenseSlotProps = AdSenseUnitProps & {
  /** 광고가 없을 때 영역을 숨김 (기본 true). 광고 채워지면 표시 */
  hideUntilFilled?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * 광고가 실제로 로드될 때만 영역을 표시.
 * 승인 전·노캐시 등으로 광고가 없으면 영역을 숨겨 빈 공간이 안 보이게 함.
 */
export default function AdSenseSlot({
  hideUntilFilled = true,
  className = '',
  style,
  ...unitProps
}: AdSenseSlotProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!hideUntilFilled)

  useEffect(() => {
    if (!hideUntilFilled || !wrapperRef.current) return

    const wrapper = wrapperRef.current

    const checkFilled = () => {
      const ins = wrapper.querySelector('ins.adsbygoogle') as HTMLElement | null
      if (!ins) return false
      if (ins.getAttribute('data-ad-status') === 'unfilled') {
        setVisible(false)
        return false
      }
      const iframe = ins.querySelector('iframe')
      if (iframe && (iframe as HTMLIFrameElement).offsetHeight > 0) {
        setVisible(true)
        return true
      }
      return false
    }

    const observer = new MutationObserver(() => {
      checkFilled()
    })

    observer.observe(wrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ad-status'],
      attributeOldValue: false,
    })

    checkFilled()

    const timer = setTimeout(() => {
      observer.disconnect()
    }, 4000)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [hideUntilFilled])

  const hiddenStyle: React.CSSProperties = hideUntilFilled && !visible
    ? { overflow: 'hidden', maxHeight: 0, margin: 0, padding: 0, minHeight: 0, visibility: 'hidden' }
    : {}

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ ...hiddenStyle, ...style }}
      aria-hidden={hideUntilFilled && !visible}
    >
      <AdSenseUnit {...unitProps} />
    </div>
  )
}
