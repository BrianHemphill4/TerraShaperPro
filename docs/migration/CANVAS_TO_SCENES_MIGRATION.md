# Canvas to Scenes Data Migration Guide

This document provides detailed guidance for safely migrating existing TerraShaper Pro projects from the legacy canvas-based design system to the new photo annotation system.

## Overview

The migration script (`scripts/migrate-canvas-to-scenes.ts`) converts:
- **Canvas objects** → **Annotation masks**
- **Single project canvas** → **Multi-scene project structure**
- **Project-level renders** → **Scene-specific renders**

## Pre-Migration Checklist

Before running the migration, ensure:

1. **Database backup is complete**
   ```bash
   ./scripts/backup-before-deploy.sh
   ```

2. **Environment variables are set**
   ```bash
   # Verify DATABASE_URL is configured
   echo $DATABASE_URL
   ```

3. **Dependencies are up to date**
   ```bash
   npm install
   ```

4. **Migration script tests pass**
   ```bash
   npm run test scripts/__tests__/migrate-canvas-to-scenes.test.ts
   ```

## Running the Migration

### Step 1: Preview Changes (Dry Run)

Always start with a dry run to preview what will be migrated:

```bash
npm run migrate:canvas-to-scenes
```

This will show:
- Number of projects to migrate
- Canvas objects that will be converted
- Renders that will be updated
- Any potential issues

### Step 2: Review Output

The dry run provides detailed statistics:

```
🚀 Starting Canvas to Scene Migration (DRY RUN mode)

🔍 Finding projects with canvas data...
📊 Found 5 projects to migrate

📦 Migrating project: Garden Design (abc-123-def)
  📝 Would create default scene for project Garden Design
  🎭 Converted 12 canvas objects to masks
  📝 Would update 3 renders to reference scene dry-run-scene-id
  📝 Would clean up canvas data for project abc-123-def
  ✅ Migrated successfully

📊 Migration Summary
==================================================
Total projects checked: 5
Successfully migrated: 5
Skipped (errors): 0
Scenes created: 5
Masks converted: 45
Renders updated: 15

💡 This was a DRY RUN. Use --execute to perform the migration.
```

### Step 3: Execute Migration

If the dry run results look correct, execute the migration:

```bash
npm run migrate:canvas-to-scenes -- --execute
```

## What Gets Migrated

### Projects
- **Canvas data removal**: `canvas_data` field removed from project metadata
- **Address addition**: Missing addresses filled with placeholder text
- **Metadata cleanup**: Canvas-related metadata removed

### Scenes
- **Default scene creation**: Each project gets one default scene
- **Placeholder image**: Initially set to `/placeholder-scene.jpg`
- **Ordering**: Scene order set to 1, marked as default

### Masks
- **Object conversion**: Canvas objects become annotation masks
- **Category mapping**: Objects categorized as Plants, Mulch, Hardscape, or Other
- **Path conversion**: Canvas paths converted to GeoJSON format
- **Soft delete**: Deleted canvas objects remain marked as deleted

### Renders
- **Scene association**: Existing renders linked to new default scene
- **Project relationship**: Maintained for backwards compatibility

## Category Mapping

Canvas objects are categorized according to this mapping:

| Canvas Type | Annotation Category |
|-------------|-------------------|
| plant, tree, shrub | Plants & Trees |
| mulch, rock, gravel | Mulch & Rocks |
| hardscape, pathway, deck, patio, structure | Hardscape |
| unknown/other | Other |

## Path Conversion Examples

### Polygon Objects
```javascript
// Canvas format
{
  type: 'polygon',
  path: [[0, 0], [100, 0], [100, 100], [0, 100]]
}

// Converted to GeoJSON
{
  type: 'Polygon',
  coordinates: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]]
}
```

### Point Objects
```javascript
// Canvas format
{
  type: 'circle',
  position: { x: 50, y: 75 }
}

// Converted to GeoJSON
{
  type: 'Point',
  coordinates: [50, 75]
}
```

## Error Handling

The migration script handles various error conditions:

### Common Issues

1. **Missing canvas data**
   - Projects without canvas data are skipped
   - No error logged (expected condition)

2. **Invalid object paths**
   - Objects with malformed paths are skipped
   - Warning logged with object ID

