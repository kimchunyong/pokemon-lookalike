'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ReactGA from 'react-ga4'

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

let hasInitialized = false
let lastTrackedPage = ''

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const [locationSearch, setLocationSearch] = useState('')

  useEffect(() => {
    if (!measurementId || hasInitialized) {
      return
    }

    ReactGA.initialize(measurementId)
    hasInitialized = true
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setLocationSearch(window.location.search)
  }, [pathname])

  useEffect(() => {
    if (!measurementId || !pathname) {
      return
    }

    if (!hasInitialized) {
      ReactGA.initialize(measurementId)
      hasInitialized = true
    }

    const page = locationSearch ? `${pathname}${locationSearch}` : pathname

    if (page === lastTrackedPage) {
      return
    }

    ReactGA.send({
      hitType: 'pageview',
      page,
      title: document.title,
    })

    lastTrackedPage = page
  }, [pathname, locationSearch])

  return null
}
