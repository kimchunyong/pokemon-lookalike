-- 인증된 사용자가 자신의 폴더(user_id)에만 업로드 가능
CREATE POLICY "Allow authenticated uploads to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- public 버킷이므로 모든 사용자가 조회 가능 (SELECT)
CREATE POLICY "Public read post-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'post-images');

-- 본인이 올린 파일만 삭제 가능
CREATE POLICY "Allow authenticated delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);
