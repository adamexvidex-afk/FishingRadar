-- Remove fake/placeholder fishing areas in micro-states
DELETE FROM fishing_locations WHERE name IN (
  'Vatican City Central Fishing Area',
  'Monaco Central Fishing Area', 
  'San Marino Central Fishing Area',
  'Liechtenstein Central Fishing Area',
  'Andorra Central Fishing Area',
  'Kosovo Central Fishing Area'
);