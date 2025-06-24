# Scripts Directory

Utility scripts for TerraShaper Pro development, deployment, and maintenance.

## Deployment Scripts

### `backup-before-deploy.sh`
Comprehensive pre-deployment backup script.

**Usage:**
```bash
./scripts/backup-before-deploy.sh
```

**Features:**
- Database backup with verification
- Redis state backup
- Git state recording
- Environment configuration backup
- Storage bucket metadata
- Automatic cleanup of old backups

### `restore-backup.sh`
Restores system state from backup directory.

**Usage:**
```bash
# Interactive restore
./scripts/restore-backup.sh backups/20241224_143022

# Force restore without prompts
./scripts/restore-backup.sh backups/20241224_143022 --force

# Database only
./scripts/restore-backup.sh backups/20241224_143022 --database-only

# Redis only
./scripts/restore-backup.sh backups/20241224_143022 --redis-only
```

## Vercel Deployment

### `vercel-build.sh`
Custom build script for Vercel deployment.

**Usage:**
```bash
./scripts/vercel-build.sh
```

**Features:**
- Environment-specific builds
- Optimized for Vercel's build environment
- Includes pre-build validations

### `vercel-ignore-build.sh`
Determines whether Vercel should skip builds.

**Usage:**
```bash
./scripts/vercel-ignore-build.sh
```

**Logic:**
- Skip builds for documentation-only changes
- Skip builds for non-web app changes
- Always build for production deployments

## Data Management

### `import-plants.ts`
Imports and processes the Texas native plant database.

**Usage:**
```bash
# Run via npm script
npm run import-plants

# Run directly
npx ts-node scripts/import-plants.ts
```

**Features:**
- Processes 400+ plant species from CSV
- Downloads and optimizes plant images
- Generates WebP thumbnails
- Extracts dominant colors
- Creates search indexes

## Monitoring & Alerts

### `setup-sentry-alerts.ts`
Configures Sentry error tracking and alerts.

**Usage:**
```bash
npx ts-node scripts/setup-sentry-alerts.ts
```

**Features:**
- Sets up error tracking rules
- Configures alert policies
- Creates performance monitoring
- Establishes notification channels

## Development Workflow

### Recommended Usage

1. **Before major deployments:**
   ```bash
   ./scripts/backup-before-deploy.sh
   ```

2. **For plant database updates:**
   ```bash
   npm run import-plants
   ```

3. **When setting up monitoring:**
   ```bash
   npx ts-node scripts/setup-sentry-alerts.ts
   ```

4. **For emergency rollbacks:**
   ```bash
   ./scripts/restore-backup.sh backups/latest --force
   ```

## Script Organization

```
scripts/
├── README.md                  # This file
├── backup-before-deploy.sh    # Pre-deployment backup
├── restore-backup.sh          # Backup restoration
├── import-plants.ts           # Plant database import
├── setup-sentry-alerts.ts     # Monitoring setup
├── vercel-build.sh           # Vercel build script
└── vercel-ignore-build.sh    # Vercel build skip logic
```

## Environment Requirements

### Shell Scripts (.sh)
- **bash**: Version 4.0+
- **jq**: For JSON processing
- **psql**: PostgreSQL client
- **redis-cli**: Redis client (optional)
- **gsutil**: Google Cloud Storage CLI (optional)

### TypeScript Scripts (.ts)
- **Node.js**: Version 20+
- **ts-node**: For direct execution
- **npm**: Package manager

## Error Handling

All scripts include:
- Comprehensive error checking
- Graceful failure handling
- Detailed logging
- Rollback instructions
- Progress indicators

## Security Considerations

- Scripts never log sensitive information
- Environment variables are redacted in backups
- Service credentials are handled securely
- All network operations use secure protocols

## Maintenance

Scripts are designed to be:
- **Self-documenting**: Clear variable names and comments
- **Modular**: Reusable functions and patterns
- **Testable**: Can be tested in isolation
- **Monitorable**: Comprehensive logging and metrics