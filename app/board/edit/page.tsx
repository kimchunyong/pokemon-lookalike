'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { uploadPostImage, deletePostImage } from '@/lib/supabase/uploadPostImage'

type Post = {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
}

export default function EditPostPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return
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
    const { error: err } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        image_url: newImageUrl,
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

  if (loading) return <div style={{ padding: '2rem' }}>불러오는 중...</div>
  if (!id || !post) return <div style={{ padding: '2rem' }}>글이 없습니다.</div>
  if (user && post.user_id !== user.id) return null

  return (
    <div style={{ padding: '1.5rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>글 수정</h1>
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
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          대표 이미지 (1장)
        </label>
        {imageUrl && !removeImage && (
          <div style={{ marginBottom: '0.5rem' }}>
            <img
              src={imageUrl}
              alt="대표 이미지"
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
              이미지 제거
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
                취소 (원래 이미지 유지)
              </button>
            )}
          </>
        )}
        {imageFile && (
          <p style={{ fontSize: 14, color: '#666', marginBottom: '1rem' }}>
            새로 선택됨: {imageFile.name}
          </p>
        )}
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
            {submitting ? '저장 중...' : '저장'}
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
