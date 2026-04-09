CREATE OR REPLACE FUNCTION public.get_states_for_fish(fish_name text)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT DISTINCT fl.state
    FROM fishing_locations fl
    WHERE EXISTS (
      SELECT 1 FROM unnest(fl.species) s WHERE LOWER(s) = LOWER(fish_name)
    )
    AND fl.state IS NOT NULL
    ORDER BY fl.state
  )
$$;