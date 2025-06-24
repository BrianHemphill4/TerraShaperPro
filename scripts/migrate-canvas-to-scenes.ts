import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import schema types
import { projects, scenes, masks, renders } from '@terrashaper/db/schema';
import type { NewScene, NewMask } from '@terrashaper/db/schema';

interface CanvasObject {
  id: string;
  type: string;
  category?: string;
  path?: any;
  properties?: Record<string, any>;
  position?: { x: number; y: number };
  deleted?: boolean;
}

interface CanvasData {
  objects: CanvasObject[];
  metadata?: Record<string, any>;
}

interface ProjectWithCanvas {
  id: string;
  name: string;
  organization_id: string;
  created_by: string | null;
  canvas_data?: CanvasData;
  address?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface MigrationStats {
  totalProjects: number;
  migratedProjects: number;
  skippedProjects: number;
  createdScenes: number;
  convertedMasks: number;
  updatedRenders: number;
  errors: string[];
}

class CanvasToSceneMigrator {
  private db: ReturnType<typeof drizzle>;
  private isDryRun: boolean;
  private stats: MigrationStats;

  constructor(isDryRun = true) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(client);
    this.isDryRun = isDryRun;
    this.stats = {
      totalProjects: 0,
      migratedProjects: 0,
      skippedProjects: 0,
      createdScenes: 0,
      convertedMasks: 0,
      updatedRenders: 0,
      errors: [],
    };
  }

