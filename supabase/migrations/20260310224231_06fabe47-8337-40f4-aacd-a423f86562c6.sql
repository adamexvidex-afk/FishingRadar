
-- Fix 1: Replace overly broad catches SELECT policy with owner-or-public scoped policy
DROP POLICY IF EXISTS "Users can view all catches" ON public.catches;

-- Ensure proper scoped policies exist
DROP POLICY IF EXISTS "Users can view own catches" ON public.catches;
DROP POLICY IF EXISTS "Anyone can view public catches" ON public.catches;

CREATE POLICY "Users can view own catches"
  ON public.catches FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public catches"
  ON public.catches FOR SELECT TO authenticated
  USING (is_public = true);

-- Fix 2: Make catch-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'catch-photos';
