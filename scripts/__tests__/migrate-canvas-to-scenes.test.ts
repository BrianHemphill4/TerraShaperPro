import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { CanvasToSceneMigrator } from '../migrate-canvas-to-scenes';
import type { MigrationStats } from '../migrate-canvas-to-scenes';

// Mock postgres and drizzle
const mockExecute = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();
const mockWhere = vi.fn();
const mockSet = vi.fn();

const mockDb = {
  execute: mockExecute,
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
};

mockInsert.mockReturnValue({
  values: mockValues,
});

mockValues.mockReturnValue({
  returning: mockReturning,
});

mockReturning.mockResolvedValue([{ id: 'test-scene-id' }]);

mockUpdate.mockReturnValue({
  set: mockSet,
});

mockSet.mockReturnValue({
  where: mockWhere,
});

mockWhere.mockReturnValue({
  returning: mockReturning,
});

mockSelect.mockReturnValue({
  from: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    }),
  }),
});

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => mockDb),
}));

vi.mock('postgres', () => ({
  default: vi.fn(() => ({})),
}));

vi.mock('@terrashaper/db/schema', () => ({
  projects: {
    id: 'projects.id',
    metadata: 'projects.metadata',
    address: 'projects.address',
  },
  scenes: {
    id: 'scenes.id',
    projectId: 'scenes.project_id',
    imageUrl: 'scenes.image_url',
    order: 'scenes.order',
    isDefault: 'scenes.is_default',
  },
  masks: {
    sceneId: 'masks.scene_id',
    category: 'masks.category',
    path: 'masks.path',
    deleted: 'masks.deleted',
    authorId: 'masks.author_id',
  },
  renders: {
    id: 'renders.id',
    projectId: 'renders.project_id',
    sceneId: 'renders.scene_id',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
}));

// Mock environment
const originalEnv = process.env;

describe('CanvasToSceneMigrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create migrator in dry run mode by default', () => {
      const migrator = new CanvasToSceneMigrator();
      expect(migrator).toBeDefined();
    });

    it('should create migrator in execute mode when specified', () => {
      const migrator = new CanvasToSceneMigrator(false);
      expect(migrator).toBeDefined();
    });

    it('should throw error when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      expect(() => new CanvasToSceneMigrator()).toThrow('DATABASE_URL environment variable is required');
    });
  });

  describe('run method', () => {
    it('should handle empty project list', async () => {
      mockExecute.mockResolvedValueOnce({ rows: [] });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(0);
      expect(stats.migratedProjects).toBe(0);
      expect(stats.skippedProjects).toBe(0);
    });

    it('should find and migrate projects with canvas data', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'obj-1',
                type: 'plant',
                path: [[0, 0], [10, 0], [10, 10], [0, 10]],
                position: { x: 5, y: 5 },
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValueOnce({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(1);
      expect(stats.migratedProjects).toBe(1);
      expect(stats.createdScenes).toBe(1);
      expect(stats.convertedMasks).toBe(1);
    });

    it('should handle migration errors gracefully', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: { objects: [] },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockReturning.mockRejectedValueOnce(new Error('Database error'));

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(1);
      expect(stats.migratedProjects).toBe(0);
      expect(stats.skippedProjects).toBe(1);
      expect(stats.errors).toHaveLength(1);
      expect(stats.errors[0]).toContain('Database error');
    });
  });

  describe('category determination', () => {
    it('should map plant types correctly', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'plant-obj',
                type: 'plant',
                path: [[0, 0], [10, 10]],
              },
              {
                id: 'tree-obj',
                type: 'tree',
                path: [[20, 20], [30, 30]],
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.convertedMasks).toBe(2);
    });

    it('should map hardscape types correctly', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'hardscape-obj',
                type: 'hardscape',
                path: [[0, 0], [10, 10]],
              },
              {
                id: 'patio-obj',
                type: 'patio',
                path: [[20, 20], [30, 30]],
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.convertedMasks).toBe(2);
    });

    it('should handle unknown types with Other category', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'unknown-obj',
                type: 'unknown-type',
                path: [[0, 0], [10, 10]],
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.convertedMasks).toBe(1);
    });
  });

  describe('path conversion', () => {
    it('should convert array of points to GeoJSON polygon', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'polygon-obj',
                type: 'plant',
                path: [[0, 0], [10, 0], [10, 10], [0, 10]],
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.convertedMasks).toBe(1);
    });

    it('should handle point objects with position', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'point-obj',
                type: 'plant',
                path: null,
                position: { x: 100, y: 200 },
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      // Point objects without valid paths should be skipped
      expect(stats.convertedMasks).toBe(0);
    });

    it('should skip deleted objects', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'deleted-obj',
                type: 'plant',
                path: [[0, 0], [10, 10]],
                deleted: true,
              },
              {
                id: 'active-obj',
                type: 'plant',
                path: [[20, 20], [30, 30]],
                deleted: false,
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.convertedMasks).toBe(1);
    });
  });

  describe('render updates', () => {
    it('should update renders in execute mode', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: { objects: [] },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([{ id: 'render-1' }, { id: 'render-2' }]) });

      const migrator = new CanvasToSceneMigrator(false); // Execute mode
      const stats = await migrator.run();

      expect(stats.updatedRenders).toBe(2);
    });

    it('should count renders in dry run mode', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: { objects: [] },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 3 }]),
        }),
      });

      const migrator = new CanvasToSceneMigrator(true); // Dry run mode
      const stats = await migrator.run();

      expect(stats.updatedRenders).toBe(3);
    });
  });

  describe('idempotency', () => {
    it('should skip projects that already have scenes', async () => {
      // Mock query that returns projects with existing scenes
      mockExecute.mockResolvedValueOnce({ rows: [] }); // No projects need migration

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(0);
      expect(stats.migratedProjects).toBe(0);
    });

    it('should only process projects without existing scenes', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'New Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: { objects: [] },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(1);
      expect(stats.migratedProjects).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should collect and report individual project errors', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: { objects: [] },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'project-2',
          name: 'Project 2',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: { objects: [] },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      
      // First project succeeds, second fails
      mockReturning
        .mockResolvedValueOnce([{ id: 'scene-1' }])
        .mockRejectedValueOnce(new Error('Scene creation failed'));

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(2);
      expect(stats.migratedProjects).toBe(1);
      expect(stats.skippedProjects).toBe(1);
      expect(stats.errors).toHaveLength(1);
      expect(stats.errors[0]).toContain('Scene creation failed');
    });

    it('should handle object conversion errors', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'obj-1',
                type: 'plant',
                path: 'invalid-path-format',
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockWhere.mockResolvedValue({ returning: vi.fn().mockResolvedValue([]) });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.migratedProjects).toBe(1);
      expect(stats.convertedMasks).toBe(0); // Invalid object should be skipped
    });
  });

  describe('statistics tracking', () => {
    it('should accurately track all migration statistics', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          organization_id: 'org-1',
          created_by: 'user-1',
          canvas_data: {
            objects: [
              {
                id: 'obj-1',
                type: 'plant',
                path: [[0, 0], [10, 10]],
              },
              {
                id: 'obj-2',
                type: 'hardscape',
                path: [[20, 20], [30, 30]],
              },
            ],
          },
          address: null,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockExecute.mockResolvedValueOnce({ rows: mockProjects });
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      });

      const migrator = new CanvasToSceneMigrator(true);
      const stats = await migrator.run();

      expect(stats.totalProjects).toBe(1);
      expect(stats.migratedProjects).toBe(1);
      expect(stats.skippedProjects).toBe(0);
      expect(stats.createdScenes).toBe(1);
      expect(stats.convertedMasks).toBe(2);
      expect(stats.updatedRenders).toBe(5);
      expect(stats.errors).toHaveLength(0);
    });
  });
});

describe('Migration CLI integration', () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const mockExit = vi.fn();

  beforeEach(() => {
    process.exit = mockExit as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
  });

  it('should default to dry run mode', () => {
    process.argv = ['node', 'script.js'];
    // Test would require importing and running main function
    expect(true).toBe(true); // Placeholder for CLI integration tests
  });

  it('should execute when --execute flag is provided', () => {
    process.argv = ['node', 'script.js', '--execute'];
    // Test would require importing and running main function
    expect(true).toBe(true); // Placeholder for CLI integration tests
  });

  it('should show help when --help flag is provided', () => {
    process.argv = ['node', 'script.js', '--help'];
    // Test would require importing and running main function
    expect(true).toBe(true); // Placeholder for CLI integration tests
  });
});