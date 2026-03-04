'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

type PostRow = {
  id: string
  title: string
  image_url: string | null
  created_at: string
  user_id: string
}

export default function BoardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchPosts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, image_url, user_id, created_at')
        .order('created_at', { ascending: false })
      if (!error) setPosts((data as PostRow[]) ?? [])
      setLoading(false)
    }
    fetchPosts()
  }, [user])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (authLoading) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p>불러오는 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          maxWidth: 800,
          margin: '0 auto',
          minHeight: 'calc(100vh - 201px)',
        }}
      >
        <h1 style={{ marginBottom: '1rem' }}>커뮤니티</h1>
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '2rem',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            게시판을 이용하려면 로그인이 필요합니다.
            <br />
            로그인 후 글을 읽고 작성할 수 있습니다.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#1976d2',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            로그인하기
          </Link>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: 14 }}>
          <Link href="/" style={{ color: '#1976d2' }}>
            ← 홈으로
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: 800,
        margin: '0 auto',
        minHeight: 'calc(100vh - 201px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1>커뮤니티</h1>
        <Link
          href="/board/new"
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          글쓰기
        </Link>
      </div>

      {loading ? (
        <p>목록 불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#666' }}>글이 없습니다.</p>
      ) : (
        <ul style={{ flex: 1, listStyle: 'none', padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                borderBottom: '1px solid #eee',
                padding: '0.75rem 0',
              }}
            >
              <Link
                href={`/board/detail?id=${post.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt=""
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span style={{ fontWeight: 500, flex: '1 1 auto', minWidth: 0 }}>
                  {post.title}
                </span>
                <span
                  style={{
                    color: '#888',
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {formatDate(post.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: 14 }}>
        <Link href="/" style={{ color: '#1976d2' }}>
          ← 홈
        </Link>
      </p>
    </div>
  )
}
