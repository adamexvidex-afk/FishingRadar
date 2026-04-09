
-- 1. Create a leaderboard function that returns only aggregate data (no private details)
CREATE OR REPLACE FUNCTION public.get_leaderboard(since_date date)
RETURNS TABLE(user_id uuid, catch_count bigint, max_weight numeric, max_length numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    c.user_id,
    COUNT(*)::bigint AS catch_count,
    COALESCE(MAX(c.weight), 0) AS max_weight,
    COALESCE(MAX(c.length), 0) AS max_length
  FROM public.catches c
  WHERE c.catch_date >= since_date
  GROUP BY c.user_id
$$;

-- 2. Restore owner-only SELECT policy on catches
DROP POLICY IF EXISTS "Users can view all catches" ON public.catches;
CREATE POLICY "Users can view own catches" ON public.catches
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Drop the overly permissive bait-illustrations INSERT policy
DROP POLICY IF EXISTS "Service role can upload bait illustrations" ON storage.objects;

-- 4. Drop any overly permissive fish-illustrations INSERT policy  
DROP POLICY IF EXISTS "Authenticated users can upload fish illustrations" ON storage.objects;
