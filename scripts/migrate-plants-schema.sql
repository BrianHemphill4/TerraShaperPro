-- Migration to add missing fields to plants table and create plant_favorites table
-- Run this script against your database to update the schema

-- Add missing columns to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS dominant_color VARCHAR(7);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE plants ADD COLUMN IF NOT EXISTS search_vector TEXT;

-- Create plant_favorites table
CREATE TABLE IF NOT EXISTS plant_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, plant_id)
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_tags ON plants USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_plants_search_vector ON plants(search_vector);
CREATE INDEX IF NOT EXISTS idx_plant_favorites_user_id ON plant_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_favorites_plant_id ON plant_favorites(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_favorites_user_plant ON plant_favorites(user_id, plant_id);

-- Update search vector for existing plants (if any exist)
UPDATE plants 
SET search_vector = LOWER(
  COALESCE(scientific_name, '') || ' ' ||
  array_to_string(common_names, ' ') || ' ' ||
  COALESCE(category, '') || ' ' ||
  array_to_string(tags, ' ')
)
WHERE search_vector IS NULL;

-- Grant permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON plant_favorites TO anon;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON plant_favorites TO authenticated;