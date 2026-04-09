
-- Conversations table
CREATE TABLE public.assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Nov pogovor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.assistant_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.assistant_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.assistant_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.assistant_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.assistant_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.assistant_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assistant_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON public.assistant_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.assistant_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can delete own messages" ON public.assistant_messages FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assistant_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
