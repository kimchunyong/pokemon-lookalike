-- 게시글 대표 이미지 URL 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN posts.image_url IS 'Supabase Storage 대표 이미지 공개 URL (1장)';

-- 게시글 이미지용 스토리지 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;