  async run(): Promise<MigrationStats> {
    console.log(`\n🚀 Starting Canvas to Scene Migration (${this.isDryRun ? 'DRY RUN' : 'EXECUTE'} mode)\n`);

    try {
      // 1. Find projects with canvas data that haven't been migrated
      const projectsToMigrate = await this.findProjectsToMigrate();
      this.stats.totalProjects = projectsToMigrate.length;

      if (projectsToMigrate.length === 0) {
        console.log('✅ No projects require migration');
        return this.stats;
      }

      console.log(`📊 Found ${projectsToMigrate.length} projects to migrate\n`);

      // 2. Process each project
      for (const project of projectsToMigrate) {
        await this.migrateProject(project);
      }

      // 3. Print summary
      this.printSummary();
      return this.stats;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.stats.errors.push(`Global error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async findProjectsToMigrate(): Promise<ProjectWithCanvas[]> {
    console.log('🔍 Finding projects with canvas data...');

    // Query for projects that have canvas_data but no scenes
    const query = sql`
      SELECT p.*, 
             CASE WHEN s.project_id IS NULL THEN TRUE ELSE FALSE END as needs_migration
      FROM projects p
      LEFT JOIN scenes s ON p.id = s.project_id
      WHERE p.metadata ? 'canvas_data' OR p.canvas_data IS NOT NULL
      GROUP BY p.id
      HAVING COUNT(s.id) = 0
    `;

    const result = await this.db.execute(query);
    
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      organization_id: row.organization_id as string,
      created_by: row.created_by as string | null,
      canvas_data: row.canvas_data as CanvasData || (row.metadata as any)?.canvas_data,
      address: row.address as string,
      metadata: row.metadata as Record<string, any>,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
    }));
  }

  private async migrateProject(project: ProjectWithCanvas): Promise<void> {
    console.log(`📦 Migrating project: ${project.name} (${project.id})`);

    try {
      // 1. Create default scene for the project
      const scene = await this.createDefaultScene(project);
      this.stats.createdScenes++;

      // 2. Convert canvas objects to masks
      if (project.canvas_data?.objects) {
        const maskCount = await this.convertCanvasObjectsToMasks(
          project.canvas_data.objects,
          scene.id,
          project.created_by
        );
        this.stats.convertedMasks += maskCount;
      }

      // 3. Update existing renders to reference the new scene
      const renderCount = await this.updateRendersForScene(project.id, scene.id);
      this.stats.updatedRenders += renderCount;

      // 4. Clean up canvas data from project
      await this.cleanupCanvasData(project.id);

      this.stats.migratedProjects++;
      console.log(`  ✅ Migrated successfully`);

    } catch (error) {
      const errorMsg = `Failed to migrate project ${project.name}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`  ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      this.stats.skippedProjects++;
    }
  }

  private async createDefaultScene(project: ProjectWithCanvas): Promise<{ id: string }> {
    // Create a placeholder scene with a default image
    const sceneData: NewScene = {
      projectId: project.id,
      imageUrl: '/placeholder-scene.jpg', // This should be updated with actual scene images
      order: 1,
      isDefault: true,
    };

    if (this.isDryRun) {
      console.log(`  📝 Would create default scene for project ${project.name}`);
      return { id: 'dry-run-scene-id' };
    }

    const [newScene] = await this.db.insert(scenes).values(sceneData).returning({ id: scenes.id });
    console.log(`  📸 Created default scene: ${newScene.id}`);
    return newScene;
  }

  private async convertCanvasObjectsToMasks(
    canvasObjects: CanvasObject[],
    sceneId: string,
    authorId: string | null
  ): Promise<number> {
    let convertedCount = 0;

    for (const obj of canvasObjects) {
      try {
        const mask = await this.convertObjectToMask(obj, sceneId, authorId);
        if (mask) {
          convertedCount++;
        }
      } catch (error) {
        const errorMsg = `Failed to convert canvas object ${obj.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.warn(`    ⚠️  ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }

    console.log(`  🎭 Converted ${convertedCount} canvas objects to masks`);
    return convertedCount;
  }

  private async convertObjectToMask(
    obj: CanvasObject,
    sceneId: string,
    authorId: string | null
  ): Promise<boolean> {
    // Skip objects that shouldn't become masks
    if (!obj.path || obj.deleted) {
      return false;
    }

    // Determine category based on object type and properties
    const category = this.determineCategory(obj);

    // Convert canvas path to GeoJSON format
    const geoJsonPath = this.convertPathToGeoJSON(obj.path, obj.position);

    const maskData: NewMask = {
      sceneId,
      category,
      path: geoJsonPath,
      deleted: false,
      authorId,
    };

    if (this.isDryRun) {
      console.log(`    📝 Would create mask for object ${obj.id} in category "${category}"`);
      return true;
    }

    await this.db.insert(masks).values(maskData);
    console.log(`    🎭 Created mask for object ${obj.id} in category "${category}"`);
    return true;
  }

  private determineCategory(obj: CanvasObject): string {
    // Map canvas object types to mask categories
    const categoryMapping: Record<string, string> = {
      'plant': 'Plants & Trees',
      'tree': 'Plants & Trees',
      'shrub': 'Plants & Trees',
      'mulch': 'Mulch & Rocks',
      'rock': 'Mulch & Rocks',
      'gravel': 'Mulch & Rocks',
      'hardscape': 'Hardscape',
      'pathway': 'Hardscape',
      'deck': 'Hardscape',
      'patio': 'Hardscape',
      'structure': 'Hardscape',
    };

    // First try the object's category if it exists
    if (obj.category && categoryMapping[obj.category.toLowerCase()]) {
      return categoryMapping[obj.category.toLowerCase()];
    }

    // Then try the object type
    if (obj.type && categoryMapping[obj.type.toLowerCase()]) {
      return categoryMapping[obj.type.toLowerCase()];
    }

    // Check properties for hints
    if (obj.properties?.material) {
      const material = obj.properties.material.toLowerCase();
      if (material.includes('plant') || material.includes('tree')) return 'Plants & Trees';
      if (material.includes('mulch') || material.includes('rock')) return 'Mulch & Rocks';
      if (material.includes('concrete') || material.includes('stone')) return 'Hardscape';
    }

    // Default to 'Other' if we can't determine the category
    return 'Other';
  }

  private convertPathToGeoJSON(path: any, position?: { x: number; y: number }): any {
    // Convert various canvas path formats to GeoJSON
    if (Array.isArray(path)) {
      // Assume it's an array of points
      const coordinates = path.map(point => {
        if (Array.isArray(point)) {
          return [point[0], point[1]];
        }
        if (typeof point === 'object' && 'x' in point && 'y' in point) {
          return [point.x, point.y];
        }
        return [0, 0];
      });

      // Close the polygon if it's not already closed
      if (coordinates.length > 0) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          coordinates.push([first[0], first[1]]);
        }
      }

      return {
        type: 'Polygon',
        coordinates: [coordinates],
      };
    }

    if (typeof path === 'object' && path.type) {
      // Already in some form of GeoJSON, return as-is
      return path;
    }

    // Fallback: create a simple point
    const x = position?.x || 0;
    const y = position?.y || 0;
    return {
      type: 'Point',
      coordinates: [x, y],
    };
  }

  private async updateRendersForScene(projectId: string, sceneId: string): Promise<number> {
    if (this.isDryRun) {
      // Count how many renders would be updated
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(renders)
        .where(eq(renders.projectId, projectId));
      
      const count = result[0]?.count || 0;
      console.log(`  📝 Would update ${count} renders to reference scene ${sceneId}`);
      return count;
    }

    // Update renders to reference the new scene
    const result = await this.db
      .update(renders)
      .set({ sceneId })
      .where(eq(renders.projectId, projectId))
      .returning({ id: renders.id });

    console.log(`  🖼️  Updated ${result.length} renders to reference scene ${sceneId}`);
    return result.length;
  }

  private async cleanupCanvasData(projectId: string): Promise<void> {
    if (this.isDryRun) {
      console.log(`  📝 Would clean up canvas data for project ${projectId}`);
      return;
    }

    // Remove canvas_data from project metadata and set address if missing
    await this.db
      .update(projects)
      .set({
        metadata: sql`metadata - 'canvas_data'`,
        address: sql`COALESCE(address, 'Address not provided during migration')`,
      })
      .where(eq(projects.id, projectId));

    console.log(`  🧹 Cleaned up canvas data for project ${projectId}`);
  }

  private printSummary(): void {
    console.log('\n📊 Migration Summary');
    console.log('=' .repeat(50));
    console.log(`Total projects checked: ${this.stats.totalProjects}`);
    console.log(`Successfully migrated: ${this.stats.migratedProjects}`);
    console.log(`Skipped (errors): ${this.stats.skippedProjects}`);
    console.log(`Scenes created: ${this.stats.createdScenes}`);
    console.log(`Masks converted: ${this.stats.convertedMasks}`);
    console.log(`Renders updated: ${this.stats.updatedRenders}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      this.stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (this.isDryRun) {
      console.log('\n💡 This was a DRY RUN. Use --execute to perform the migration.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Canvas to Scene Migration Script

Usage:
  npm run migrate:canvas-to-scenes [options]

Options:
  --dry-run    Show what would be migrated without making changes (default)
  --execute    Actually perform the migration
  --help, -h   Show this help message

Examples:
  # Preview the migration
  npm run migrate:canvas-to-scenes

  # Execute the migration
  npm run migrate:canvas-to-scenes --execute
`);
    process.exit(0);
  }

  const migrator = new CanvasToSceneMigrator(isDryRun);
  
  try {
    const stats = await migrator.run();
    
    // Exit with error code if there were any errors
    if (stats.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Migration failed with error:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { CanvasToSceneMigrator };
export type { MigrationStats };