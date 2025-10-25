-- Migration: Add google_drive_thumbnail_url column to content_library
-- This allows storing pre-computed thumbnail URLs for better performance
-- Date: 2025-10-25

BEGIN;

-- Add thumbnail URL column to content_library
ALTER TABLE public.content_library 
ADD COLUMN IF NOT EXISTS google_drive_thumbnail_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.content_library.google_drive_thumbnail_url IS 'Pre-computed Google Drive thumbnail URL generated from google_drive_id using Drive API thumbnail endpoint';

-- Create index for faster queries when filtering by thumbnail availability
CREATE INDEX IF NOT EXISTS idx_content_library_thumbnail_url 
ON public.content_library(google_drive_thumbnail_url) 
WHERE google_drive_thumbnail_url IS NOT NULL;

-- Create index for google_drive_id to speed up backfill operations
CREATE INDEX IF NOT EXISTS idx_content_library_google_drive_id 
ON public.content_library(google_drive_id) 
WHERE google_drive_id IS NOT NULL;

-- Function to generate thumbnail URL from google_drive_id
CREATE OR REPLACE FUNCTION generate_drive_thumbnail_url(drive_id TEXT, size INTEGER DEFAULT 400)
RETURNS TEXT AS $$
BEGIN
  IF drive_id IS NULL OR drive_id = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN 'https://drive.google.com/thumbnail?id=' || drive_id || '&sz=w' || size::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill existing records with google_drive_id but no thumbnail URL
-- This will generate thumbnail URLs for all existing content
UPDATE public.content_library
SET google_drive_thumbnail_url = generate_drive_thumbnail_url(google_drive_id, 400)
WHERE google_drive_id IS NOT NULL 
  AND google_drive_id != ''
  AND (google_drive_thumbnail_url IS NULL OR google_drive_thumbnail_url = '');

-- Log the migration result
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.content_library
  WHERE google_drive_thumbnail_url IS NOT NULL;
  
  RAISE NOTICE 'Migration completed. % records now have thumbnail URLs.', updated_count;
END $$;

COMMIT;