3. **Database constraints**
   - Foreign key violations halt migration for that project
   - Error logged with full context

4. **Partial failures**
   - Individual object conversion failures don't stop project migration
   - Warnings logged for investigation

### Error Recovery

If the migration fails partway through:

1. **Check the error log** for specific issues
2. **Fix data inconsistencies** manually if needed
3. **Re-run the migration** (it's idempotent)

## Post-Migration Steps

After successful migration:

### 1. Verify Data Integrity

```sql
-- Check that all projects have scenes
SELECT 
  p.id, 
  p.name, 
  COUNT(s.id) as scene_count
FROM projects p
LEFT JOIN scenes s ON p.id = s.project_id
GROUP BY p.id, p.name
HAVING COUNT(s.id) = 0;
-- Should return no rows

-- Check that renders are properly linked
SELECT 
  r.id,
  r.scene_id,
  s.project_id
FROM renders r
LEFT JOIN scenes s ON r.scene_id = s.id
WHERE s.id IS NULL;
-- Should return no rows
```

### 2. Update Application Configuration

- Deploy updated application code
- Update any hardcoded references to canvas system
- Test scene upload and annotation functionality

### 3. User Communication

- Notify users about the system upgrade
- Provide documentation on new photo annotation features
- Offer support for any questions about the new interface

## Rollback Procedure

If issues are discovered after migration:

### 1. Stop Application Traffic
```bash
# Scale down application instances
# or enable maintenance mode
```

### 2. Restore Database
```bash
./scripts/restore-backup.sh backups/[timestamp] --force
```

### 3. Revert Application Code
```bash
git revert [migration-commit-hash]
git push origin main
```

### 4. Resume Traffic
```bash
# Scale up application instances
# or disable maintenance mode
```

## Monitoring

After migration, monitor these metrics:

### Application Metrics
- Scene upload success rate
- Annotation tool performance
- User session duration
- Error rates in annotation features

### Database Metrics
- Query performance on scenes/masks tables
- Storage usage growth
- Index effectiveness

### User Feedback
- Support ticket volume
- User satisfaction surveys
- Feature adoption rates

## Troubleshooting

### Migration Won't Start

**Symptom**: Script exits immediately with error

**Solutions**:
- Check `DATABASE_URL` environment variable
- Verify database connectivity
- Ensure proper permissions on database

### Some Projects Skipped

**Symptom**: Projects appear in "skipped" count

**Solutions**:
- Check error log for specific issues
- Verify project data integrity
- Run migration again (it's idempotent)

### Performance Issues

**Symptom**: Migration takes very long time

**Solutions**:
- Run during low-traffic hours
- Consider migrating in batches
- Check database performance

### Canvas Objects Not Converting

**Symptom**: Low mask conversion count

**Solutions**:
- Check canvas object path formats
- Verify object deletion status
- Review category mapping logic

## Migration Script Testing

The migration includes comprehensive tests covering:

### Unit Tests
```bash
npm run test scripts/__tests__/migrate-canvas-to-scenes.test.ts
```

### Integration Tests
```bash
# Create test project with canvas data
# Run migration on test data
# Verify results manually
```

### Performance Tests
```bash
# Test with large datasets
# Monitor memory usage
# Verify acceptable execution time
```

## Support

For migration support:

1. **Review logs** first for obvious errors
2. **Check documentation** for common issues
3. **Run tests** to verify environment
4. **Contact development team** for complex issues

## Appendix: Database Schema Changes

The migration expects these tables to exist:

```sql
-- Scenes table (should already exist)
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  image_url TEXT NOT NULL,
  order INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Masks table (should already exist)  
CREATE TABLE masks (
  id UUID PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id),
  category VARCHAR(50) NOT NULL,
  path JSONB NOT NULL,
  deleted BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Renders table updates (should already exist)
ALTER TABLE renders ADD COLUMN scene_id UUID REFERENCES scenes(id);
```

## Related Documentation

- [Canvas to Photo Annotation Migration Tasks](../CANVAS_TO_ANNOTATION_MIGRATION.md)
- [Database Schema Documentation](../api/db/README.md)
- [Backup and Restore Procedures](../deployment/backup-procedures.md)