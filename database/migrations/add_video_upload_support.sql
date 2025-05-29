-- Add support for video uploads to livestreams table

-- Add 'upload' to livestream_platform enum
ALTER TYPE livestream_platform ADD VALUE IF NOT EXISTS 'upload';

-- Add new columns for video processing
ALTER TABLE livestreams 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS stream_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'live',
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS processing_progress INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index for user_id since we're adding it
CREATE INDEX IF NOT EXISTS idx_livestreams_user ON livestreams(user_id);

-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('livestream-videos', 'livestream-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for video uploads
CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'livestream-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'livestream-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'livestream-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add 'processing' to livestream_status enum
ALTER TYPE livestream_status ADD VALUE IF NOT EXISTS 'processing';