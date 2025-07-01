"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const zod_1 = require("zod");
// Simple unit tests for plant router logic
(0, vitest_1.describe)('Plant Router Logic Tests', () => {
    (0, vitest_1.describe)('Input Validation', () => {
        (0, vitest_1.it)('should validate plant filters correctly', () => {
            const plantFiltersSchema = zod_1.z.object({
                search: zod_1.z.string().optional(),
                category: zod_1.z.string().optional(),
                sunRequirements: zod_1.z.array(zod_1.z.enum(['full_sun', 'partial_sun', 'shade'])).optional(),
                waterNeeds: zod_1.z.array(zod_1.z.enum(['low', 'moderate', 'high'])).optional(),
                usdaZones: zod_1.z.array(zod_1.z.string()).optional(),
                texasNative: zod_1.z.boolean().optional(),
                droughtTolerant: zod_1.z.boolean().optional(),
                tags: zod_1.z.array(zod_1.z.string()).optional(),
                favoritesOnly: zod_1.z.boolean().optional(),
            });
            // Valid input with all filters
            const validInput = {
                search: 'bluebonnet',
                category: 'wildflower',
                sunRequirements: ['full_sun'],
                waterNeeds: ['low'],
                usdaZones: ['8a', '8b'],
                texasNative: true,
                droughtTolerant: true,
                tags: ['native', 'drought_tolerant'],
                favoritesOnly: false,
            };
            (0, vitest_1.expect)(() => plantFiltersSchema.parse(validInput)).not.toThrow();
            // Empty input should be valid
            const emptyInput = {};
            (0, vitest_1.expect)(() => plantFiltersSchema.parse(emptyInput)).not.toThrow();
            // Invalid sun requirements
            (0, vitest_1.expect)(() => plantFiltersSchema.parse({ sunRequirements: ['invalid'] })).toThrow();
            // Invalid water needs
            (0, vitest_1.expect)(() => plantFiltersSchema.parse({ waterNeeds: ['very_high'] })).toThrow();
        });
        (0, vitest_1.it)('should validate plant list input correctly', () => {
            const listSchema = zod_1.z.object({
                limit: zod_1.z.number().min(1).max(100).default(20),
                offset: zod_1.z.number().min(0).default(0),
                sortBy: zod_1.z.enum(['name', 'scientific', 'category', 'water', 'sun']).default('name'),
                sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
            });
            // Valid input
            const validInput = {
                limit: 50,
                offset: 20,
                sortBy: 'scientific',
                sortOrder: 'desc',
            };
            (0, vitest_1.expect)(() => listSchema.parse(validInput)).not.toThrow();
            // Default values
            const defaultInput = {};
            const parsed = listSchema.parse(defaultInput);
            (0, vitest_1.expect)(parsed.limit).toBe(20);
            (0, vitest_1.expect)(parsed.offset).toBe(0);
            (0, vitest_1.expect)(parsed.sortBy).toBe('name');
            (0, vitest_1.expect)(parsed.sortOrder).toBe('asc');
            // Invalid values
            (0, vitest_1.expect)(() => listSchema.parse({ limit: 0 })).toThrow();
            (0, vitest_1.expect)(() => listSchema.parse({ limit: 101 })).toThrow();
            (0, vitest_1.expect)(() => listSchema.parse({ offset: -1 })).toThrow();
            (0, vitest_1.expect)(() => listSchema.parse({ sortBy: 'invalid' })).toThrow();
        });
        (0, vitest_1.it)('should validate UUID inputs for plant operations', () => {
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
    (0, vitest_1.describe)('Plant Data Processing', () => {
        (0, vitest_1.it)('should parse sun requirements correctly', () => {
            const parseSunRequirements = (sunPref) => {
                const lower = sunPref.toLowerCase();
                if (lower.includes('full sun'))
                    return 'full_sun';
                if (lower.includes('partial'))
                    return 'partial_sun';
                if (lower.includes('shade'))
                    return 'shade';
                return 'full_sun';
            };
            (0, vitest_1.expect)(parseSunRequirements('Full Sun')).toBe('full_sun');
            (0, vitest_1.expect)(parseSunRequirements('PARTIAL SUN')).toBe('partial_sun');
            (0, vitest_1.expect)(parseSunRequirements('Shade')).toBe('shade');
            (0, vitest_1.expect)(parseSunRequirements('Unknown')).toBe('full_sun'); // default
        });
        (0, vitest_1.it)('should parse water needs based on drought resistance', () => {
            const parseWaterNeeds = (droughtLevel) => {
                const level = parseInt(droughtLevel) || 3;
                if (level >= 4)
                    return 'low';
                if (level >= 2)
                    return 'moderate';
                return 'high';
            };
            (0, vitest_1.expect)(parseWaterNeeds('5')).toBe('low');
            (0, vitest_1.expect)(parseWaterNeeds('4')).toBe('low');
            (0, vitest_1.expect)(parseWaterNeeds('3')).toBe('moderate');
            (0, vitest_1.expect)(parseWaterNeeds('2')).toBe('moderate');
            (0, vitest_1.expect)(parseWaterNeeds('1')).toBe('high');
            (0, vitest_1.expect)(parseWaterNeeds('invalid')).toBe('moderate'); // default to 3
        });
        (0, vitest_1.it)('should generate appropriate tags for plants', () => {
            const generatePlantTags = (plantType, sunReq, waterNeeds, droughtTolerant) => {
                return [
                    plantType.toLowerCase(),
                    'texas',
                    sunReq,
                    waterNeeds + '_water',
                    droughtTolerant ? 'drought_tolerant' : 'water_dependent'
                ];
            };
            const tags = generatePlantTags('Tree', 'full_sun', 'low', true);
            (0, vitest_1.expect)(tags).toContain('tree');
            (0, vitest_1.expect)(tags).toContain('texas');
            (0, vitest_1.expect)(tags).toContain('full_sun');
            (0, vitest_1.expect)(tags).toContain('low_water');
            (0, vitest_1.expect)(tags).toContain('drought_tolerant');
            const tags2 = generatePlantTags('Shrub', 'partial_sun', 'high', false);
            (0, vitest_1.expect)(tags2).toContain('shrub');
            (0, vitest_1.expect)(tags2).toContain('partial_sun');
            (0, vitest_1.expect)(tags2).toContain('high_water');
            (0, vitest_1.expect)(tags2).toContain('water_dependent');
        });
        (0, vitest_1.it)('should extract dominant color from hex values', () => {
            const validateDominantColor = (color) => {
                const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                return hexRegex.test(color);
            };
            (0, vitest_1.expect)(validateDominantColor('#FF5733')).toBe(true);
            (0, vitest_1.expect)(validateDominantColor('#000000')).toBe(true);
            (0, vitest_1.expect)(validateDominantColor('#FFFFFF')).toBe(true);
            (0, vitest_1.expect)(validateDominantColor('#ff5733')).toBe(true);
            (0, vitest_1.expect)(validateDominantColor('FF5733')).toBe(false); // missing #
            (0, vitest_1.expect)(validateDominantColor('#FF573')).toBe(false); // too short
            (0, vitest_1.expect)(validateDominantColor('#FF5733G')).toBe(false); // invalid character
            (0, vitest_1.expect)(validateDominantColor('')).toBe(false);
        });
    });
    (0, vitest_1.describe)('Search and Filtering Logic', () => {
        (0, vitest_1.it)('should build search vector content correctly', () => {
            const buildSearchVector = (scientificName, commonNames, category, tags) => {
                return [
                    scientificName,
                    ...commonNames,
                    category,
                    ...tags
                ].join(' ').toLowerCase();
            };
            const searchVector = buildSearchVector('Lupinus texensis', ['Texas Bluebonnet', 'Bluebonnet'], 'Wildflower', ['native', 'spring_blooming']);
            (0, vitest_1.expect)(searchVector).toContain('lupinus texensis');
            (0, vitest_1.expect)(searchVector).toContain('texas bluebonnet');
            (0, vitest_1.expect)(searchVector).toContain('wildflower');
            (0, vitest_1.expect)(searchVector).toContain('native');
            (0, vitest_1.expect)(searchVector).toContain('spring_blooming');
        });
        (0, vitest_1.it)('should calculate plant statistics correctly', () => {
            const calculatePlantStats = (plants) => {
                const stats = {
                    totalPlants: plants.length,
                    texasNative: 0,
                    droughtTolerant: 0,
                    categories: new Map(),
                };
                plants.forEach(plant => {
                    if (plant.texas_native)
                        stats.texasNative++;
                    if (plant.drought_tolerant)
                        stats.droughtTolerant++;
                    const count = stats.categories.get(plant.category) || 0;
                    stats.categories.set(plant.category, count + 1);
                });
                return {
                    ...stats,
                    categoryCounts: Array.from(stats.categories.entries()).map(([name, count]) => ({ name, count })),
                };
            };
            const plants = [
                { category: 'Tree', texas_native: true, drought_tolerant: true },
                { category: 'Tree', texas_native: true, drought_tolerant: false },
                { category: 'Shrub', texas_native: false, drought_tolerant: true },
                { category: 'Wildflower', texas_native: true, drought_tolerant: true },
            ];
            const stats = calculatePlantStats(plants);
            (0, vitest_1.expect)(stats.totalPlants).toBe(4);
            (0, vitest_1.expect)(stats.texasNative).toBe(3);
            (0, vitest_1.expect)(stats.droughtTolerant).toBe(3);
            (0, vitest_1.expect)(stats.categoryCounts).toEqual([
                { name: 'Tree', count: 2 },
                { name: 'Shrub', count: 1 },
                { name: 'Wildflower', count: 1 },
            ]);
        });
        (0, vitest_1.it)('should map sort columns correctly', () => {
            const getSortColumn = (sortBy) => {
                const sortColumnMap = {
                    name: 'common_names',
                    scientific: 'scientific_name',
                    category: 'category',
                    water: 'water_needs',
                    sun: 'sun_requirements',
                };
                return sortColumnMap[sortBy] || 'common_names';
            };
            (0, vitest_1.expect)(getSortColumn('name')).toBe('common_names');
            (0, vitest_1.expect)(getSortColumn('scientific')).toBe('scientific_name');
            (0, vitest_1.expect)(getSortColumn('category')).toBe('category');
            (0, vitest_1.expect)(getSortColumn('water')).toBe('water_needs');
            (0, vitest_1.expect)(getSortColumn('sun')).toBe('sun_requirements');
            (0, vitest_1.expect)(getSortColumn('invalid')).toBe('common_names'); // default
        });
    });
    (0, vitest_1.describe)('Favorites System Logic', () => {
        (0, vitest_1.it)('should handle favorites toggle correctly', () => {
            const toggleFavorite = (isCurrentlyFavorite) => {
                return !isCurrentlyFavorite;
            };
            (0, vitest_1.expect)(toggleFavorite(true)).toBe(false);
            (0, vitest_1.expect)(toggleFavorite(false)).toBe(true);
        });
        (0, vitest_1.it)('should format favorites response correctly', () => {
            const formatFavoritesResponse = (favorites) => {
                return {
                    plants: favorites.map(f => f.plant).filter(Boolean),
                };
            };
            const mockFavorites = [
                { plant: { id: '1', name: 'Plant 1' } },
                { plant: { id: '2', name: 'Plant 2' } },
                { plant: null }, // Should be filtered out
            ];
            const response = formatFavoritesResponse(mockFavorites);
            (0, vitest_1.expect)(response.plants).toHaveLength(2);
            (0, vitest_1.expect)(response.plants[0].id).toBe('1');
            (0, vitest_1.expect)(response.plants[1].id).toBe('2');
        });
    });
    (0, vitest_1.describe)('Error Handling', () => {
        (0, vitest_1.it)('should create appropriate TRPC errors for plant operations', () => {
            const createError = (code, message) => ({
                code,
                message,
            });
            const notFoundError = createError('NOT_FOUND', 'Plant not found');
            (0, vitest_1.expect)(notFoundError.code).toBe('NOT_FOUND');
            (0, vitest_1.expect)(notFoundError.message).toBe('Plant not found');
            const internalError = createError('INTERNAL_SERVER_ERROR', 'Failed to fetch plants');
            (0, vitest_1.expect)(internalError.code).toBe('INTERNAL_SERVER_ERROR');
            const authError = createError('UNAUTHORIZED', 'Authentication required for favorites');
            (0, vitest_1.expect)(authError.code).toBe('UNAUTHORIZED');
        });
    });
    (0, vitest_1.describe)('Pagination Logic', () => {
        (0, vitest_1.it)('should calculate correct pagination values', () => {
            const calculatePagination = (offset, limit, total) => ({
                hasMore: total > offset + limit,
                currentPage: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit),
                start: offset,
                end: offset + limit - 1,
            });
            const pagination = calculatePagination(0, 20, 100);
            (0, vitest_1.expect)(pagination.hasMore).toBe(true);
            (0, vitest_1.expect)(pagination.currentPage).toBe(1);
            (0, vitest_1.expect)(pagination.totalPages).toBe(5);
            (0, vitest_1.expect)(pagination.start).toBe(0);
            (0, vitest_1.expect)(pagination.end).toBe(19);
            const lastPage = calculatePagination(80, 20, 100);
            (0, vitest_1.expect)(lastPage.hasMore).toBe(false);
            (0, vitest_1.expect)(lastPage.currentPage).toBe(5);
        });
    });
    (0, vitest_1.describe)('Data Transformation', () => {
        (0, vitest_1.it)('should transform plant data for response correctly', () => {
            const transformPlantData = (plant) => ({
                ...plant,
                isFavorite: plant.is_favorite || false,
                matureHeight: plant.mature_height_ft,
                matureWidth: plant.mature_width_ft,
                texasNative: plant.texas_native,
                droughtTolerant: plant.drought_tolerant,
            });
            const dbPlant = {
                id: '123',
                scientific_name: 'Lupinus texensis',
                common_names: ['Texas Bluebonnet'],
                mature_height_ft: 12,
                mature_width_ft: 8,
                texas_native: true,
                drought_tolerant: true,
                is_favorite: true,
            };
            const transformed = transformPlantData(dbPlant);
            (0, vitest_1.expect)(transformed.isFavorite).toBe(true);
            (0, vitest_1.expect)(transformed.matureHeight).toBe(12);
            (0, vitest_1.expect)(transformed.matureWidth).toBe(8);
            (0, vitest_1.expect)(transformed.texasNative).toBe(true);
            (0, vitest_1.expect)(transformed.droughtTolerant).toBe(true);
        });
    });
});
