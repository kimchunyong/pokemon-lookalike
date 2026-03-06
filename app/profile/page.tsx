'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

const NICKNAME_MAX = 30

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', user.id)
        .single()
      setNickname((data as { nickname: string | null } | null)?.nickname ?? '')
    }
    load()
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const trimmed = nickname.trim()
    if (trimmed.length > NICKNAME_MAX) {
      setError(t.profile.errorMaxLength.replace('{{max}}', String(NICKNAME_MAX)))
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('users')
      .update({
        nickname: trimmed || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setMessage(trimmed ? t.profile.messageSaved : t.profile.messageCleared)
  }

  if (authLoading || !user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t.profile.loginRequired}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 480, margin: '0 auto' }}>
      <h1>{t.profile.title}</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: '1rem' }}>
        {t.profile.description}
      </p>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <label htmlFor="nickname" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          {t.profile.nicknameLabel}
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={NICKNAME_MAX}
          placeholder={t.profile.nicknamePlaceholder}
          disabled={saving}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: 12, color: '#888', marginBottom: '1rem' }}>
          {nickname.length}/{NICKNAME_MAX}자
        </p>
        {error && <p style={{ color: '#c62828', fontSize: 14, marginBottom: '0.5rem' }}>{error}</p>}
        {message && (
          <p style={{ color: '#2e7d32', fontSize: 14, marginBottom: '0.5rem' }}>{message}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            background: saving ? '#ccc' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? t.profile.saving : t.profile.save}
        </button>
      </form>
      <p style={{ fontSize: 14 }}>
        <Link href="/board" style={{ color: '#1976d2' }}>
          {t.common.back} {t.header.navBoard}
        </Link>
      </p>
    </div>
  )
}
