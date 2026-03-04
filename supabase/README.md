# Supabase 설정

## Storage 버킷 (대표 이미지)

1. Supabase Dashboard → **Storage** → **New bucket**
2. Name: `post-images`
3. **Public bucket** 체크 (글 목록/상세에서 이미지 URL 직접 노출)
4. **Create bucket** 후 Policies:
   - **Allow upload**: `INSERT` for `authenticated`, with policy `(bucket_id = 'post-images')`
   - **Allow read**: `SELECT` for `anon` (또는 public bucket이면 자동)

## 마이그레이션

```bash
# Supabase CLI로 적용 (선택)
supabase db push
```

또는 SQL Editor에서 `migrations/20250304000000_add_post_image_url.sql` 내용 실행.
