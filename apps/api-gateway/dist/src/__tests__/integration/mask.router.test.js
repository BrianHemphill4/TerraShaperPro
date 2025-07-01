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
(0, vitest_1.describe)('Mask Router Integration Tests', () => {
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
    (0, vitest_1.describe)('mask.save', () => {
        const validGeoJSON = {
            type: 'Polygon',
            coordinates: [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                ],
            ],
        };
        const validMaskData = [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                category: 'vegetation',
                path: validGeoJSON,
                authorId: '550e8400-e29b-41d4-a716-446655440002',
            },
            {
                category: 'water',
                path: validGeoJSON,
            },
        ];
        (0, vitest_1.it)('should save masks successfully with valid GeoJSON', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            maskService.saveMasks.mockResolvedValue(undefined);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.mask.save({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
                masks: validMaskData,
            });
            (0, vitest_1.expect)(result).toEqual({
                success: true,
                message: 'Masks saved successfully',
            });
            (0, vitest_1.expect)(maskService.saveMasks).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', validMaskData, 'test-user-id');
        });
        (0, vitest_1.it)('should reject invalid scene UUID format', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.save({
                sceneId: 'invalid-uuid',
                masks: validMaskData,
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should reject invalid mask category length', async () => {
            const caller = appRouter.createCaller(mockContext);
            const invalidMaskData = [
                {
                    category: '', // Empty category
                    path: validGeoJSON,
                },
            ];
            await (0, vitest_1.expect)(caller.mask.save({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
                masks: invalidMaskData,
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should reject category longer than 50 characters', async () => {
            const caller = appRouter.createCaller(mockContext);
            const invalidMaskData = [
                {
                    category: 'a'.repeat(51), // Too long category
                    path: validGeoJSON,
                },
            ];
            await (0, vitest_1.expect)(caller.mask.save({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
                masks: invalidMaskData,
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should reject invalid mask ID UUID format', async () => {
            const caller = appRouter.createCaller(mockContext);
            const invalidMaskData = [
                {
                    id: 'invalid-uuid',
                    category: 'vegetation',
                    path: validGeoJSON,
                },
            ];
            await (0, vitest_1.expect)(caller.mask.save({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
                masks: invalidMaskData,
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle empty masks array', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            maskService.saveMasks.mockResolvedValue(undefined);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.mask.save({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
                masks: [],
            });
            (0, vitest_1.expect)(result).toEqual({
                success: true,
                message: 'Masks saved successfully',
            });
        });
        (0, vitest_1.it)('should handle service failures', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            maskService.saveMasks.mockRejectedValue(new Error('Database error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.save({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
                masks: validMaskData,
            })).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('mask.history', () => {
        (0, vitest_1.it)('should return mask history successfully', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            const mockHistory = [
                {
                    id: 'scene-123-2024-01-01',
                    masks: [
                        {
                            id: 'mask-1',
                            category: 'vegetation',
                            path: { type: 'Polygon', coordinates: [] },
                            deleted: false,
                            authorId: 'test-user-id',
                            createdAt: new Date('2024-01-01'),
                        },
                    ],
                    createdAt: new Date('2024-01-01'),
                    authorId: 'test-user-id',
                },
            ];
            maskService.getMaskHistory.mockResolvedValue(mockHistory);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.mask.history({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
            });
            (0, vitest_1.expect)(result).toEqual(mockHistory);
            (0, vitest_1.expect)(maskService.getMaskHistory).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
        });
        (0, vitest_1.it)('should reject invalid scene UUID format', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.history({
                sceneId: 'invalid-uuid',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle empty history gracefully', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            maskService.getMaskHistory.mockResolvedValue([]);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.mask.history({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
            });
            (0, vitest_1.expect)(result).toEqual([]);
        });
        (0, vitest_1.it)('should handle service failures', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            maskService.getMaskHistory.mockRejectedValue(new Error('Database error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.history({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
            })).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('mask.list', () => {
        (0, vitest_1.it)('should list masks for scene successfully', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            const mockMasks = [
                {
                    id: 'mask-1',
                    sceneId: '550e8400-e29b-41d4-a716-446655440000',
                    category: 'vegetation',
                    path: { type: 'Polygon', coordinates: [] },
                    deleted: false,
                    authorId: 'test-user-id',
                    createdAt: new Date(),
                },
                {
                    id: 'mask-2',
                    sceneId: '550e8400-e29b-41d4-a716-446655440000',
                    category: 'water',
                    path: { type: 'Polygon', coordinates: [] },
                    deleted: false,
                    authorId: 'test-user-id',
                    createdAt: new Date(),
                },
            ];
            maskService.getMasksByScene.mockResolvedValue(mockMasks);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.mask.list({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
            });
            (0, vitest_1.expect)(result).toEqual(mockMasks);
            (0, vitest_1.expect)(maskService.getMasksByScene).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
        });
        (0, vitest_1.it)('should reject invalid scene UUID', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.list({
                sceneId: 'invalid-uuid',
            })).rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('mask.export', () => {
        (0, vitest_1.it)('should export masks as GeoJSON successfully', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            const mockGeoJSON = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {
                            id: 'mask-1',
                            category: 'vegetation',
                            authorId: 'test-user-id',
                            createdAt: new Date(),
                        },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [0, 0],
                                    [1, 0],
                                    [1, 1],
                                    [0, 1],
                                    [0, 0],
                                ],
                            ],
                        },
                    },
                ],
            };
            maskService.exportMasksAsGeoJSON.mockResolvedValue(mockGeoJSON);
            const caller = appRouter.createCaller(mockContext);
            const result = await caller.mask.export({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
            });
            (0, vitest_1.expect)(result).toEqual(mockGeoJSON);
            (0, vitest_1.expect)(maskService.exportMasksAsGeoJSON).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
        });
        (0, vitest_1.it)('should reject invalid scene UUID', async () => {
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.export({
                sceneId: 'invalid-uuid',
            })).rejects.toThrow();
        });
        (0, vitest_1.it)('should handle export failures', async () => {
            const { maskService } = await vitest_1.vi.importMock('@terrashaper/shared');
            maskService.exportMasksAsGeoJSON.mockRejectedValue(new Error('Export error'));
            const caller = appRouter.createCaller(mockContext);
            await (0, vitest_1.expect)(caller.mask.export({
                sceneId: '550e8400-e29b-41d4-a716-446655440000',
            })).rejects.toThrow();
        });
    });
});
