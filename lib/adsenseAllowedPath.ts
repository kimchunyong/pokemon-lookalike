/**
 * AdSense 스크립트(adsbygoogle.js)는 **홈(`/`)에서만** 로드합니다.
 * 그 외 경로에서는 스크립트 자체를 넣지 않아 자동 광고·수동 단위가
 * 다른 URL에서 실행되지 않게 하고, "게시자 콘텐츠가 없는 화면에 광고" 정책 이슈를 줄입니다.
 *
 * 수동 광고 단위(`AdSenseSlot`)를 쓸 경우에도 홈에만 배치하세요.
 *
 * @see https://support.google.com/adsense/answer/10502938
 */
export function shouldLoadAdSenseScript(pathname: string | null): boolean {
  if (!pathname) return false
  const normalized = pathname.split('?')[0] ?? ''
  return normalized === '/'
}
