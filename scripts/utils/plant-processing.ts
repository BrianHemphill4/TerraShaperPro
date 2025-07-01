import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Interface for plant record from CSV
 */
export interface PlantRecord {
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

/**
 * Interface for processed plant data ready for database insertion
 */
export interface ProcessedPlantData {
  scientific_name: string;
  common_names: string[];
  usda_zones: string[];
  water_needs: string;
  sun_requirements: string;
  mature_height_ft: number | null;
  mature_width_ft: number | null;
  growth_rate: string;
  texas_native: boolean;
  drought_tolerant: boolean;
  image_url: string;
  thumbnail_url: string;
  dominant_color: string;
  description: string;
  care_instructions: string;
  category: string;
  tags: string[];
  search_vector: string;
}

/**
 * Parse sun requirements from text to standardized enum
 */
export function parseSunRequirements(sunPref: string): string {
  const lower = sunPref.toLowerCase();
  if (lower.includes('full sun')) return 'full_sun';
  if (lower.includes('partial')) return 'partial_sun';
  if (lower.includes('shade')) return 'shade';
  return 'full_sun';
}

/**
 * Parse water needs based on drought resistance level
 */
export function parseWaterNeeds(droughtLevel: string): string {
  const level = parseInt(droughtLevel) || 3;
  if (level >= 4) return 'low';
  if (level >= 2) return 'moderate';
  return 'high';
}

/**
 * Get Texas USDA zones (default set for Texas plants)
 */
export function getTexasZones(plantType: string): string[] {
  // Texas spans zones 6b-10a with most areas in 8a-9b
  return ['6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a'];
}

/**
 * Extract dominant color from image using Sharp
 */
export async function extractDominantColor(imagePath: string): Promise<string> {
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

/**
 * Generate WebP thumbnail with optimized settings
 */
export async function generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

/**
 * Generate optimized WebP version of original image
 */
export async function generateWebPImage(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .webp({ quality: 90 })
    .toFile(outputPath);
}

/**
 * Generate JPEG fallback for browsers without WebP support
 */
export async function generateJPEGFallback(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}

/**
 * Generate search vector content for full-text search
 */
export function generateSearchVector(record: PlantRecord): string {
  const searchContent = [
    record.commonName,
    record.speciesName,
    record.nicknames,
    record.plantType,
    ...record.nicknames.split(/[,-]/).filter(n => n.trim())
  ].join(' ').toLowerCase();
  
  return searchContent;
}

/**
 * Generate comprehensive tags for plant
 */
export function generatePlantTags(record: PlantRecord): string[] {
  const sunReq = parseSunRequirements(record.sunPreference);
  const waterNeeds = parseWaterNeeds(record.droughtResistant);
  const isDroughtTolerant = parseInt(record.droughtResistant) >= 3;

  return [
    record.plantType.toLowerCase(),
    'texas',
    sunReq,
    waterNeeds + '_water',
    isDroughtTolerant ? 'drought_tolerant' : 'water_dependent',
    // Add maintenance level tag
    `maintenance_${record.maintenanceLevel}`,
    // Add lifespan category
    parseInt(record.avgLifespan) > 20 ? 'long_lived' : 'short_lived'
  ];
}

/**
 * Generate enhanced description based on plant data
 */
export function generateDescription(record: PlantRecord): string {
  const droughtLevel = parseInt(record.droughtResistant);
  const maintenanceDesc = parseInt(record.maintenanceLevel) <= 2 ? 'low-maintenance' : 'moderate-maintenance';
  
  return `${record.commonName} is a ${record.plantType.toLowerCase()} suitable for Texas landscapes. ` +
    `This ${maintenanceDesc} plant has a drought tolerance rating of ${droughtLevel}/5 and ` +
    `typically lives for ${record.avgLifespan} years.`;
}

/**
 * Generate care instructions based on plant data
 */
export function generateCareInstructions(record: PlantRecord): string {
  const maintenance = parseInt(record.maintenanceLevel);
  const drought = parseInt(record.droughtResistant);
  const disease = parseInt(record.diseaseRisk);
  
  let instructions = `Maintenance Level: ${maintenance}/5 (${maintenance <= 2 ? 'Low' : 'Moderate'}). `;
  instructions += `Drought Tolerance: ${drought}/5. `;
  instructions += `Disease Risk: ${disease}/5 (${disease <= 2 ? 'Low' : 'Moderate'} risk). `;
  instructions += `Average lifespan: ${record.avgLifespan} years. `;
  
  // Add specific care tips based on ratings
  if (drought >= 4) {
    instructions += 'Water sparingly once established. ';
  } else if (drought <= 2) {
    instructions += 'Requires regular watering, especially in summer. ';
  }
  
  if (disease >= 4) {
    instructions += 'Monitor for common diseases and ensure good air circulation. ';
  }
  
  return instructions;
}

/**
 * Process plant record into database-ready format
 */
export function processPlantRecord(
  record: PlantRecord, 
  imageUrl: string, 
  thumbnailUrl: string, 
  dominantColor: string
): ProcessedPlantData {
  return {
    scientific_name: record.speciesName,
    common_names: [record.commonName, ...record.nicknames.split(/[,-]/).filter(n => n.trim())],
    usda_zones: getTexasZones(record.plantType),
    water_needs: parseWaterNeeds(record.droughtResistant),
    sun_requirements: parseSunRequirements(record.sunPreference),
    mature_height_ft: null, // Not available in CSV
    mature_width_ft: null, // Not available in CSV
    growth_rate: 'moderate', // Default value
    texas_native: true, // Assuming all plants in DB are Texas-appropriate
    drought_tolerant: parseInt(record.droughtResistant) >= 3,
    image_url: imageUrl,
    thumbnail_url: thumbnailUrl,
    dominant_color: dominantColor,
    description: generateDescription(record),
    care_instructions: generateCareInstructions(record),
    category: record.plantType,
    tags: generatePlantTags(record),
    search_vector: generateSearchVector(record),
  };
}

/**
 * Validate image file exists and is readable
 */
export async function validateImageFile(imagePath: string): Promise<boolean> {
  try {
    await fs.access(imagePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${filePath}:`, error);
      }
    })
  );
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
    throw error;
  }
}