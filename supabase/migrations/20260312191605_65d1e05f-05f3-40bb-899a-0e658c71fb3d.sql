
-- 1. Create tables first
CREATE TABLE public.chat_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  creator_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- 3. Security definer functions (tables exist now)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_accepted_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_group_members
    WHERE group_id = _group_id AND user_id = _user_id AND status = 'accepted'
  )
$$;

-- 4. RLS policies for chat_groups
CREATE POLICY "Members can view groups" ON public.chat_groups
FOR SELECT TO authenticated
USING (public.is_group_member(id, auth.uid()) OR creator_id = auth.uid());

CREATE POLICY "Auth users can create groups" ON public.chat_groups
FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Leader can update group" ON public.chat_groups
FOR UPDATE TO authenticated USING (creator_id = auth.uid());

CREATE POLICY "Leader can delete group" ON public.chat_groups
FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- 5. RLS policies for chat_group_members
CREATE POLICY "Users can view group members" ON public.chat_group_members
FOR SELECT TO authenticated
USING (public.is_group_member(group_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Leader can add members" ON public.chat_group_members
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND g.creator_id = auth.uid())
  OR (user_id = auth.uid() AND role = 'leader')
);

CREATE POLICY "Users can update own membership" ON public.chat_group_members
FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can leave or leader can remove" ON public.chat_group_members
FOR DELETE TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.chat_groups g WHERE g.id = group_id AND g.creator_id = auth.uid())
);

-- 6. RLS policies for group_messages
CREATE POLICY "Members can view group messages" ON public.group_messages
FOR SELECT TO authenticated
USING (public.is_accepted_group_member(group_id, auth.uid()));

CREATE POLICY "Members can send group messages" ON public.group_messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND public.is_accepted_group_member(group_id, auth.uid()));

CREATE POLICY "Users can delete own group messages" ON public.group_messages
FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- 7. Add group_id to notifications
ALTER TABLE public.notifications ADD COLUMN group_id uuid REFERENCES public.chat_groups(id) ON DELETE CASCADE;

-- 8. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_group_members;
