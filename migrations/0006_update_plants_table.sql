-- Update plants table with additional fields for better search and display

-- Add new columns
ALTER TABLE plants ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS dominant_color VARCHAR(7);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE plants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_common_names ON plants USING GIN(common_names);
CREATE INDEX IF NOT EXISTS idx_plants_tags ON plants USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_plants_water_needs ON plants(water_needs);
CREATE INDEX IF NOT EXISTS idx_plants_sun_requirements ON plants(sun_requirements);
CREATE INDEX IF NOT EXISTS idx_plants_usda_zones ON plants USING GIN(usda_zones);
CREATE INDEX IF NOT EXISTS idx_plants_texas_native ON plants(texas_native);
CREATE INDEX IF NOT EXISTS idx_plants_drought_tolerant ON plants(drought_tolerant);

-- Add full text search
ALTER TABLE plants ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update search vector
UPDATE plants SET search_vector = 
  setweight(to_tsvector('english', coalesce(scientific_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(array_to_string(common_names, ' '), '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C');

-- Create index for full text search
CREATE INDEX IF NOT EXISTS idx_plants_search ON plants USING GIN(search_vector);

-- Create trigger to update search vector
CREATE OR REPLACE FUNCTION update_plants_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.scientific_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.common_names, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plants_search_vector_trigger
BEFORE INSERT OR UPDATE ON plants
FOR EACH ROW EXECUTE FUNCTION update_plants_search_vector();

-- Add updated_at trigger
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create plant favorites table
CREATE TABLE IF NOT EXISTS plant_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, plant_id)
);

CREATE INDEX IF NOT EXISTS idx_plant_favorites_user ON plant_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_favorites_plant ON plant_favorites(plant_id);