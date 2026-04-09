-- Create a public bucket for community post photos
INSERT INTO storage.buckets (id, name, public) VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read
CREATE POLICY "Public read community photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'community-photos');

-- Allow service role upload
CREATE POLICY "Service role upload community photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'community-photos');