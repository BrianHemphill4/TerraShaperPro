#!/bin/bash
# Restore script for TerraShaper Pro backups
# Restores system state from backup directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Check arguments
if [ $# -eq 0 ]; then
    error "Usage: $0 <backup_directory> [--force] [--database-only] [--redis-only]"
    echo
    echo "Options:"
    echo "  --force         Skip confirmation prompts"
    echo "  --database-only Restore database only"
    echo "  --redis-only    Restore Redis only"
    echo
    echo "Available backups:"
    ls -la backups/ | grep '^d' | awk '{print $9}' | grep -E '^[0-9]{8}_[0-9]{6}$' | sort -r
    exit 1
fi

BACKUP_DIR="$1"
FORCE=false
DATABASE_ONLY=false
REDIS_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --database-only)
            DATABASE_ONLY=true
            shift
            ;;
        --redis-only)
            REDIS_ONLY=true
            shift
            ;;
        *)
            if [ "$1" != "$BACKUP_DIR" ]; then
                error "Unknown option: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    error "Backup directory does not exist: $BACKUP_DIR"
    exit 1
fi

# Check for backup metadata
if [ ! -f "$BACKUP_DIR/backup-metadata.json" ]; then
    warn "Backup metadata not found, proceeding anyway..."
else
    info "Backup metadata found:"
    cat "$BACKUP_DIR/backup-metadata.json" | jq -r '
        "  Created: " + .timestamp + 
        "\n  Git Commit: " + .git_commit + 
        "\n  Git Branch: " + .git_branch +
        "\n  Node Version: " + .node_version'
fi

# Confirmation prompt
if [ "$FORCE" = false ]; then
    echo
    warn "This will restore your system from backup: $BACKUP_DIR"
    warn "Current data may be lost or overwritten!"
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

log "Starting restore from $BACKUP_DIR"

# Database restore
if [ "$REDIS_ONLY" = false ]; then
    if [ -f "$BACKUP_DIR/database.sql" ]; then
        log "Restoring database..."
        
        if [ -z "$DATABASE_URL" ]; then
            error "DATABASE_URL environment variable not set"
            exit 1
        fi
        
        # Create backup of current database before restore
        CURRENT_BACKUP="backups/pre-restore-$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$CURRENT_BACKUP"
        log "Creating backup of current database..."
        pg_dump "$DATABASE_URL" > "$CURRENT_BACKUP/database.sql"
        log "Current database backed up to $CURRENT_BACKUP"
        
        # Restore database
        log "Restoring database from backup..."
        if psql "$DATABASE_URL" < "$BACKUP_DIR/database.sql"; then
            log "Database restore completed successfully"
        else
            error "Database restore failed"
            warn "You can restore the current database with:"
            warn "psql \$DATABASE_URL < $CURRENT_BACKUP/database.sql"
            exit 1
        fi
    else
        warn "No database backup found in $BACKUP_DIR"
    fi
fi

# Redis restore
if [ "$DATABASE_ONLY" = false ]; then
    if [ -f "$BACKUP_DIR/redis.rdb" ]; then
        log "Restoring Redis..."
        
        if command -v redis-cli &> /dev/null; then
            # Stop Redis service if running locally
            if pgrep redis-server > /dev/null; then
                warn "Stopping local Redis server..."
                pkill redis-server || true
                sleep 2
            fi
            
            # Copy RDB file to Redis data directory
            if [ -d "/usr/local/var/db/redis/" ]; then
                # macOS Homebrew path
                cp "$BACKUP_DIR/redis.rdb" "/usr/local/var/db/redis/dump.rdb"
            elif [ -d "/var/lib/redis/" ]; then
                # Linux path
                sudo cp "$BACKUP_DIR/redis.rdb" "/var/lib/redis/dump.rdb"
                sudo chown redis:redis "/var/lib/redis/dump.rdb"
            else
                warn "Redis data directory not found, manual restore required"
                warn "Copy $BACKUP_DIR/redis.rdb to your Redis data directory"
            fi
            
            log "Redis restore completed"
        else
            warn "Redis CLI not available, skipping Redis restore"
        fi
    else
        info "No Redis backup found in $BACKUP_DIR"
    fi
fi

# Git state information
if [ -f "$BACKUP_DIR/git-commit.txt" ] && [ "$DATABASE_ONLY" = false ] && [ "$REDIS_ONLY" = false ]; then
    BACKUP_COMMIT=$(cat "$BACKUP_DIR/git-commit.txt")
    CURRENT_COMMIT=$(git rev-parse HEAD)
    
    if [ "$BACKUP_COMMIT" != "$CURRENT_COMMIT" ]; then
        warn "Git commit mismatch:"
        warn "  Current: $CURRENT_COMMIT"
        warn "  Backup:  $BACKUP_COMMIT"
        
        if [ "$FORCE" = false ]; then
            read -p "Do you want to checkout the backup commit? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log "Checking out backup commit..."
                git checkout "$BACKUP_COMMIT"
                log "Git checkout completed"
            fi
        fi
    else
        log "Git commit matches backup"
    fi
fi

# Configuration files restore
if [ "$DATABASE_ONLY" = false ] && [ "$REDIS_ONLY" = false ]; then
    log "Checking configuration files..."
    CONFIG_FILES=("tsconfig.json" "turbo.json" "vercel.json" "drizzle.config.ts")
    
    for file in "${CONFIG_FILES[@]}"; do
        if [ -f "$BACKUP_DIR/$file" ]; then
            if [ -f "$file" ]; then
                # Check if files differ
                if ! diff -q "$file" "$BACKUP_DIR/$file" > /dev/null; then
                    warn "Configuration file differs: $file"
                    if [ "$FORCE" = false ]; then
                        read -p "Restore $file from backup? (y/N): " -n 1 -r
                        echo
                        if [[ $REPLY =~ ^[Yy]$ ]]; then
                            cp "$BACKUP_DIR/$file" "$file"
                            log "Restored $file"
                        fi
                    else
                        cp "$BACKUP_DIR/$file" "$file"
                        log "Restored $file"
                    fi
                fi
            else
                cp "$BACKUP_DIR/$file" "$file"
                log "Restored $file"
            fi
        fi
    done
fi

# Verification steps
log "Running verification checks..."

# Database connection test
if [ "$REDIS_ONLY" = false ]; then
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        log "✓ Database connection successful"
    else
        error "✗ Database connection failed"
    fi
fi

# Redis connection test
if [ "$DATABASE_ONLY" = false ]; then
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            log "✓ Redis connection successful"
        else
            warn "✗ Redis connection failed (this may be normal if Redis is not running locally)"
        fi
    fi
fi

# Show restore summary
log "Restore completed!"
echo
info "Restore Summary:"
info "  Backup: $BACKUP_DIR"
info "  Database: $([ "$REDIS_ONLY" = false ] && echo "✓ Restored" || echo "- Skipped")"
info "  Redis: $([ "$DATABASE_ONLY" = false ] && echo "✓ Restored" || echo "- Skipped")"
info "  Git State: $([ -f "$BACKUP_DIR/git-commit.txt" ] && echo "✓ Available" || echo "- Not found")"

if [ -f "$BACKUP_DIR/RESTORE_INSTRUCTIONS.md" ]; then
    info "  Instructions: $BACKUP_DIR/RESTORE_INSTRUCTIONS.md"
fi

echo
warn "Important next steps:"
warn "1. Restart application services"
warn "2. Verify application functionality"
warn "3. Check logs for any errors"
warn "4. Test critical workflows"

log "Restore process completed"