import ReactGA from 'react-ga4'

type TrackEventParams = {
  category?: string
  action?: string
  label: string
  value?: number
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

export const trackEvent = ({
  category = 'Button',
  action = 'Click',
  label,
  value,
}: TrackEventParams) => {
  if (!measurementId || typeof window === 'undefined') {
    return
  }

  ReactGA.event({
    category,
    action,
    label,
    value,
  })
}
