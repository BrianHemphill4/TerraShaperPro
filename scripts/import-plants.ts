import { createAdminClient } from '@terrashaper/db';
import { parse } from 'csv-parse';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createAdminClient();

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

interface PlantRecord {
  ref: string;
  p1: string;
  underscore: string;
  speciesName: string;
  commonName: string;
  nicknames: string;
  sunPreference: string;
  maintenanceLevel: string;
  droughtResistant: string;
  diseaseRisk: string;
  avgLifespan: string;
  nickname: string;
  plantType: string;
}

// Parse sun requirements
function parseSunRequirements(sunPref: string): string {
  const lower = sunPref.toLowerCase();
  if (lower.includes('full sun')) return 'full_sun';
  if (lower.includes('partial')) return 'partial_sun';
  if (lower.includes('shade')) return 'shade';
  return 'full_sun';
}

// Parse water needs based on drought resistance
function parseWaterNeeds(droughtLevel: string): string {
  const level = parseInt(droughtLevel) || 3;
  if (level >= 4) return 'low';
  if (level >= 2) return 'moderate';
  return 'high';
}

// Parse USDA zones (Texas is primarily zones 6b-10a)
function getTexasZones(plantType: string): string[] {
  // Default Texas zones
  return ['6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a'];
}

// Extract dominant color from image
async function extractDominantColor(imagePath: string): Promise<string> {
  try {
    const { dominant } = await sharp(imagePath)
      .resize(50, 50)
      .stats();
    
    return `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`;
  } catch (error) {
    console.error(`Error extracting color from ${imagePath}:`, error);
    return '#4A5568'; // Default gray
  }
}

// Generate WebP thumbnail
async function generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

// Upload image to GCS
async function uploadImage(localPath: string, gcsPath: string): Promise<string> {
  await bucket.upload(localPath, {
    destination: gcsPath,
    metadata: {
      contentType: 'image/webp',
    },
  });

  const file = bucket.file(gcsPath);
  await file.makePublic();
  
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsPath}`;
}

async function processPlants() {
  console.log('Starting plant import...');

  // Read CSV file
  const csvPath = path.join(__dirname, '../Assets/Plant DB 400.csv');
  const csvContent = await fs.readFile(csvPath, 'utf-8');

  // Parse CSV
  const records: PlantRecord[] = await new Promise((resolve, reject) => {
    parse(
      csvContent,
      {
        columns: [
          'ref',
          'p1',
          'underscore',
          'speciesName',
          'commonName',
          'nicknames',
          'sunPreference',
          'maintenanceLevel',
          'droughtResistant',
          'diseaseRisk',
          'avgLifespan',
          'nickname',
          'plantType',
        ],
        skip_empty_lines: true,
        from_line: 2, // Skip header
      },
      (err, records) => {
        if (err) reject(err);
        else resolve(records);
      }
    );
  });

  console.log(`Found ${records.length} plants to process`);

  // Process each plant
  for (const record of records) {
    try {
      console.log(`Processing ${record.commonName}...`);

      const imageFileName = `${record.underscore}.png`;
      const imagePath = path.join(__dirname, '../Assets/Plant Images', imageFileName);

      // Check if image exists
      const imageExists = await fs.access(imagePath).then(() => true).catch(() => false);
      
      if (!imageExists) {
        console.warn(`Image not found for ${record.commonName}: ${imageFileName}`);
        continue;
      }

      // Generate thumbnail
      const thumbnailPath = path.join(__dirname, '../temp', `${record.underscore}_thumb.webp`);
      await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
      await generateThumbnail(imagePath, thumbnailPath);

      // Convert original to WebP
      const webpPath = path.join(__dirname, '../temp', `${record.underscore}.webp`);
      await sharp(imagePath)
        .webp({ quality: 90 })
        .toFile(webpPath);

      // Extract dominant color
      const dominantColor = await extractDominantColor(imagePath);

      // Upload to GCS
      const imageUrl = await uploadImage(
        webpPath,
        `plants/${record.underscore}.webp`
      );
      const thumbnailUrl = await uploadImage(
        thumbnailPath,
        `plants/${record.underscore}_thumb.webp`
      );

      // Prepare plant data
      const plantData = {
        scientific_name: record.speciesName,
        common_names: [record.commonName, ...record.nicknames.split(/[,-]/).filter(n => n.trim())],
        usda_zones: getTexasZones(record.plantType),
        water_needs: parseWaterNeeds(record.droughtResistant),
        sun_requirements: parseSunRequirements(record.sunPreference),
        mature_height_ft: null, // Not in CSV
        mature_width_ft: null, // Not in CSV
        growth_rate: 'moderate', // Default
        texas_native: true, // Assuming all plants in DB are Texas-appropriate
        drought_tolerant: parseInt(record.droughtResistant) >= 3,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        dominant_color: dominantColor,
        description: `${record.commonName} is a ${record.plantType.toLowerCase()} suitable for Texas landscapes.`,
        care_instructions: `Maintenance Level: ${record.maintenanceLevel}/5. Average lifespan: ${record.avgLifespan} years.`,
        category: record.plantType,
        tags: [record.plantType.toLowerCase(), 'texas', parseSunRequirements(record.sunPreference)],
      };

      // Insert into database
      const { error } = await supabase
        .from('plants')
        .insert(plantData);

      if (error) {
        console.error(`Error inserting ${record.commonName}:`, error);
      } else {
        console.log(`✓ Imported ${record.commonName}`);
      }

      // Clean up temp files
      await fs.unlink(thumbnailPath);
      await fs.unlink(webpPath);

    } catch (error) {
      console.error(`Error processing ${record.commonName}:`, error);
    }
  }

  console.log('Plant import complete!');
}

// Run the import
processPlants().catch(console.error);