import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { db, plants } from '@terrashaper/db';
import { createServiceLogger } from '@terrashaper/shared';

const logger = createServiceLogger('plant-ingestion');

const csvFilePath = path.resolve(__dirname, '../../../../Assets/Plant DB 400.csv');
const imageBaseUrl = '/assets/plant-images/'; // Assuming images will be served from here

async function processCSV() {
  const records = [];
  const parser = fs.createReadStream(csvFilePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }
  return records;
}

async function ingestPlants() {
  logger.info('Starting plant ingestion');
  const plantRecords = await processCSV();
  let ingestedCount = 0;

  for (const record of plantRecords) {
    const scientificName = record['Species Name'];
    if (!scientificName) {
      logger.warn('Skipping record with no species name', { record });
      continue;
    }

    const newPlant = {
      scientificName: scientificName,
      commonNames: record['Common Name'] ? [record['Common Name']] : [],
      sunRequirements: record['Sun Preference (Full Sun or Partial Sun, Full Shade)'],
      droughtTolerant: record['Drought Resistant (1-5)']
        ? parseInt(record['Drought Resistant (1-5)'], 10) > 3
        : false,
      imageUrl: record['Underscore'] ? `${imageBaseUrl}${record['Underscore']}.jpg` : null,
      description: `A ${record['Plant Type'] || 'plant'}.`,
    };

    try {
      await db.insert(plants).values(newPlant).onConflictDoNothing();
      ingestedCount++;
    } catch (error) {
      logger.error('Failed to ingest plant', error as Error, { scientificName });
    }
  }

  logger.info('Ingestion complete', {
    totalRecords: plantRecords.length,
    ingestedCount,
    skippedCount: plantRecords.length - ingestedCount,
  });
}

ingestPlants().catch((error) => {
  logger.fatal('An error occurred during plant ingestion', error as Error);
  process.exit(1);
});
