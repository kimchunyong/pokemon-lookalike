'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('로그인 처리 중...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.slice(1))

    const error = params.get('error') ?? hashParams.get('error')
    const errorDesc = params.get('error_description') ?? hashParams.get('error_description')

    if (error) {
      setIsError(true)
      setMessage(
        typeof errorDesc === 'string'
          ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
          : '로그인에 실패했습니다.'
      )
      return
    }

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/')
      }
    })

    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        return
      }

      setTimeout(async () => {
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession) {
          router.replace('/')
        } else {
          setIsError(true)
          setMessage('로그인 세션을 확인할 수 없습니다. 다시 시도해 주세요.')
        }
      }, 3000)
    }

    checkExistingSession()

    return () => subscription.unsubscribe()
  }, [router])

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
