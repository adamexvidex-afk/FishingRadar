-- Remove near-duplicate locations (same name + country, within 1km, keep oldest)
DELETE FROM fishing_locations
WHERE id IN (
  SELECT b_id FROM (
    SELECT 
      b.id as b_id,
      ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY b.created_at) as rn
    FROM fishing_locations a
    JOIN fishing_locations b 
      ON a.name = b.name 
      AND a.country = b.country 
      AND a.id < b.id
      AND 6371 * 2 * asin(sqrt(
        power(sin(radians(a.lat - b.lat) / 2), 2) + 
        cos(radians(a.lat)) * cos(radians(b.lat)) * 
        power(sin(radians(a.lng - b.lng) / 2), 2)
      )) < 5
  ) sub
);