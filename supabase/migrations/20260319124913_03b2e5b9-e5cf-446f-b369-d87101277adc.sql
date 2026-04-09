DELETE FROM fishing_locations
WHERE id NOT IN (
  SELECT DISTINCT ON (name, ROUND(lat::numeric, 4), ROUND(lng::numeric, 4), country) id
  FROM fishing_locations
  ORDER BY name, ROUND(lat::numeric, 4), ROUND(lng::numeric, 4), country, created_at ASC
);