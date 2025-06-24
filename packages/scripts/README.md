# Scripts Package

Collection of one-off and scheduled scripts for data management, database seeding, and system maintenance tasks.

## Purpose

- **Data Migration**: Import and transform external data sources
- **Database Seeding**: Initialize database with reference data
- **Maintenance Tasks**: Cleanup, optimization, and system health scripts
- **Development Utilities**: Tools for local development and testing

## Available Scripts

### Plant Database Import
Processes and imports the Texas native plant database:

```bash
# Import plants from CSV
npm run import-plants

# Or run directly
npx ts-node src/ingest-plants.ts
```

**Features:**
- Processes 400+ plant species from CSV
- Downloads and optimizes plant images
- Generates WebP thumbnails for performance
- Extracts dominant colors for UI
- Creates search indexes for filtering

### Future Scripts
Planned maintenance and utility scripts:

- **cleanup-temp-files.ts**: Remove expired temporary uploads
- **update-plant-data.ts**: Refresh plant database from external sources
- **generate-sitemap.ts**: Create SEO sitemap
- **backup-database.ts**: Automated database backups
- **analytics-export.ts**: Export usage analytics
- **user-migration.ts**: Migrate user data between environments

## Script Structure

Each script follows a consistent pattern:

```typescript
#!/usr/bin/env npx ts-node

import { performance } from 'perf_hooks'
import { db } from '@terrashaper/db'
import { logger } from '@terrashaper/shared'

async function main(): Promise<void> {
  const startTime = performance.now()
  
  try {
    logger.info('Starting script execution...')
    
    // Script logic here
    
    const duration = performance.now() - startTime
    logger.info(`Script completed in ${duration.toFixed(2)}ms`)
  } catch (error) {
    logger.error('Script failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
```

## Plant Import Script

The plant ingestion script processes the Texas plant database:

```typescript
// Usage
import { ingestPlants } from '@terrashaper/scripts'

await ingestPlants({
  csvPath: './assets/Plant_DB_400.csv',
  imagePath: './assets/Plant_Images/',
  outputFormat: 'webp',
  thumbnailSizes: [150, 300, 600],
  extractColors: true
})
```

**Processing Steps:**
1. Parse CSV data with validation
2. Download and validate plant images
3. Generate optimized thumbnails
4. Extract dominant color palettes
5. Insert records with transaction safety
6. Update search indexes

## Development

```bash
# Install dependencies
npm install

# Run a script
npm run import-plants

# Run with ts-node directly
npx ts-node src/ingest-plants.ts

# Build for production
npm run build

# Type check
npm run typecheck
```

## Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://...

# File paths
PLANT_CSV_PATH=./assets/Plant_DB_400.csv
PLANT_IMAGES_PATH=./assets/Plant_Images/

# Processing options
IMAGE_QUALITY=85
THUMBNAIL_SIZES=150,300,600
EXTRACT_COLORS=true

# Logging
LOG_LEVEL=info
```

## Error Handling

Scripts include comprehensive error handling:

- **Validation**: Input data validation before processing
- **Transactions**: Database operations wrapped in transactions
- **Rollback**: Automatic rollback on failure
- **Logging**: Detailed logging for debugging
- **Progress**: Progress indicators for long-running tasks

## Performance

- **Batch Processing**: Large datasets processed in chunks
- **Parallel Processing**: Concurrent image processing
- **Memory Management**: Streaming for large files
- **Progress Reporting**: Real-time progress updates

## Dependencies

- **@terrashaper/db**: Database access
- **@terrashaper/storage**: File operations
- **@terrashaper/shared**: Utilities and logging
- **CSV Parser**: CSV file processing
- **Sharp**: Image processing