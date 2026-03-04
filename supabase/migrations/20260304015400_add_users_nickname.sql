ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS nickname text;

COMMENT ON COLUMN public.users.nickname IS '커뮤니티 작성자 표시용 닉네임(선택)';
