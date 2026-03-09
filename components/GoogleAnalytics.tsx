'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import ReactGA from 'react-ga4'

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

let hasInitialized = false
let lastTrackedPage = ''

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    if (!measurementId || hasInitialized) {
      return
    }

    ReactGA.initialize(measurementId)
    hasInitialized = true
  }, [])

  useEffect(() => {
    if (!measurementId || !pathname) {
      return
    }

    if (!hasInitialized) {
      ReactGA.initialize(measurementId)
      hasInitialized = true
    }

    const page = search ? `${pathname}?${search}` : pathname

    if (page === lastTrackedPage) {
      return
    }

    ReactGA.send({
      hitType: 'pageview',
      page,
      title: document.title,
    })

    lastTrackedPage = page
  }, [pathname, search])

  return null
}
