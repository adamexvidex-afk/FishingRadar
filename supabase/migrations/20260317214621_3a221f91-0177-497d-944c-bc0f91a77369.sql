CREATE OR REPLACE FUNCTION public.get_country_summary()
RETURNS TABLE(country text, loc_count bigint, avg_lat double precision, avg_lng double precision)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(country, 'Unknown') as country,
    COUNT(*) as loc_count,
    AVG(lat) as avg_lat,
    AVG(lng) as avg_lng
  FROM public.fishing_locations
  GROUP BY COALESCE(country, 'Unknown')
  ORDER BY country;
$$;

CREATE INDEX IF NOT EXISTS idx_fishing_locations_country ON public.fishing_locations(country);
CREATE INDEX IF NOT EXISTS idx_fishing_locations_country_name ON public.fishing_locations(country, name);