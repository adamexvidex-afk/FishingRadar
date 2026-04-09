
CREATE OR REPLACE FUNCTION public.get_country_summary()
RETURNS TABLE(country text, loc_count bigint, avg_lat double precision, avg_lng double precision)
LANGUAGE sql
STABLE
SECURITY INVOKER
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
