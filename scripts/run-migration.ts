import { createAdminClient } from '@terrashaper/db';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createAdminClient();

async function runMigration(): Promise<void> {
  console.log('Starting database migration...');

  try {
    // Note: Since Supabase doesn't allow direct DDL operations via the client,
    // you'll need to run the SQL migration manually in the Supabase dashboard
    // or use the Supabase CLI. For now, we'll verify the current schema.
    
    console.log('Checking current database schema...');

    // Check if plants table exists and get its structure
    const { data: plantsColumns, error: plantsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'plants')
      .eq('table_schema', 'public');

    if (plantsError) {
      console.error('Error checking plants table:', plantsError);
    } else {
      console.log('Current plants table columns:');
      const columnNames = plantsColumns?.map(col => col.column_name) || [];
      console.log(columnNames);
      
      const requiredColumns = ['thumbnail_url', 'dominant_color', 'category', 'tags', 'search_vector'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✓ All required plant columns are present');
      } else {
        console.log('⚠ Missing plant columns:', missingColumns);
        console.log('\nTo add missing columns, run this SQL in your Supabase dashboard:');
        missingColumns.forEach(col => {
          switch (col) {
            case 'thumbnail_url':
              console.log('ALTER TABLE plants ADD COLUMN thumbnail_url TEXT;');
              break;
            case 'dominant_color':
              console.log('ALTER TABLE plants ADD COLUMN dominant_color VARCHAR(7);');
              break;
            case 'category':
              console.log('ALTER TABLE plants ADD COLUMN category VARCHAR(100);');
              break;
            case 'tags':
              console.log('ALTER TABLE plants ADD COLUMN tags TEXT[] DEFAULT \'{}\';');
              break;
            case 'search_vector':
              console.log('ALTER TABLE plants ADD COLUMN search_vector TEXT;');
              break;
          }
        });
      }
    }

    // Check if plant_favorites table exists
    const { data: favoritesTables, error: favoritesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'plant_favorites')
      .eq('table_schema', 'public');

    if (favoritesError) {
      console.error('Error checking plant_favorites table:', favoritesError);
    } else {
      if (favoritesTables && favoritesTables.length > 0) {
        console.log('✓ plant_favorites table exists');
      } else {
        console.log('⚠ plant_favorites table does not exist');
        console.log('\nTo create plant_favorites table, run this SQL in your Supabase dashboard:');
        console.log(`
CREATE TABLE plant_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, plant_id)
);

CREATE INDEX idx_plant_favorites_user_id ON plant_favorites(user_id);
CREATE INDEX idx_plant_favorites_plant_id ON plant_favorites(plant_id);
        `);
      }
    }

    // Test basic plant table access
    const { data: plantsTest, error: plantsTestError } = await supabase
      .from('plants')
      .select('id, scientific_name')
      .limit(1);

    if (plantsTestError) {
      console.error('Error accessing plants table:', plantsTestError);
    } else {
      console.log(`✓ Plants table accessible, ${plantsTest?.length || 0} plants found in test query`);
    }

    console.log('\nMigration check completed. Please run any required SQL statements manually.');

  } catch (error) {
    console.error('Migration check failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);