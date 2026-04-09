
CREATE OR REPLACE FUNCTION public.get_nearest_spots(_lat double precision, _lng double precision, _limit integer DEFAULT 20)
RETURNS TABLE(
  name text,
  lat double precision,
  lng double precision,
  category text,
  country text,
  state text,
  species text[],
  distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT
    fl.name,
    fl.lat,
    fl.lng,
    fl.category,
    fl.country,
    fl.state,
    fl.species,
    -- Haversine approximation in km
    6371 * 2 * asin(sqrt(
      power(sin(radians(fl.lat - _lat) / 2), 2) +
      cos(radians(_lat)) * cos(radians(fl.lat)) *
      power(sin(radians(fl.lng - _lng) / 2), 2)
    )) AS distance_km
  FROM public.fishing_locations fl
  ORDER BY
    (fl.lat - _lat) * (fl.lat - _lat) + (fl.lng - _lng) * (fl.lng - _lng)
  LIMIT _limit;
$$;
