
CREATE TABLE public.favorite_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  group_id uuid NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE public.favorite_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.favorite_groups
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorite_groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorite_groups
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
