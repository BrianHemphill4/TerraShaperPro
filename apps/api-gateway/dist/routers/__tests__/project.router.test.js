"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const server_1 = require("@trpc/server");
const project_router_1 = require("../project.router");
// Create mock context
const createMockContext = () => ({
    session: {
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        organizationId: 'test-org-id',
    },
    supabase: {
        from: vitest_1.vi.fn((table) => ({
            select: vitest_1.vi.fn().mockReturnThis(),
            insert: vitest_1.vi.fn().mockReturnThis(),
            update: vitest_1.vi.fn().mockReturnThis(),
            delete: vitest_1.vi.fn().mockReturnThis(),
            eq: vitest_1.vi.fn().mockReturnThis(),
            neq: vitest_1.vi.fn().mockReturnThis(),
            in: vitest_1.vi.fn().mockReturnThis(),
            textSearch: vitest_1.vi.fn().mockReturnThis(),
            order: vitest_1.vi.fn().mockReturnThis(),
            range: vitest_1.vi.fn().mockReturnThis(),
            single: vitest_1.vi.fn().mockReturnThis(),
            limit: vitest_1.vi.fn().mockReturnThis(),
        })),
        rpc: vitest_1.vi.fn(),
    },
    requestId: 'test-request-id',
});
// Create a test caller
const createCaller = (ctx) => project_router_1.projectRouter.createCaller(ctx);
(0, vitest_1.describe)('projectRouter', () => {
    let ctx;
    let caller;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        ctx = createMockContext();
        caller = createCaller(ctx);
    });
    (0, vitest_1.describe)('list', () => {
        (0, vitest_1.it)('should return projects with default parameters', async () => {
            const mockProjects = [
                { id: '1', name: 'Project 1', status: 'active' },
                { id: '2', name: 'Project 2', status: 'completed' },
            ];
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.range.mockResolvedValue({
                data: mockProjects,
                error: null,
            });
            const result = await caller.list({});
            (0, vitest_1.expect)(ctx.supabase.from).toHaveBeenCalledWith('projects');
            (0, vitest_1.expect)(mockQuery.select).toHaveBeenCalledWith('*');
            (0, vitest_1.expect)(mockQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false });
            (0, vitest_1.expect)(mockQuery.range).toHaveBeenCalledWith(0, 19);
            (0, vitest_1.expect)(result).toEqual({
                projects: mockProjects,
                totalCount: mockProjects.length,
            });
        });
        (0, vitest_1.it)('should filter projects by search term', async () => {
            const mockProjects = [
                { id: '1', name: 'Garden Design', status: 'active' },
            ];
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.range.mockResolvedValue({
                data: mockProjects,
                error: null,
            });
            const result = await caller.list({ search: 'garden' });
            (0, vitest_1.expect)(mockQuery.textSearch).toHaveBeenCalledWith('search_vector', 'garden');
            (0, vitest_1.expect)(result.projects).toEqual(mockProjects);
        });
        (0, vitest_1.it)('should filter projects by status', async () => {
            const mockProjects = [
                { id: '1', name: 'Project 1', status: 'active' },
            ];
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.range.mockResolvedValue({
                data: mockProjects,
                error: null,
            });
            const result = await caller.list({ filterStatus: 'active' });
            (0, vitest_1.expect)(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
            (0, vitest_1.expect)(result.projects).toEqual(mockProjects);
        });
        (0, vitest_1.it)('should handle database errors', async () => {
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.range.mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
            });
            await (0, vitest_1.expect)(caller.list({})).rejects.toThrow(server_1.TRPCError);
        });
    });
    (0, vitest_1.describe)('get', () => {
        (0, vitest_1.it)('should return a single project', async () => {
            const mockProject = {
                id: 'test-id',
                name: 'Test Project',
                status: 'active',
            };
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.single.mockResolvedValue({
                data: mockProject,
                error: null,
            });
            const result = await caller.get({ id: 'test-id' });
            (0, vitest_1.expect)(mockQuery.select).toHaveBeenCalledWith('*, users(id, name, email)');
            (0, vitest_1.expect)(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id');
            (0, vitest_1.expect)(result).toEqual(mockProject);
        });
        (0, vitest_1.it)('should throw NOT_FOUND when project does not exist', async () => {
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
            });
            await (0, vitest_1.expect)(caller.get({ id: 'non-existent' })).rejects.toThrow(vitest_1.expect.objectContaining({
                code: 'NOT_FOUND',
            }));
        });
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create a new project', async () => {
            const newProject = {
                id: 'new-id',
                name: 'New Project',
                description: 'Test description',
                canvas_data: { elements: [] },
            };
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.single.mockResolvedValue({
                data: newProject,
                error: null,
            });
            // Mock usage limit check
            ctx.supabase.rpc.mockResolvedValue({
                data: { count: 5 },
                error: null,
            });
            const result = await caller.create({
                name: 'New Project',
                description: 'Test description',
                canvas_data: { elements: [] },
            });
            (0, vitest_1.expect)(mockQuery.insert).toHaveBeenCalled();
            (0, vitest_1.expect)(result).toEqual(newProject);
        });
        (0, vitest_1.it)('should check project limits before creation', async () => {
            // Mock exceeding project limit
            ctx.supabase.rpc.mockResolvedValue({
                data: { count: 100 },
                error: null,
            });
            await (0, vitest_1.expect)(caller.create({
                name: 'New Project',
                description: 'Test description',
                canvas_data: { elements: [] },
            })).rejects.toThrow(vitest_1.expect.objectContaining({
                code: 'FORBIDDEN',
            }));
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should update an existing project', async () => {
            const updatedProject = {
                id: 'test-id',
                name: 'Updated Project',
                status: 'completed',
            };
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.single.mockResolvedValue({
                data: updatedProject,
                error: null,
            });
            const result = await caller.update({
                id: 'test-id',
                name: 'Updated Project',
                status: 'completed',
            });
            (0, vitest_1.expect)(mockQuery.update).toHaveBeenCalled();
            (0, vitest_1.expect)(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id');
            (0, vitest_1.expect)(result).toEqual(updatedProject);
        });
        (0, vitest_1.it)('should throw error when update fails', async () => {
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.single.mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
            });
            await (0, vitest_1.expect)(caller.update({
                id: 'test-id',
                name: 'Updated Project',
            })).rejects.toThrow(server_1.TRPCError);
        });
    });
    (0, vitest_1.describe)('delete', () => {
        (0, vitest_1.it)('should delete a project', async () => {
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.eq.mockResolvedValue({
                data: null,
                error: null,
            });
            await caller.delete({ id: 'test-id' });
            (0, vitest_1.expect)(mockQuery.delete).toHaveBeenCalled();
            (0, vitest_1.expect)(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id');
        });
        (0, vitest_1.it)('should throw error when delete fails', async () => {
            const mockQuery = ctx.supabase.from('projects');
            mockQuery.eq.mockResolvedValue({
                data: null,
                error: { message: 'Delete failed' },
            });
            await (0, vitest_1.expect)(caller.delete({ id: 'test-id' })).rejects.toThrow(server_1.TRPCError);
        });
    });
    (0, vitest_1.describe)('duplicate', () => {
        (0, vitest_1.it)('should duplicate a project', async () => {
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
            mockQuery.single.mockResolvedValueOnce({
                data: originalProject,
                error: null,
            });
            // Second call - create duplicate
            mockQuery.single.mockResolvedValueOnce({
                data: duplicatedProject,
                error: null,
            });
            const result = await caller.duplicate({ id: 'original-id' });
            (0, vitest_1.expect)(result).toEqual(duplicatedProject);
            (0, vitest_1.expect)(result.name).toBe('Original Project (Copy)');
        });
    });
    (0, vitest_1.describe)('stats', () => {
        (0, vitest_1.it)('should return project statistics', async () => {
            const mockStats = {
                totalProjects: 10,
                activeProjects: 5,
                completedProjects: 3,
                archivedProjects: 2,
            };
            ctx.supabase.rpc.mockResolvedValue({
                data: mockStats,
                error: null,
            });
            const result = await caller.stats();
            (0, vitest_1.expect)(ctx.supabase.rpc).toHaveBeenCalledWith('get_project_stats', {
                org_id: 'test-org-id',
            });
            (0, vitest_1.expect)(result).toEqual(mockStats);
        });
    });
});
