'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) router.replace('/login')
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
      })
      .select('id')
      .single()
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    if (data?.id) router.replace(`/board/detail?id=${data.id}`)
  }

  if (authLoading || !user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>글쓰기</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxSizing: 'border-box',
          }}
        />
        <label htmlFor="content" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
        {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: 14 }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.5rem 1rem',
              background: submitting ? '#ccc' : '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '저장 중...' : '등록'}
          </button>
          <Link
            href="/board"
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              textDecoration: 'none',
              color: '#333',
            }}
          >
            취소
          </Link>
        </div>
      </form>
      <p style={{ marginTop: '1rem', fontSize: 14 }}>
        <Link href="/board" style={{ color: '#1976d2' }}>
          ← 목록
        </Link>
      </p>
    </div>
  )
}
