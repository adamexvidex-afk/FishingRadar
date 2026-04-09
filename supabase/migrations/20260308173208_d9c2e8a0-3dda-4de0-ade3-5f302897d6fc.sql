INSERT INTO storage.buckets (id, name, public)
VALUES ('bait-illustrations', 'bait-illustrations', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read bait illustrations"
ON storage.objects FOR SELECT
USING (bucket_id = 'bait-illustrations');

CREATE POLICY "Service role can upload bait illustrations"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bait-illustrations');