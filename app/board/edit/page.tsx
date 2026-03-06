'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { uploadPostImage, deletePostImage } from '@/lib/supabase/uploadPostImage'
import { getAuthorDisplayNameFromUser } from '@/lib/getAuthorDisplayName'

type Post = {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
}

function EditPostFallback() {
  const { t } = useLanguage()
  return <div style={{ padding: '2rem' }}>{t.common.loadingShort}</div>
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<EditPostFallback />}>
      <EditPostContent />
    </Suspense>
  )
}

function EditPostContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const id = searchParams.get('id')
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    const fetchPost = async () => {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('posts')
        .select('id, user_id, title, content, image_url')
        .eq('id', id)
        .single()
      if (!err && data) {
        const p = data as Post
        setPost(p)
        setTitle(p.title)
        setContent(p.content)
        setImageUrl(p.image_url ?? null)
      }
      setLoading(false)
    }
    fetchPost()
  }, [id])

  useEffect(() => {
    if (!loading && !authLoading && post && user && post.user_id !== user.id) {
      router.replace(`/board/detail?id=${id}`)
    }
  }, [loading, authLoading, post, user, id, router])

  const TITLE_MIN = 1
  const TITLE_MAX = 200
  const CONTENT_MIN = 1
  const CONTENT_MAX = 10000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return

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

    let newImageUrl: string | null = imageUrl

    if (removeImage && imageUrl) {
      await deletePostImage(imageUrl)
      newImageUrl = null
    } else if (imageFile) {
      const result = await uploadPostImage(user.id, imageFile)
      if (result.error) {
        setError(result.error)
        setSubmitting(false)
        return
      }
      if (imageUrl) await deletePostImage(imageUrl)
      newImageUrl = result.url
    }

    const supabase = createClient()
    const { data: profile } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single()
    const nickname = (profile as { nickname: string | null } | null)?.nickname?.trim()
    const authorDisplayName = nickname || getAuthorDisplayNameFromUser(user)
    const { error: err } = await supabase
      .from('posts')
      .update({
        title: trimmedTitle,
        content: trimmedContent,
        image_url: newImageUrl,
        author_display_name: authorDisplayName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    router.replace(`/board/detail?id=${id}`)
  }

  if (loading) return <div style={{ padding: '2rem' }}>{t.common.loadingShort}</div>
  if (!id || !post) return <div style={{ padding: '2rem' }}>{t.board.empty}</div>
  if (user && post.user_id !== user.id) return null

  return (
    <div style={{ padding: '1.5rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>{t.board.editTitle}</h1>
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
          {t.board.fieldImage}
        </label>
        {imageUrl && !removeImage && (
          <div style={{ marginBottom: '0.5rem' }}>
            <img
              src={imageUrl}
              alt="게시글 대표 이미지"
              style={{ maxWidth: 200, maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
            />
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              disabled={submitting}
              style={{
                marginTop: 4,
                padding: '0.25rem 0.5rem',
                fontSize: 12,
                color: '#c62828',
                background: 'none',
                border: '1px solid #c62828',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {t.board.imageRemove}
            </button>
          </div>
        )}
        {(!imageUrl || removeImage) && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                setImageFile(e.target.files?.[0] ?? null)
                setRemoveImage(false)
              }}
              disabled={submitting}
              style={{ marginBottom: '0.5rem', display: 'block' }}
            />
            {removeImage && (
              <button
                type="button"
                onClick={() => setRemoveImage(false)}
                disabled={submitting}
                style={{ fontSize: 14, color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t.board.imageKeep}
              </button>
            )}
          </>
        )}
        {imageFile && (
          <p style={{ fontSize: 14, color: '#666', marginBottom: '1rem' }}>
            {t.board.imageSelected.replace('{{name}}', imageFile.name)}
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
            {submitting ? t.board.saving : t.board.save}
          </button>
          <Link
            href={`/board/detail?id=${id}`}
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
