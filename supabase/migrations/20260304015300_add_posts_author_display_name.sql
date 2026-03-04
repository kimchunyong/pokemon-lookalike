ALTER TABLE posts
ADD COLUMN IF NOT EXISTS author_display_name text;

COMMENT ON COLUMN posts.author_display_name IS '글 작성 시점의 작성자 표시명(닉네임/이름)';
