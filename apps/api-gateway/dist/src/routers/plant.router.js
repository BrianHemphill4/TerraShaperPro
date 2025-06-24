"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plantRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
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
exports.plantRouter = (0, trpc_1.router)({
    list: trpc_1.publicProcedure
        .input(zod_1.z.object({
        filters: plantFiltersSchema.optional(),
        limit: zod_1.z.number().min(1).max(100).default(20),
        offset: zod_1.z.number().min(0).default(0),
        sortBy: zod_1.z.enum(['name', 'scientific', 'category', 'water', 'sun']).default('name'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
    }))
        .query(async ({ ctx, input }) => {
        let query = ctx.supabase.from('plants').select('*');
        // Apply filters
        if (input.filters) {
            const { filters } = input;
            // Text search
            if (filters.search) {
                query = query.textSearch('search_vector', filters.search);
            }
            // Category filter
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            // Sun requirements
            if (filters.sunRequirements && filters.sunRequirements.length > 0) {
                query = query.in('sun_requirements', filters.sunRequirements);
            }
            // Water needs
            if (filters.waterNeeds && filters.waterNeeds.length > 0) {
                query = query.in('water_needs', filters.waterNeeds);
            }
            // USDA zones
            if (filters.usdaZones && filters.usdaZones.length > 0) {
                query = query.contains('usda_zones', filters.usdaZones);
            }
            // Texas native
            if (filters.texasNative !== undefined) {
                query = query.eq('texas_native', filters.texasNative);
            }
            // Drought tolerant
            if (filters.droughtTolerant !== undefined) {
                query = query.eq('drought_tolerant', filters.droughtTolerant);
            }
            // Tags
            if (filters.tags && filters.tags.length > 0) {
                query = query.contains('tags', filters.tags);
            }
            // Favorites only (requires auth)
            if (filters.favoritesOnly && ctx.session) {
                const { data: favorites } = await ctx.supabase
                    .from('plant_favorites')
                    .select('plant_id')
                    .eq('user_id', ctx.session.userId);
                if (favorites && favorites.length > 0) {
                    const plantIds = favorites.map((f) => f.plant_id);
                    query = query.in('id', plantIds);
                }
                else {
                    // No favorites, return empty result
                    return { plants: [], total: 0, hasMore: false };
                }
            }
        }
        // Apply sorting
        const sortColumn = {
            name: 'common_names',
            scientific: 'scientific_name',
            category: 'category',
            water: 'water_needs',
            sun: 'sun_requirements',
        }[input.sortBy];
        query = query.order(sortColumn, { ascending: input.sortOrder === 'asc' });
        // Apply pagination
        query = query.range(input.offset, input.offset + input.limit - 1);
        const { data: plants, error } = await query;
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch plants',
            });
        }
        // Get total count with same filters but without pagination
        let countQuery = ctx.supabase.from('plants').select('*', { count: 'exact', head: true });
        // Apply same filters for count query
        if (input.filters) {
            const { filters } = input;
            if (filters.search) {
                countQuery = countQuery.textSearch('search_vector', filters.search);
            }
            if (filters.category) {
                countQuery = countQuery.eq('category', filters.category);
            }
            if (filters.sunRequirements && filters.sunRequirements.length > 0) {
                countQuery = countQuery.in('sun_requirements', filters.sunRequirements);
            }
            if (filters.waterNeeds && filters.waterNeeds.length > 0) {
                countQuery = countQuery.in('water_needs', filters.waterNeeds);
            }
            if (filters.usdaZones && filters.usdaZones.length > 0) {
                countQuery = countQuery.contains('usda_zones', filters.usdaZones);
            }
            if (filters.texasNative !== undefined) {
                countQuery = countQuery.eq('texas_native', filters.texasNative);
            }
            if (filters.droughtTolerant !== undefined) {
                countQuery = countQuery.eq('drought_tolerant', filters.droughtTolerant);
            }
            if (filters.tags && filters.tags.length > 0) {
                countQuery = countQuery.contains('tags', filters.tags);
            }
        }
        const { count } = await countQuery;
        return {
            plants: plants || [],
            total: count || 0,
            hasMore: (count || 0) > input.offset + input.limit,
        };
    }),
    get: trpc_1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }))
        .query(async ({ ctx, input }) => {
        const { data: plant, error } = await ctx.supabase
            .from('plants')
            .select('*')
            .eq('id', input.id)
            .single();
        if (error || !plant) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Plant not found',
            });
        }
        // Get favorite status if user is authenticated
        let isFavorite = false;
        if (ctx.session) {
            const { data: favorite } = await ctx.supabase
                .from('plant_favorites')
                .select('id')
                .eq('user_id', ctx.session.userId)
                .eq('plant_id', input.id)
                .single();
            isFavorite = !!favorite;
        }
        return {
            ...plant,
            isFavorite,
        };
    }),
    categories: trpc_1.publicProcedure.query(async ({ ctx }) => {
        const { data: categories, error } = await ctx.supabase
            .from('plants')
            .select('category')
            .not('category', 'is', 'null')
            .order('category');
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch categories',
            });
        }
        // Get unique categories with counts
        const categoryMap = new Map();
        (categories || []).forEach((row) => {
            const count = categoryMap.get(row.category) || 0;
            categoryMap.set(row.category, count + 1);
        });
        return Array.from(categoryMap.entries()).map(([name, count]) => ({
            name,
            count,
        }));
    }),
    toggleFavorite: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        plantId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        // Check if already favorited
        const { data: existing } = await ctx.supabase
            .from('plant_favorites')
            .select('id')
            .eq('user_id', ctx.session.userId)
            .eq('plant_id', input.plantId)
            .single();
        if (existing) {
            // Remove favorite
            const { error } = await ctx.supabase.from('plant_favorites').delete().eq('id', existing.id);
            if (error) {
                throw new server_1.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to remove favorite',
                });
            }
            return { isFavorite: false };
        }
        else {
            // Add favorite
            const { error } = await ctx.supabase.from('plant_favorites').insert({
                user_id: ctx.session.userId,
                plant_id: input.plantId,
            });
            if (error) {
                throw new server_1.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add favorite',
                });
            }
            return { isFavorite: true };
        }
    }),
    favorites: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const { data: favorites, error } = await ctx.supabase
            .from('plant_favorites')
            .select(`
        plant:plants(*)
      `)
            .eq('user_id', ctx.session.userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch favorites',
            });
        }
        return {
            plants: (favorites || []).map((f) => f.plant).filter(Boolean),
        };
    }),
});
