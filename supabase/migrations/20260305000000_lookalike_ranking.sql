-- 포켓몬 닮은꼴 랭킹전: 유사도 순 공개 랭킹 (사용자당 1건, 최고 기록만)
CREATE TABLE IF NOT EXISTS public.lookalike_ranking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pokemon_id int NOT NULL,
  pokemon_name text NOT NULL,
  similarity numeric(5,4) NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.lookalike_ranking ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.lookalike_ranking IS '닮은꼴 랭킹전: 유사도 순 공개 순위';
CREATE INDEX IF NOT EXISTS idx_lookalike_ranking_similarity ON public.lookalike_ranking(similarity DESC);

-- 익명/인증 모두 랭킹 목록 조회 가능
CREATE POLICY "Anyone can read lookalike ranking"
ON public.lookalike_ranking FOR SELECT TO anon, authenticated
USING (true);

-- 인증 사용자만 자신의 행 삽입/수정 가능
CREATE POLICY "Users can insert own ranking"
ON public.lookalike_ranking FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ranking"
ON public.lookalike_ranking FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
