const CANONICAL_HOST = 'pokemon-lookalike.shop'
const REDIRECT_HOSTS = new Set([
  'pokemon-lookalike.pages.dev',
  'www.pokemon-lookalike.pages.dev',
])

export const getRedirectUrl = (requestUrl) => {
  const url = new URL(requestUrl)
  const shouldRedirectFromPagesDomain = REDIRECT_HOSTS.has(url.hostname)
  const shouldRedirectCanonicalHttps =
    url.hostname === CANONICAL_HOST && url.protocol === 'https:'

  if (!shouldRedirectFromPagesDomain && !shouldRedirectCanonicalHttps) {
    return null
  }

  url.hostname = CANONICAL_HOST
  url.protocol = 'http:'

  return url.toString()
}
