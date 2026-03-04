/**
 * 작성자 표시명: 닉네임이 있으면 닉네임, 없으면 이름/이메일
 */

/** Auth User에서 표시명 추출 (닉네임 없을 때 fallback: full_name → name → email) */
export function getAuthorDisplayNameFromUser(user: {
  user_metadata?: { full_name?: string; name?: string } | null
  email?: string | null
}): string {
  const meta = user?.user_metadata
  const name = (meta?.full_name || meta?.name || user?.email || '').trim()
  return name || '알 수 없음'
}

/** public.users row에서 표시명 추출: 닉네임 우선, 없으면 이름/이메일 */
export function getAuthorDisplayNameFromUserRow(u: {
  nickname?: string | null
  raw_user_meta_data: { full_name?: string; name?: string } | null
  email: string | null
}): string {
  const nickname = (u.nickname ?? '').trim()
  if (nickname) return nickname
  const meta = u.raw_user_meta_data
  return (meta?.full_name || meta?.name || u.email || '알 수 없음').trim() || '알 수 없음'
}
