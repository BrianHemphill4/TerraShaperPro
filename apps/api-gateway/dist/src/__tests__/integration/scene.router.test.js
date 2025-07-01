"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Import the router after setup mocks are in place
const { appRouter } = await Promise.resolve().then(() => __importStar(require('../../router')));
(0, vitest_1.describe)('Scene Router Integration Tests', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // Mock context following existing test patterns
    const mockContext = {
        supabase: {
            from: vitest_1.vi.fn(() => ({
                select: vitest_1.vi.fn().mockReturnThis(),
                insert: vitest_1.vi.fn().mockReturnThis(),
                update: vitest_1.vi.fn().mockReturnThis(),
                eq: vitest_1.vi.fn().mockReturnThis(),
                single: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
        },
        user: {
            id: 'test-user-id',
            organizationId: 'test-org-id'
        },
    };
    (0, vitest_1.describe)('scene.upload', () => {
        (0, vitest_1.it)('should upload scene successfully with valid input', async () => {
            // Get mocked services
            const { sceneService } = await vitest_1.vi.importMock('@terrashaper/shared');
            const { storageService } = await vitest_1.vi.importMock('@terrashaper/storage');
            // Mock storage quota check
            storageService.getUsage.mockResolvedValue({
                used: 100,
                total: 1000,
                remaining: 900,
            });
            // Mock scene creation
            const mockScene = {
                id: 'scene-123',
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                imageUrl: 'https://example.com/image.jpg',
                order: 1,
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            sceneService.createScene.mockResolvedValue(mockScene);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.scene.upload({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                imageUrl: 'https://example.com/image.jpg',
                order: 1,
            });
            (0, vitest_1.expect)(result).toEqual({
                success: true,
                scene: mockScene,
            });
            (0, vitest_1.expect)(sceneService.createScene).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 'https://example.com/image.jpg', 1);
        });
        (0, vitest_1.it)('should reject invalid image URLs', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.upload({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                imageUrl: 'invalid-url',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should reject invalid project UUID format', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.upload({
                projectId: 'invalid-uuid',
                imageUrl: 'https://example.com/image.jpg',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle scene creation failures', async () => {
            const { sceneService } = await vitest_1.vi.importMock('@terrashaper/shared');
            const { storageService } = await vitest_1.vi.importMock('@terrashaper/storage');
            storageService.getUsage.mockResolvedValue({
                used: 100,
                total: 1000,
                remaining: 900,
            });
            sceneService.createScene.mockRejectedValue(new Error('Database error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.upload({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                imageUrl: 'https://example.com/image.jpg',
            })).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('scene.reorder', () => {
        (0, vitest_1.it)('should reorder scenes successfully', async () => {
            const { sceneService } = await vitest_1.vi.importMock('@terrashaper/shared');
            sceneService.reorderScenes.mockResolvedValue(undefined);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.scene.reorder({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                sceneIds: [
                    '550e8400-e29b-41d4-a716-446655440001',
                    '550e8400-e29b-41d4-a716-446655440002',
                ],
            });
            (0, vitest_1.expect)(result).toEqual({
                success: true,
            });
            (0, vitest_1.expect)(sceneService.reorderScenes).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
            ]);
        });
        (0, vitest_1.it)('should reject invalid project UUID format', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.reorder({
                projectId: 'invalid-uuid',
                sceneIds: ['550e8400-e29b-41d4-a716-446655440001'],
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should reject invalid scene UUIDs in array', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.reorder({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                sceneIds: ['invalid-uuid', '550e8400-e29b-41d4-a716-446655440001'],
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle reorder service failures', async () => {
            const { sceneService } = await vitest_1.vi.importMock('@terrashaper/shared');
            sceneService.reorderScenes.mockRejectedValue(new Error('Database error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.reorder({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
                sceneIds: ['550e8400-e29b-41d4-a716-446655440001'],
            })).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('scene.list', () => {
        (0, vitest_1.it)('should list scenes for project successfully', async () => {
            const { sceneService } = await vitest_1.vi.importMock('@terrashaper/shared');
            const mockScenes = [
                {
                    id: 'scene-1',
                    projectId: '550e8400-e29b-41d4-a716-446655440000',
                    imageUrl: 'https://example.com/image1.jpg',
                    order: 1,
                    isDefault: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'scene-2',
                    projectId: '550e8400-e29b-41d4-a716-446655440000',
                    imageUrl: 'https://example.com/image2.jpg',
                    order: 2,
                    isDefault: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            sceneService.getScenesByProject.mockResolvedValue(mockScenes);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.scene.list({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
            });
            (0, vitest_1.expect)(result).toEqual(mockScenes);
            (0, vitest_1.expect)(sceneService.getScenesByProject).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
        });
        (0, vitest_1.it)('should reject invalid project UUID', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.list({
                projectId: 'invalid-uuid',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle service failures gracefully', async () => {
            const { sceneService } = await vitest_1.vi.importMock('@terrashaper/shared');
            sceneService.getScenesByProject.mockRejectedValue(new Error('Database error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.scene.list({
                projectId: '550e8400-e29b-41d4-a716-446655440000',
            })).rejects.toThrow();
        });
    });
});
