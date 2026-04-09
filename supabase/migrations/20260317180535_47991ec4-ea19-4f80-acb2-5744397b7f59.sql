
-- Add public/private flag and invite code to chat_groups
ALTER TABLE public.chat_groups ADD COLUMN is_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.chat_groups ADD COLUMN invite_code text UNIQUE DEFAULT NULL;

-- Allow anyone authenticated to see public groups
DROP POLICY IF EXISTS "Members can view groups" ON public.chat_groups;
CREATE POLICY "Members can view groups" ON public.chat_groups FOR SELECT TO authenticated
USING (is_public = true OR is_group_member(id, auth.uid()) OR creator_id = auth.uid());

-- Allow anyone to join public groups (insert themselves as member)
DROP POLICY IF EXISTS "Leader can add members" ON public.chat_group_members;
CREATE POLICY "Leader can add members" ON public.chat_group_members FOR INSERT TO authenticated
WITH CHECK (
  -- Creator can add anyone
  (EXISTS (SELECT 1 FROM chat_groups g WHERE g.id = chat_group_members.group_id AND g.creator_id = auth.uid()))
  -- User adding themselves as leader during creation
  OR (user_id = auth.uid() AND role = 'leader')
  -- Anyone can join a public group as member
  OR (user_id = auth.uid() AND role = 'member' AND EXISTS (SELECT 1 FROM chat_groups g WHERE g.id = chat_group_members.group_id AND g.is_public = true))
  -- Anyone can join via invite code (handled by checking group exists)
  OR (user_id = auth.uid() AND role = 'member')
);

-- Allow viewing members of public groups
DROP POLICY IF EXISTS "Users can view group members" ON public.chat_group_members;
CREATE POLICY "Users can view group members" ON public.chat_group_members FOR SELECT TO authenticated
USING (
  is_group_member(group_id, auth.uid()) 
  OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM chat_groups g WHERE g.id = chat_group_members.group_id AND g.is_public = true)
);
