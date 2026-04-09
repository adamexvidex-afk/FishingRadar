
-- Fish species table
CREATE TABLE public.fish_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  latin_name text,
  description text,
  habitat text,
  techniques text[] DEFAULT '{}',
  baits text[] DEFAULT '{}',
  min_size text,
  protection text,
  image_url text,
  category text DEFAULT 'freshwater',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fishing locations table
CREATE TABLE public.fishing_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  category text DEFAULT 'lake',
  species text[] DEFAULT '{}',
  state text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable public read access (no auth needed for catalog/hotspots)
ALTER TABLE public.fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fishing_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fish species" ON public.fish_species FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read fishing locations" ON public.fishing_locations FOR SELECT TO anon, authenticated USING (true);
