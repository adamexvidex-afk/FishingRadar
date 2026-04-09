CREATE OR REPLACE FUNCTION public.get_leaderboard(since_date date)
 RETURNS TABLE(user_id uuid, catch_count bigint, max_weight numeric, max_length numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT 
    c.user_id,
    COUNT(*)::bigint AS catch_count,
    COALESCE(MAX(c.weight), 0) AS max_weight,
    COALESCE(MAX(c.length), 0) AS max_length
  FROM public.catches c
  WHERE c.catch_date >= since_date
    AND c.is_public = true
  GROUP BY c.user_id
$$;