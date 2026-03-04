'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

type Post = {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  author_display_name: string | null
  created_at: string
  updated_at: string
  view_count?: number
  like_count?: number
}

export default function PostDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = searchParams.get('id')
  const [post, setPost] = useState<Post | null>(null)
  const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeToggling, setLikeToggling] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    const fetchPost = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select('id, user_id, title, content, image_url, author_display_name, created_at, updated_at, view_count, like_count')
        .eq('id', id)
        .single()
      if (error) {
        setLoading(false)
        return
      }
      const p = data as Post
      setPost(p)
      const viewedKey = `board_viewed_${id}`
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, '1')
        await supabase
          .from('posts')
          .update({ view_count: (p.view_count ?? 0) + 1 })
          .eq('id', id)
      }
      if (!p.author_display_name && p.user_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('nickname, email, raw_user_meta_data')
          .eq('id', p.user_id)
          .single()
        const u = userData as {
          nickname: string | null
          email: string | null
          raw_user_meta_data: { full_name?: string; name?: string } | null
        } | null
        const nickname = (u?.nickname ?? '').trim()
        const displayName = nickname
          ? nickname
          : (u?.raw_user_meta_data?.full_name ||
              u?.raw_user_meta_data?.name ||
              u?.email ||
              '').trim() || '알 수 없음'
        setAuthorDisplayName(displayName)
      } else {
        setAuthorDisplayName(p.author_display_name)
      }
      if (user) {
        const { data: likeRow } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
        setLiked(!!likeRow)
      }
      setLoading(false)
    }
    fetchPost()
  }, [id, user])

  const handleDelete = async () => {
    if (!id || !confirm('이 글을 삭제할까요?')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    setDeleting(false)
    if (!error) router.replace('/board')
  }

  const handleLikeToggle = async () => {
    if (!user || !id || !post || likeToggling) return
    const supabase = createClient()
    setLikeToggling(true)
    const nextLiked = !liked
    const prevCount = post.like_count ?? 0
    setLiked(nextLiked)
    setPost((prev) => (prev ? { ...prev, like_count: prevCount + (nextLiked ? 1 : -1) } : prev))
    if (nextLiked) {
      await supabase.from('post_likes').insert({ post_id: id, user_id: user.id })
    } else {
      await supabase.from('post_likes').delete().eq('post_id', id).eq('user_id', user.id)
    }
    setLikeToggling(false)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const isAuthor = user && post && post.user_id === user.id

  if (loading) return <div style={{ padding: '2rem' }}>불러오는 중...</div>
  if (!id || !post) return <div style={{ padding: '2rem' }}>글이 없습니다.</div>

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: 700,
        margin: '0 auto',
        minHeight: 'calc(100vh - 201px)',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: '0.5rem' }}>
        작성자: {post.author_display_name ?? authorDisplayName ?? '알 수 없음'}
        {' · '}
        {formatDate(post.updated_at !== post.created_at ? post.updated_at : post.created_at)}
        {isAuthor && ' · 본인 글'}
      </p>
      {user && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={handleLikeToggle}
            disabled={likeToggling}
            aria-pressed={liked}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8,
              background: liked ? 'rgba(233, 30, 99, 0.2)' : 'rgba(255,255,255,0.06)',
              color: liked ? '#e91e63' : 'rgba(255,255,255,0.9)',
              cursor: likeToggling ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            <span aria-hidden>{liked ? '♥' : '♡'}</span>
            <span>좋아요 {post.like_count ?? 0}</span>
          </button>
        </div>
      )}
      {post.image_url && (
        <div style={{ marginBottom: '1rem' }}>
          <img
            src={post.image_url}
            alt="대표 이미지"
            style={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
            }}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
          padding: '1rem 0',
          borderTop: '1px solid #eee',
        }}
      >
        {post.content}
      </div>

      {isAuthor && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Link
            href={`/board/edit?id=${id}`}
            style={{
              padding: '0.5rem 1rem',
              background: '#1976d2',
              color: '#fff',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '0.5rem 1rem',
              background: deleting ? '#ccc' : '#c62828',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      )}

      <p style={{ fontSize: 14 }}>
        <Link href="/board" style={{ color: '#1976d2' }}>
          ← 목록
        </Link>
      </p>
    </div>
  )
}
