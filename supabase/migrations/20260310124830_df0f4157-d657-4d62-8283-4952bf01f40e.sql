
-- Add image_url column to post_comments
ALTER TABLE public.post_comments ADD COLUMN image_url text;

-- Create comment_likes table
CREATE TABLE public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read comment likes"
  ON public.comment_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comment likes"
  ON public.comment_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment likes"
  ON public.comment_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
