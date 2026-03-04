'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Google OAuth 로그인 후 리다이렉트되는 페이지.
 * Supabase가 세션을 URL에서 복원하므로 getSession()으로 확인 후 홈으로 이동.
 * 에러 쿼리/해시가 있으면 안내 메시지 표시.
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('로그인 처리 중...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const error =
      searchParams.get('error') ??
      (typeof window !== 'undefined' &&
        new URLSearchParams(window.location.hash.slice(1)).get('error'))
    const errorDesc =
      searchParams.get('error_description') ??
      (typeof window !== 'undefined' &&
        new URLSearchParams(window.location.hash.slice(1)).get('error_description'))

    if (error) {
      setIsError(true)
      setMessage(
        typeof errorDesc === 'string'
          ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
          : '로그인에 실패했습니다.'
      )
      return
    }

    const finishLogin = async () => {
      const supabase = createClient()
      const code = searchParams.get('code')

      if (code) {
        setMessage('로그인 완료 처리 중...')
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setIsError(true)
          setMessage(exchangeError.message || '로그인 세션을 확인할 수 없습니다.')
          return
        }
        if (data.session) {
          router.replace('/')
          return
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        return
      }
      setMessage('세션을 가져오는 중...')
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/')
        return
      }
      setIsError(true)
      setMessage('로그인 세션을 확인할 수 없습니다. 다시 시도해 주세요.')
    }

    finishLogin()
  }, [searchParams, router])

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: 400,
        margin: '4rem auto',
      }}
    >
      <p style={{ color: isError ? '#c62828' : undefined }}>{message}</p>
      {isError && (
        <p style={{ marginTop: '1rem' }}>
          <Link href="/login" style={{ color: '#1976d2' }}>
            로그인 페이지로 →
          </Link>
        </p>
      )}
    </div>
  )
}
