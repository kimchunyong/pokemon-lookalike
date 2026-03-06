'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAuthorDisplayNameFromUser, getAuthorDisplayNameFromUserRow } from '@/lib/getAuthorDisplayName'

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
  comment_count?: number
}

type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  author_display_name: string | null
  created_at: string
}

function BoardDetailFallback() {
  const { t } = useLanguage()
  return <div style={{ padding: '2rem' }}>{t.common.loadingShort}</div>
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={<BoardDetailFallback />}>
      <PostDetailContent />
    </Suspense>
  )
}

function PostDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const id = searchParams.get('id')
  const [post, setPost] = useState<Post | null>(null)
  const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeToggling, setLikeToggling] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const fetchComments = useCallback(async (postId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, content, author_display_name, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments((data as Comment[]) ?? [])
    setCommentsLoading(false)
  }, [])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setCommentsLoading(false)
      return
    }
    const fetchPost = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select('id, user_id, title, content, image_url, author_display_name, created_at, updated_at, view_count, like_count, comment_count')
        .eq('id', id)
        .single()
      if (error) {
        setLoading(false)
        setCommentsLoading(false)
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
              '').trim() || t.common.unknown
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
      fetchComments(id)
    }
    fetchPost()
  }, [id, user, fetchComments, t])

  const handleDelete = async () => {
    if (!id || !confirm(t.board.deletePostConfirm)) return
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

  const handleCommentSubmit = async () => {
    const trimmed = commentText.trim()
    if (!user || !id || !trimmed || commentSubmitting) return
    setCommentSubmitting(true)
    const supabase = createClient()
    const { data: userRow } = await supabase
      .from('users')
      .select('nickname, email, raw_user_meta_data')
      .eq('id', user.id)
      .maybeSingle()
    const userRowTyped = userRow as { nickname: string | null; email: string | null; raw_user_meta_data: { full_name?: string; name?: string } | null } | null
    const displayName = userRowTyped
      ? getAuthorDisplayNameFromUserRow(userRowTyped)
      : getAuthorDisplayNameFromUser(user)
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: id,
        user_id: user.id,
        content: trimmed,
        author_display_name: displayName,
      })
      .select('id, post_id, user_id, content, author_display_name, created_at')
      .single()
    if (!error && data) {
      setComments((prev) => [...prev, data as Comment])
      setCommentText('')
      const newCount = (post?.comment_count ?? 0) + 1
      setPost((prev) => (prev ? { ...prev, comment_count: newCount } : prev))
      await supabase.from('posts').update({ comment_count: newCount }).eq('id', id)
    }
    setCommentSubmitting(false)
  }

  const handleCommentDelete = async (commentId: string) => {
    if (!id || !confirm(t.board.deleteCommentConfirm)) return
    setDeletingCommentId(commentId)
    const supabase = createClient()
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      const newCount = Math.max((post?.comment_count ?? 1) - 1, 0)
      setPost((prev) => (prev ? { ...prev, comment_count: newCount } : prev))
      await supabase.from('posts').update({ comment_count: newCount }).eq('id', id)
    }
    setDeletingCommentId(null)
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

  if (loading) return <div style={{ padding: '2rem' }}>{t.common.loadingShort}</div>
  if (!id || !post) return <div style={{ padding: '2rem' }}>{t.board.empty}</div>

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: 700,
        margin: '0 auto',
        minHeight: 'calc(100vh - 201px)',
      }}
    >
      <article>
      <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: '0.5rem' }}>
        {t.board.detailAuthor} {post.author_display_name ?? authorDisplayName ?? t.common.unknown}
        {' · '}
        {formatDate(post.updated_at !== post.created_at ? post.updated_at : post.created_at)}
        {isAuthor && ` · ${t.board.myPost}`}
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
            <span>{t.board.likes.replace('{{count}}', String(post.like_count ?? 0))}</span>
          </button>
        </div>
      )}
      {post.image_url && (
        <div style={{ marginBottom: '1rem' }}>
          <img
            src={post.image_url}
            alt="게시글 대표 이미지"
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
            {t.board.edit}
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
            {deleting ? t.board.deleting : t.board.delete}
          </button>
        </div>
      )}

      </article>

      {/* 댓글 섹션 */}
      <section
        style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          {t.board.comments} {comments.length > 0 && <span style={{ color: '#1976d2' }}>{comments.length}</span>}
        </h2>

        {/* 댓글 작성 폼 */}
        {user ? (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              alignItems: 'flex-end',
            }}
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t.board.commentPlaceholder}
              maxLength={1000}
              rows={3}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: 'inherit',
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                minHeight: 60,
              }}
            />
            <button
              type="button"
              onClick={handleCommentSubmit}
              disabled={commentSubmitting || !commentText.trim()}
              style={{
                padding: '0.6rem 1.25rem',
                background: commentSubmitting || !commentText.trim() ? 'rgba(255,255,255,0.1)' : '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: commentSubmitting || !commentText.trim() ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                alignSelf: 'flex-end',
                height: 'fit-content',
              }}
            >
              {commentSubmitting ? t.board.commentSubmitting : t.board.commentSubmit}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
            {t.board.commentLoginRequired}{' '}
            <Link href="/login" style={{ color: '#1976d2' }}>
              {t.board.commentLoginLink}
            </Link>
            {t.board.commentLoginSuffix}
          </p>
        )}

        {/* 댓글 목록 */}
        {commentsLoading ? (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{t.board.loadingComments}</p>
        ) : comments.length === 0 ? (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>
            {t.board.noComments}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comments.map((comment) => {
              const isCommentAuthor = user && comment.user_id === user.id
              const isDeleting = deletingCommentId === comment.id
              return (
                <li
                  key={comment.id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                      {comment.author_display_name ?? t.common.unknown}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {formatDate(comment.created_at)}
                      </span>
                      {isCommentAuthor && (
                        <button
                          type="button"
                          onClick={() => handleCommentDelete(comment.id)}
                          disabled={isDeleting}
                          style={{
                            padding: '0.15rem 0.5rem',
                            fontSize: 12,
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 4,
                            color: isDeleting ? 'rgba(255,255,255,0.3)' : 'rgba(255,100,100,0.8)',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isDeleting ? t.board.deleting : t.board.delete}
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    {comment.content}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p style={{ fontSize: 14, marginTop: '1.5rem' }}>
        <Link href="/board" style={{ color: '#1976d2' }}>
          {t.board.backToList}
        </Link>
      </p>
    </main>
  )
}
