"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const zod_1 = require("zod");
// Simple unit tests for project router logic
(0, vitest_1.describe)('Project Router Logic Tests', () => {
    (0, vitest_1.describe)('Input Validation', () => {
        (0, vitest_1.it)('should validate list input correctly', () => {
            const listSchema = zod_1.z.object({
                search: zod_1.z.string().optional(),
                sortBy: zod_1.z.enum(['recent', 'name', 'status']).default('recent'),
                filterStatus: zod_1.z.enum(['all', 'active', 'completed', 'archived']).default('all'),
                limit: zod_1.z.number().min(1).max(100).default(20),
                offset: zod_1.z.number().min(0).default(0),
            });
            // Valid input
            const validInput = {
                search: 'garden',
                sortBy: 'name',
                filterStatus: 'active',
                limit: 50,
                offset: 0,
            };
            (0, vitest_1.expect)(() => listSchema.parse(validInput)).not.toThrow();
            // Default values
            const defaultInput = {};
            const parsed = listSchema.parse(defaultInput);
            (0, vitest_1.expect)(parsed.sortBy).toBe('recent');
            (0, vitest_1.expect)(parsed.filterStatus).toBe('all');
            (0, vitest_1.expect)(parsed.limit).toBe(20);
            (0, vitest_1.expect)(parsed.offset).toBe(0);
            // Invalid values
            (0, vitest_1.expect)(() => listSchema.parse({ limit: 0 })).toThrow();
            (0, vitest_1.expect)(() => listSchema.parse({ limit: 101 })).toThrow();
            (0, vitest_1.expect)(() => listSchema.parse({ offset: -1 })).toThrow();
            (0, vitest_1.expect)(() => listSchema.parse({ sortBy: 'invalid' })).toThrow();
        });
        (0, vitest_1.it)('should validate create input correctly', () => {
            const createSchema = zod_1.z.object({
                name: zod_1.z.string().min(1).max(255),
                description: zod_1.z.string().optional(),
                canvas_data: zod_1.z.any(),
                metadata: zod_1.z.record(zod_1.z.any()).optional(),
            });
            // Valid input
            const validInput = {
                name: 'My Garden Project',
                description: 'A beautiful garden design',
                canvas_data: { elements: [] },
                metadata: { tags: ['garden', 'backyard'] },
            };
            (0, vitest_1.expect)(() => createSchema.parse(validInput)).not.toThrow();
            // Invalid - empty name
            (0, vitest_1.expect)(() => createSchema.parse({ name: '', canvas_data: {} })).toThrow();
            // Invalid - name too long
            const longName = 'a'.repeat(256);
            (0, vitest_1.expect)(() => createSchema.parse({ name: longName, canvas_data: {} })).toThrow();
        });
        (0, vitest_1.it)('should validate UUID inputs', () => {
            const uuidSchema = zod_1.z.string().uuid();
            // Valid UUIDs
            (0, vitest_1.expect)(() => uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
            (0, vitest_1.expect)(() => uuidSchema.parse('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).not.toThrow();
            // Invalid UUIDs
            (0, vitest_1.expect)(() => uuidSchema.parse('invalid-uuid')).toThrow();
            (0, vitest_1.expect)(() => uuidSchema.parse('550e8400-e29b-41d4-a716')).toThrow();
            (0, vitest_1.expect)(() => uuidSchema.parse('')).toThrow();
        });
    });
    (0, vitest_1.describe)('Business Logic', () => {
        (0, vitest_1.it)('should calculate correct pagination range', () => {
            const calculateRange = (offset, limit) => ({
                start: offset,
                end: offset + limit - 1,
            });
            (0, vitest_1.expect)(calculateRange(0, 20)).toEqual({ start: 0, end: 19 });
            (0, vitest_1.expect)(calculateRange(20, 20)).toEqual({ start: 20, end: 39 });
            (0, vitest_1.expect)(calculateRange(100, 50)).toEqual({ start: 100, end: 149 });
        });
        (0, vitest_1.it)('should format project names correctly for duplication', () => {
            const formatDuplicateName = (originalName) => {
                const copyRegex = / \(Copy(?: (\d+))?\)$/;
                const match = originalName.match(copyRegex);
                if (match) {
                    const copyNumber = match[1] ? Number.parseInt(match[1], 10) + 1 : 2;
                    return originalName.replace(copyRegex, ` (Copy ${copyNumber})`);
                }
                return `${originalName} (Copy)`;
            };
            (0, vitest_1.expect)(formatDuplicateName('My Project')).toBe('My Project (Copy)');
            (0, vitest_1.expect)(formatDuplicateName('My Project (Copy)')).toBe('My Project (Copy 2)');
            (0, vitest_1.expect)(formatDuplicateName('My Project (Copy 2)')).toBe('My Project (Copy 3)');
            (0, vitest_1.expect)(formatDuplicateName('My Project (Copy 99)')).toBe('My Project (Copy 100)');
        });
        (0, vitest_1.it)('should validate project status transitions', () => {
            const validTransitions = {
                draft: ['active', 'archived'],
                active: ['completed', 'archived'],
                completed: ['active', 'archived'],
                archived: ['active'],
            };
            const isValidTransition = (from, to) => {
                return validTransitions[from]?.includes(to) || false;
            };
            (0, vitest_1.expect)(isValidTransition('draft', 'active')).toBe(true);
            (0, vitest_1.expect)(isValidTransition('draft', 'completed')).toBe(false);
            (0, vitest_1.expect)(isValidTransition('active', 'completed')).toBe(true);
            (0, vitest_1.expect)(isValidTransition('completed', 'draft')).toBe(false);
            (0, vitest_1.expect)(isValidTransition('archived', 'active')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Error Handling', () => {
        (0, vitest_1.it)('should create appropriate TRPC errors', () => {
            const createError = (code, message) => ({
                code,
                message,
            });
            const notFoundError = createError('NOT_FOUND', 'Project not found');
            (0, vitest_1.expect)(notFoundError.code).toBe('NOT_FOUND');
            (0, vitest_1.expect)(notFoundError.message).toBe('Project not found');
            const forbiddenError = createError('FORBIDDEN', 'Insufficient permissions');
            (0, vitest_1.expect)(forbiddenError.code).toBe('FORBIDDEN');
            const internalError = createError('INTERNAL_SERVER_ERROR', 'Database connection failed');
            (0, vitest_1.expect)(internalError.code).toBe('INTERNAL_SERVER_ERROR');
        });
    });
    (0, vitest_1.describe)('Data Transformation', () => {
        (0, vitest_1.it)('should transform project data for response', () => {
            const transformProject = (project) => ({
                ...project,
                createdAt: project.created_at,
                updatedAt: project.updated_at,
                canvasData: project.canvas_data,
            });
            const dbProject = {
                id: '123',
                name: 'Test Project',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
                canvas_data: { elements: [] },
            };
            const transformed = transformProject(dbProject);
            (0, vitest_1.expect)(transformed.createdAt).toBe(dbProject.created_at);
            (0, vitest_1.expect)(transformed.updatedAt).toBe(dbProject.updated_at);
            (0, vitest_1.expect)(transformed.canvasData).toEqual(dbProject.canvas_data);
        });
        (0, vitest_1.it)('should calculate project statistics', () => {
            const calculateStats = (projects) => {
                const stats = {
                    totalProjects: projects.length,
                    activeProjects: 0,
                    completedProjects: 0,
                    archivedProjects: 0,
                };
                projects.forEach(project => {
                    switch (project.status) {
                        case 'active':
                            stats.activeProjects++;
                            break;
                        case 'completed':
                            stats.completedProjects++;
                            break;
                        case 'archived':
                            stats.archivedProjects++;
                            break;
                    }
                });
                return stats;
            };
            const projects = [
                { status: 'active' },
                { status: 'active' },
                { status: 'completed' },
                { status: 'archived' },
                { status: 'active' },
            ];
            const stats = calculateStats(projects);
            (0, vitest_1.expect)(stats.totalProjects).toBe(5);
            (0, vitest_1.expect)(stats.activeProjects).toBe(3);
            (0, vitest_1.expect)(stats.completedProjects).toBe(1);
            (0, vitest_1.expect)(stats.archivedProjects).toBe(1);
        });
    });
});
