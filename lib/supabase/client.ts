import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저(클라이언트 컴포넌트)에서 사용하는 Supabase 클라이언트.
 * 커뮤니티 페이지 등 클라이언트에서 DB/인증 접근 시 사용.
 * RLS(Row Level Security)가 테이블에 설정되어 있어야 Publishable 키 사용이 안전합니다.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase URL 또는 Anon Key가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.'
    )
  }

  return createBrowserClient(url, key)
}
