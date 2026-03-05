-- 댓글 테이블
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) >= 1 and char_length(content) <= 1000),
  author_display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.post_comments is '게시글 댓글';
comment on column public.post_comments.author_display_name is '댓글 작성 시점의 작성자 표시명';

-- 인덱스: 게시글별 댓글 조회 최적화
create index if not exists idx_post_comments_post_id on public.post_comments(post_id, created_at asc);

-- posts 테이블에 comment_count 컬럼 추가
alter table public.posts add column if not exists comment_count integer not null default 0;
comment on column public.posts.comment_count is '댓글 수';

-- RLS 활성화
alter table public.post_comments enable row level security;

-- RLS 정책: 로그인 사용자 누구나 읽기
create policy "post_comments_select" on public.post_comments
  for select to authenticated using (true);

-- RLS 정책: 로그인 사용자 본인 댓글 작성
create policy "post_comments_insert" on public.post_comments
  for insert to authenticated with check (auth.uid() = user_id);

-- RLS 정책: 본인 댓글만 삭제
create policy "post_comments_delete" on public.post_comments
  for delete to authenticated using (auth.uid() = user_id);

-- RLS 정책: 본인 댓글만 수정
create policy "post_comments_update" on public.post_comments
  for update to authenticated using (auth.uid() = user_id);
