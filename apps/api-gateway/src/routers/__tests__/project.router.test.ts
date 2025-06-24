import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { projectRouter } from '../project.router';
import type { Context } from '../../context';

// Create mock context
const createMockContext = (): Context => ({
  session: {
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    organizationId: 'test-org-id',
  },
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn(),
  } as any,
  requestId: 'test-request-id',
});

// Create a test caller
const createCaller = (ctx: Context) => projectRouter.createCaller(ctx);

describe('projectRouter', () => {
  let ctx: Context;
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    ctx = createMockContext();
    caller = createCaller(ctx);
  });

  describe('list', () => {
    it('should return projects with default parameters', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', status: 'active' },
        { id: '2', name: 'Project 2', status: 'completed' },
      ];

      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.range as any).mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const result = await caller.list({});

      expect(ctx.supabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19);
      expect(result).toEqual({
        projects: mockProjects,
        totalCount: mockProjects.length,
      });
    });

    it('should filter projects by search term', async () => {
      const mockProjects = [
        { id: '1', name: 'Garden Design', status: 'active' },
      ];

      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.range as any).mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const result = await caller.list({ search: 'garden' });

      expect(mockQuery.textSearch).toHaveBeenCalledWith('search_vector', 'garden');
      expect(result.projects).toEqual(mockProjects);
    });

    it('should filter projects by status', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', status: 'active' },
      ];

      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.range as any).mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const result = await caller.list({ filterStatus: 'active' });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
      expect(result.projects).toEqual(mockProjects);
    });

    it('should handle database errors', async () => {
      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.range as any).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(caller.list({})).rejects.toThrow(TRPCError);
    });
  });

  describe('get', () => {
    it('should return a single project', async () => {
      const mockProject = {
        id: 'test-id',
        name: 'Test Project',
        status: 'active',
      };

      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.single as any).mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await caller.get({ id: 'test-id' });

      expect(mockQuery.select).toHaveBeenCalledWith('*, users(id, name, email)');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(result).toEqual(mockProject);
    });

    it('should throw NOT_FOUND when project does not exist', async () => {
      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.single as any).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(caller.get({ id: 'non-existent' })).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const newProject = {
        id: 'new-id',
        name: 'New Project',
        description: 'Test description',
        canvas_data: { elements: [] },
      };

      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.single as any).mockResolvedValue({
        data: newProject,
        error: null,
      });

      // Mock usage limit check
      (ctx.supabase.rpc as any).mockResolvedValue({
        data: { count: 5 },
        error: null,
      });

      const result = await caller.create({
        name: 'New Project',
        description: 'Test description',
        canvas_data: { elements: [] },
      });

      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result).toEqual(newProject);
    });

    it('should check project limits before creation', async () => {
      // Mock exceeding project limit
      (ctx.supabase.rpc as any).mockResolvedValue({
        data: { count: 100 },
        error: null,
      });

      await expect(
        caller.create({
          name: 'New Project',
          description: 'Test description',
          canvas_data: { elements: [] },
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
        })
      );
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const updatedProject = {
        id: 'test-id',
        name: 'Updated Project',
        status: 'completed',
      };

      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.single as any).mockResolvedValue({
        data: updatedProject,
        error: null,
      });

      const result = await caller.update({
        id: 'test-id',
        name: 'Updated Project',
        status: 'completed',
      });

      expect(mockQuery.update).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(result).toEqual(updatedProject);
    });

    it('should throw error when update fails', async () => {
      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.single as any).mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        caller.update({
          id: 'test-id',
          name: 'Updated Project',
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.eq as any).mockResolvedValue({
        data: null,
        error: null,
      });

      await caller.delete({ id: 'test-id' });

      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id');
    });

    it('should throw error when delete fails', async () => {
      const mockQuery = ctx.supabase.from('projects');
      (mockQuery.eq as any).mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      await expect(caller.delete({ id: 'test-id' })).rejects.toThrow(TRPCError);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a project', async () => {
      const originalProject = {
        id: 'original-id',
        name: 'Original Project',
        canvas_data: { elements: [] },
      };

      const duplicatedProject = {
        id: 'duplicate-id',
        name: 'Original Project (Copy)',
        canvas_data: { elements: [] },
      };

      const mockQuery = ctx.supabase.from('projects');
      
      // First call - get original
      (mockQuery.single as any).mockResolvedValueOnce({
        data: originalProject,
        error: null,
      });

      // Second call - create duplicate
      (mockQuery.single as any).mockResolvedValueOnce({
        data: duplicatedProject,
        error: null,
      });

      const result = await caller.duplicate({ id: 'original-id' });

      expect(result).toEqual(duplicatedProject);
      expect(result.name).toBe('Original Project (Copy)');
    });
  });

  describe('stats', () => {
    it('should return project statistics', async () => {
      const mockStats = {
        totalProjects: 10,
        activeProjects: 5,
        completedProjects: 3,
        archivedProjects: 2,
      };

      (ctx.supabase.rpc as any).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await caller.stats();

      expect(ctx.supabase.rpc).toHaveBeenCalledWith('get_project_stats', {
        org_id: 'test-org-id',
      });
      expect(result).toEqual(mockStats);
    });
  });
});