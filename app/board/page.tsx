'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

const PAGE_SIZE = 10
const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '좋아요순' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

type PostRow = {
  id: string
  title: string
  image_url: string | null
  created_at: string
  user_id: string
  author_display_name: string | null
  view_count?: number
  like_count?: number
}

type UserRow = {
  id: string
  email: string | null
  nickname: string | null
  raw_user_meta_data: { full_name?: string; name?: string } | null
}

function getAuthorDisplayName(u: UserRow): string {
  const nickname = (u.nickname ?? '').trim()
  if (nickname) return nickname
  const meta = u.raw_user_meta_data
  return (meta?.full_name || meta?.name || u.email || '알 수 없음').trim() || '알 수 없음'
}

function formatRelativeOrDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (60 * 1000))
      if (diffMins < 1) return '방금 전'
      return `${diffMins}분 전`
    }
    return `${diffHours}시간 전`
  }
  if (diffDays === 1) return '1일 전'
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [authorByUserId, setAuthorByUserId] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortValue>('latest')
  const [page, setPage] = useState(1)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [togglingPostId, setTogglingPostId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchPosts = async () => {
      const supabase = createClient()
      const orderBy = sort === 'likes' ? 'like_count' : 'created_at'
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, image_url, user_id, created_at, author_display_name, view_count, like_count')
        .order(orderBy, { ascending: false })
      if (error) {
        setLoading(false)
        return
      }
      const list = (data as PostRow[]) ?? []
      setPosts(list)

      const userIds = [...new Set(list.map((p) => p.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email, nickname, raw_user_meta_data')
          .in('id', userIds)
        const map: Record<string, string> = {}
        ;(usersData as UserRow[] | null)?.forEach((u) => {
          map[u.id] = getAuthorDisplayName(u)
        })
        setAuthorByUserId(map)
      }

      const postIds = list.map((p) => p.id)
      if (postIds.length > 0) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)
        setLikedPostIds(new Set((likesData ?? []).map((r: { post_id: string }) => r.post_id)))
      } else {
        setLikedPostIds(new Set())
      }
      setLoading(false)
    }
    fetchPosts()
  }, [user, sort])

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => p.title.toLowerCase().includes(q))
  }, [posts, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paginatedPosts = useMemo(
    () =>
      filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredPosts, currentPage]
  )

  // 현재 페이지가 총 페이지를 넘어가면 1로 맞춤 (검색/정렬로 목록이 줄었을 때)
  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, page])

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)))

  // 페이지 번호 버튼에 보여줄 구간 (많은 페이지일 때 1 ... 4 5 6 ... 20 형태)
  const pageNumbers = useMemo(() => {
    const maxVisible = 7
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: number[] = []
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [totalPages, currentPage])

  const startItem = filteredPosts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endItem = Math.min(currentPage * PAGE_SIZE, filteredPosts.length)

  const handleLikeToggle = async (postId: string) => {
    if (!user || togglingPostId) return
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    const currentlyLiked = likedPostIds.has(postId)
    const nextLiked = !currentlyLiked
    setTogglingPostId(postId)
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (nextLiked) next.add(postId)
      else next.delete(postId)
      return next
    })
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, like_count: (p.like_count ?? 0) + (nextLiked ? 1 : -1) } : p
      )
    )
    const supabase = createClient()
    if (nextLiked) {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    } else {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    }
    setTogglingPostId(null)
  }

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
          maxWidth: 900,
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
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        maxWidth: 900,
        margin: '0 auto',
        minHeight: 'calc(100vh - 201px)',
      }}
    >
      {/* 상단: 게시판 제목 + 검색 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          커뮤니티 
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortValue)
              setPage(1)
            }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: 'inherit',
              fontSize: 14,
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.08)',
                color: 'inherit',
                fontSize: 14,
                minWidth: 160,
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.6,
                pointerEvents: 'none',
              }}
              aria-hidden
            >
              🔍
            </span>
          </span>
        </div>
      </div>

      {/* 게시글 수 / 구간 표시 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
        {!loading && filteredPosts.length > 0 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
            총 {filteredPosts.length}건 · {currentPage} / {totalPages}페이지
            {totalPages > 1 && ` (${startItem}-${endItem}번)`}
          </p>
        )}
        {/* 오른쪽 정렬: 게시글 수 없어도 글쓰기 버튼은 항상 오른쪽에 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginLeft: 'auto',
          }}
        >
          <Link
            href="/board/new"
            style={{
              padding: '0.6rem 1.25rem',
              background: '#1976d2',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            글쓰기
          </Link>
        </div>
      </div>

      {/* 테이블 목록 */}
      {loading ? (
        <p>목록 불러오는 중...</p>
      ) : filteredPosts.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.6)', padding: '2rem 0' }}>글이 없습니다.</p>
      ) : (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>No</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>제목</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>글쓴이</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>작성시간</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>조회수</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, fontSize: 13 }}>좋아요</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPosts.map((post, idx) => {
                const no = filteredPosts.length - (currentPage - 1) * PAGE_SIZE - idx
                const author = post.author_display_name ?? authorByUserId[post.user_id] ?? '알 수 없음'
                return (
                  <tr
                    key={post.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{no}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Link
                        href={`/board/detail?id=${post.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          fontWeight: 500,
                        }}
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{author}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                      {formatRelativeOrDate(post.created_at)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      {post.view_count ?? 0}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: 14, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          handleLikeToggle(post.id)
                        }}
                        disabled={togglingPostId === post.id}
                        aria-pressed={likedPostIds.has(post.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 6,
                          background: likedPostIds.has(post.id) ? 'rgba(233, 30, 99, 0.15)' : 'transparent',
                          color: likedPostIds.has(post.id) ? '#e91e63' : 'rgba(255,255,255,0.8)',
                          cursor: togglingPostId === post.id ? 'not-allowed' : 'pointer',
                          fontSize: 13,
                        }}
                      >
                        <span aria-hidden>{likedPostIds.has(post.id) ? '♥' : '♡'}</span>
                        <span>{post.like_count ?? 0}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages >= 1 && filteredPosts.length > 0 && (
        <nav
          role="navigation"
          aria-label="게시글 목록 페이지"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="이전 페이지"
            style={{
              padding: '0.35rem 0.5rem',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'inherit',
              borderRadius: 6,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            ←
          </button>
          {currentPage > 2 && totalPages > 5 && (
            <>
              <button
                type="button"
                onClick={() => goToPage(1)}
                style={{
                  padding: '0.35rem 0.6rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: 'inherit',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                1
              </button>
              {currentPage > 3 && <span style={{ padding: '0 0.25rem', opacity: 0.6 }}>…</span>}
            </>
          )}
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-label={`${p}페이지`}
              aria-current={p === currentPage ? 'page' : undefined}
              style={{
                padding: '0.35rem 0.6rem',
                border: `1px solid ${p === currentPage ? '#1976d2' : 'rgba(255,255,255,0.2)'}`,
                background: p === currentPage ? 'rgba(25,118,210,0.3)' : 'transparent',
                color: 'inherit',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: p === currentPage ? 600 : 400,
              }}
            >
              {p}
            </button>
          ))}
          {currentPage < totalPages - 1 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 2 && <span style={{ padding: '0 0.25rem', opacity: 0.6 }}>…</span>}
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                style={{
                  padding: '0.35rem 0.6rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: 'inherit',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="다음 페이지"
            style={{
              padding: '0.35rem 0.5rem',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'inherit',
              borderRadius: 6,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
            }}
          >
            →
          </button>
        </nav>
      )}
    </div>
  )
}
