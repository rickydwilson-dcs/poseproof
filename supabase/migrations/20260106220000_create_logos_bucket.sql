-- Migration: Create logos storage bucket with RLS policies
-- Purpose: Allow Pro users to upload custom logos for their exports
-- Similar structure to backgrounds bucket

-- Create logos storage bucket (public for read access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- RLS POLICIES FOR LOGOS BUCKET
-- =============================================================================

-- Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own logos
CREATE POLICY "Users can update their own logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own logos
CREATE POLICY "Users can delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access (logos are displayed in exports)
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Add comment for documentation
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS policies. logos bucket allows Pro users to upload custom logos for exports';
