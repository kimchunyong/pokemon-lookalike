-- 커뮤니티 작성자 표시를 위해 인증된 사용자가 다른 사용자의 프로필(닉네임 등) 조회 허용
CREATE POLICY "Authenticated can read users for author display"
ON public.users FOR SELECT TO authenticated
USING (true);
