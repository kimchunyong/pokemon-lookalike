'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { uploadPostImage } from '@/lib/supabase/uploadPostImage'
import { getAuthorDisplayNameFromUser } from '@/lib/getAuthorDisplayName'

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [authorPreview, setAuthorPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', user.id)
        .single()
      const nickname = (data as { nickname: string | null } | null)?.nickname?.trim()
      setAuthorPreview(nickname || getAuthorDisplayNameFromUser(user))
    }
    load()
  }, [user])

  const TITLE_MIN = 1
  const TITLE_MAX = 200
  const CONTENT_MIN = 1
  const CONTENT_MAX = 10000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (trimmedTitle.length < TITLE_MIN) {
      setError(t.board.errorTitleRequired)
      return
    }
    if (trimmedTitle.length > TITLE_MAX) {
      setError(t.board.errorTitleMax.replace('{{max}}', String(TITLE_MAX)))
      return
    }
    if (trimmedContent.length < CONTENT_MIN) {
      setError(t.board.errorContentRequired)
      return
    }
    if (trimmedContent.length > CONTENT_MAX) {
      setError(t.board.errorContentMax.replace('{{max}}', String(CONTENT_MAX)))
      return
    }

    setSubmitting(true)
    setError('')

    let imageUrl: string | null = null
    if (imageFile) {
      const result = await uploadPostImage(user.id, imageFile)
      if (result.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      imageUrl = result.url
    }

    const supabase = createClient()
    const { data: profile } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single()
    const nickname = (profile as { nickname: string | null } | null)?.nickname?.trim()
    const authorDisplayName = nickname || getAuthorDisplayNameFromUser(user)
    const { data, error: err } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: trimmedTitle,
        content: trimmedContent,
        image_url: imageUrl,
        author_display_name: authorDisplayName,
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
        <p>{t.profile.loginRequired}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>{t.board.newTitle}</h1>
      {authorPreview && (
        <p style={{ color: '#888', fontSize: 14, marginTop: '0.25rem', marginBottom: '1rem' }}>
          {t.board.authorLabel} <strong style={{ color: 'inherit' }}>{authorPreview}</strong>
          {' · '}
          <Link href="/profile" style={{ color: '#1976d2', fontSize: 13 }}>
            {t.board.changeInProfile}
          </Link>
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          {t.board.fieldTitle}
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={TITLE_MAX}
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
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          {t.board.fieldImageOptional}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          disabled={submitting}
          style={{ marginBottom: '1rem', display: 'block' }}
        />
        {imageFile && (
          <p style={{ fontSize: 14, color: '#666', marginBottom: '1rem' }}>
            {t.board.imageChosen
              .replace('{{name}}', imageFile.name)
              .replace('{{size}}', (imageFile.size / 1024).toFixed(1))}
          </p>
        )}
        <label htmlFor="content" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          {t.board.fieldContent}
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          maxLength={CONTENT_MAX}
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
            {submitting ? t.board.submitting : t.board.submit}
          </button>
          <Link
            href="/board"
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              textDecoration: 'none',
              color: '#fff',
            }}
          >
            {t.board.cancel}
          </Link>
        </div>
      </form>
      <p style={{ marginTop: '1rem', fontSize: 14 }}>
        <Link href="/board" style={{ color: '#1976d2' }}>
          {t.board.backToList}
        </Link>
      </p>
    </div>
  )
}
