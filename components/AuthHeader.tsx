'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthHeader() {
  const { user, loading, signOut } = useAuth()

  if (loading) return null

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        gap: '1rem',
        borderBottom: '1px solid #eee',
        fontSize: 14,
      }}
    >
      {user ? (
        <>
          <span title={user.email ?? undefined}>
            {user.email ?? '로그인됨'}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: 4,
            }}
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link href="/login" style={{ color: '#1976d2' }}>
          로그인
        </Link>
      )}
    </header>
  )
}
