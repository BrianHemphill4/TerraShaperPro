import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { db, plants } from '@terrasherper/db';

const csvFilePath = path.resolve(__dirname, '../../../../Assets/Plant DB 400.csv');
const imageBaseUrl = '/assets/plant-images/'; // Assuming images will be served from here

async function processCSV() {
  const records = [];
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    records.push(record);
  }
  return records;
}

async function ingestPlants() {
  console.log('Starting plant ingestion...');
  const plantRecords = await processCSV();
  let ingestedCount = 0;

  for (const record of plantRecords) {
    const scientificName = record['Species Name'];
    if (!scientificName) {
      console.warn('Skipping record with no species name:', record);
      continue;
    }

    const newPlant = {
      scientificName: scientificName,
      commonNames: record['Common Name'] ? [record['Common Name']] : [],
      sunRequirements: record['Sun Preference (Full Sun or Partial Sun, Full Shade)'],
      droughtTolerant: record['Drought Resistant (1-5)'] ? parseInt(record['Drought Resistant (1-5)'], 10) > 3 : false,
      imageUrl: record['Underscore'] ? `${imageBaseUrl}${record['Underscore']}.jpg` : null,
      description: `A ${record['Plant Type'] || 'plant'}.`,
    };

    try {
      await db.insert(plants).values(newPlant).onConflictDoNothing();
      ingestedCount++;
    } catch (error) {
      console.error(`Failed to ingest plant: ${scientificName}`, error);
    }
  }

  console.log(`Ingestion complete. Processed ${plantRecords.length} records.`);
  console.log(`Successfully ingested ${ingestedCount} new plants.`);
}

ingestPlants().catch(error => {
  console.error('An error occurred during plant ingestion:', error);
  process.exit(1);
}); 