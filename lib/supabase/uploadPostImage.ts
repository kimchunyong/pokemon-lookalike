import { createClient } from '@/lib/supabase/client'

const BUCKET = 'post-images'
const MAX_SIZE_MB = 2
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadPostImage(
  userId: string,
  file: File
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { url: null, error: `이미지는 ${MAX_SIZE_MB}MB 이하여야 합니다.` }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'JPEG, PNG, WebP, GIF만 업로드할 수 있습니다.' }
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) return { url: null, error: error.message }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: urlData.publicUrl, error: null }
}

export async function deletePostImage(imageUrl: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const path = pathFromPublicUrl(imageUrl)
  if (!path) return { error: null }
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  return { error: error?.message ?? null }
}

function pathFromPublicUrl(publicUrl: string): string | null {
  try {
    const u = new URL(publicUrl)
    const match = u.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
    if (!match) return null
    const fullPath = decodeURIComponent(match[1])
    const bucketPrefix = `${BUCKET}/`
    return fullPath.startsWith(bucketPrefix) ? fullPath.slice(bucketPrefix.length) : fullPath
  } catch {
    return null
  }
}
