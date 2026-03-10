'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const IMAGE_COMPARE_STORAGE_KEY = 'imageCompareState'
const USER_IMAGE_KEY = 'userImage'

/**
 * /image-compare 또는 result/[id]?similarity=&emotion=&emotionProb= 가 아니면
 * 이미지 비교·결과 관련 sessionStorage 초기화
 */
export default function CompareDataClearer() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isImageCompare = pathname === '/image-compare'
    const isResultWithParams =
      /^\/result\/[^/]+$/.test(pathname) &&
      searchParams.has('similarity') &&
      searchParams.has('emotion') &&
      searchParams.has('emotionProb')

    if (isImageCompare || isResultWithParams) return

    sessionStorage.removeItem(USER_IMAGE_KEY)
    sessionStorage.removeItem(IMAGE_COMPARE_STORAGE_KEY)
  }, [pathname, searchParams])

  return null
}
