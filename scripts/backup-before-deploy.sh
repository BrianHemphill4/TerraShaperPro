#!/bin/bash
# Pre-deployment backup script for TerraShaper Pro
# Creates comprehensive backups before major deployments

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"
LOG_FILE="logs/backup-$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directories
mkdir -p "$BACKUP_DIR"
mkdir -p "logs"

log "Starting pre-deployment backup to $BACKUP_DIR"

# Check prerequisites
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL environment variable not set"
    exit 1
fi

# Database backup
log "Creating database backup..."
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql"; then
    log "Database backup completed successfully"
    # Get database size for verification
    DB_SIZE=$(wc -c < "$BACKUP_DIR/database.sql")
    log "Database backup size: $DB_SIZE bytes"
else
    error "Database backup failed"
    exit 1
fi

# Redis backup (if Redis is available)
log "Creating Redis backup..."
if command -v redis-cli &> /dev/null; then
    if [ -n "$REDIS_URL" ]; then
        # Extract host and port from Redis URL
        REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\).*/\1/p')
        
        if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$BACKUP_DIR/redis.rdb"
            log "Redis backup completed"
        else
            redis-cli --rdb "$BACKUP_DIR/redis.rdb"
            log "Redis backup completed (localhost)"
        fi
    else
        redis-cli --rdb "$BACKUP_DIR/redis.rdb"
        log "Redis backup completed"
    fi
else
    warn "Redis CLI not available, skipping Redis backup"
fi

# Environment variables backup
log "Backing up environment configuration..."
if [ -f ".env" ]; then
    # Create sanitized copy without sensitive values
    grep -E '^[A-Z_]+=.*' .env | sed 's/=.*/=***REDACTED***/' > "$BACKUP_DIR/env.template"
    log "Environment template created (sensitive values redacted)"
else
    warn ".env file not found"
fi

# Package.json versions
log "Recording package versions..."
if [ -f "package.json" ]; then
    cp package.json "$BACKUP_DIR/package.json"
    
    # Get npm list output
    npm list --depth=0 > "$BACKUP_DIR/npm-list.txt" 2>/dev/null || true
    log "Package versions recorded"
fi

# Git state backup
log "Recording git state..."
git rev-parse HEAD > "$BACKUP_DIR/git-commit.txt"
git branch --show-current > "$BACKUP_DIR/git-branch.txt"
git status --porcelain > "$BACKUP_DIR/git-status.txt"
git log --oneline -10 > "$BACKUP_DIR/git-recent-commits.txt"

# Record any uncommitted changes
if [ -s "$BACKUP_DIR/git-status.txt" ]; then
    warn "Uncommitted changes detected!"
    git diff > "$BACKUP_DIR/git-diff.patch" 2>/dev/null || true
fi

log "Git state recorded"

# Storage bucket state (if gsutil is available)
log "Recording storage state..."
if command -v gsutil &> /dev/null; then
    # List all buckets and their contents
    gsutil ls -l gs://terrashaper-renders > "$BACKUP_DIR/storage-renders.txt" 2>/dev/null || warn "Could not access renders bucket"
    gsutil ls -l gs://terrashaper-uploads > "$BACKUP_DIR/storage-uploads.txt" 2>/dev/null || warn "Could not access uploads bucket"
    gsutil ls -l gs://terrashaper-plants > "$BACKUP_DIR/storage-plants.txt" 2>/dev/null || warn "Could not access plants bucket"
    log "Storage state recorded"
else
    warn "gsutil not available, skipping storage backup"
fi

# Configuration files
log "Backing up configuration files..."
CONFIG_FILES=("tsconfig.json" "turbo.json" "vercel.json" "drizzle.config.ts")
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        log "Backed up $file"
    fi
done

# Create backup metadata
log "Creating backup metadata..."
cat > "$BACKUP_DIR/backup-metadata.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "git_commit": "$(cat "$BACKUP_DIR/git-commit.txt")",
  "git_branch": "$(cat "$BACKUP_DIR/git-branch.txt")",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)",
  "backup_script_version": "1.0.0",
  "purpose": "Pre-deployment backup",
  "restore_command": "scripts/restore-backup.sh $BACKUP_DIR"
}
EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Create restore instructions
cat > "$BACKUP_DIR/RESTORE_INSTRUCTIONS.md" << EOF
# Restore Instructions

## Backup Information
- **Created**: $TIMESTAMP
- **Git Commit**: $(cat "$BACKUP_DIR/git-commit.txt")
- **Branch**: $(cat "$BACKUP_DIR/git-branch.txt")
- **Size**: $BACKUP_SIZE

## Quick Restore
\`\`\`bash
# Full restore
scripts/restore-backup.sh $BACKUP_DIR

# Database only
psql \$DATABASE_URL < $BACKUP_DIR/database.sql

# Redis only (if backed up)
redis-cli --pipe < $BACKUP_DIR/redis.rdb
\`\`\`

## Manual Steps
1. Restore database: \`psql \$DATABASE_URL < $BACKUP_DIR/database.sql\`
2. Restore Redis: \`redis-cli --pipe < $BACKUP_DIR/redis.rdb\`
3. Check git state: \`git checkout \$(cat $BACKUP_DIR/git-commit.txt)\`
4. Restore configuration files as needed

## Verification
- Check application health endpoints
- Verify database connectivity
- Test Redis connection
- Confirm storage bucket access
EOF

log "Backup completed successfully!"
log "Backup location: $BACKUP_DIR"
log "Restore with: scripts/restore-backup.sh $BACKUP_DIR"

# Create symlink to latest backup
ln -sfn "$BACKUP_DIR" "backups/latest"
log "Latest backup symlink updated"

# Cleanup old backups (keep last 10)
log "Cleaning up old backups..."
ls -t backups/ | grep -E '^[0-9]{8}_[0-9]{6}$' | tail -n +11 | xargs -I {} rm -rf "backups/{}"
log "Old backup cleanup completed"

log "Pre-deployment backup process completed successfully"