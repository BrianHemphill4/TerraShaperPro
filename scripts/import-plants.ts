import { createAdminClient } from '@terrashaper/db';
import { parse } from 'csv-parse';
import { promises as fs } from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';
import {
  type PlantRecord,
  extractDominantColor,
  generateThumbnail,
  generateWebPImage,
  generateJPEGFallback,
  processPlantRecord,
  validateImageFile,
  cleanupTempFiles,
  ensureDirectory,
} from './utils/plant-processing';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createAdminClient();

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

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

  const tempDir = path.join(__dirname, '../temp');
  await ensureDirectory(tempDir);

  // Process each plant
  for (const record of records) {
    const tempFiles: string[] = [];
    
    try {
      console.log(`Processing ${record.commonName}...`);

      const imageFileName = `${record.underscore}.png`;
      const imagePath = path.join(__dirname, '../Assets/Plant Images', imageFileName);

      // Check if image exists
      const imageExists = await validateImageFile(imagePath);
      
      if (!imageExists) {
        console.warn(`Image not found for ${record.commonName}: ${imageFileName}`);
        continue;
      }

      // Generate thumbnail
      const thumbnailPath = path.join(tempDir, `${record.underscore}_thumb.webp`);
      await generateThumbnail(imagePath, thumbnailPath);
      tempFiles.push(thumbnailPath);

      // Convert original to WebP
      const webpPath = path.join(tempDir, `${record.underscore}.webp`);
      await generateWebPImage(imagePath, webpPath);
      tempFiles.push(webpPath);

      // Generate JPEG fallback
      const jpegPath = path.join(tempDir, `${record.underscore}.jpg`);
      await generateJPEGFallback(imagePath, jpegPath);
      tempFiles.push(jpegPath);

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
      const fallbackUrl = await uploadImage(
        jpegPath,
        `plants/${record.underscore}.jpg`
      );

      // Process plant data using utility function
      const plantData = processPlantRecord(record, imageUrl, thumbnailUrl, dominantColor);

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
      await cleanupTempFiles(tempFiles);

    } catch (error) {
      console.error(`Error processing ${record.commonName}:`, error);
      // Still try to clean up temp files on error
      await cleanupTempFiles(tempFiles);
    }
  }

  console.log('Plant import complete!');
}

// Run the import
processPlants().catch(console.error);