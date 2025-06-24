"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
exports.creditRouter = (0, trpc_1.router)({
    balance: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const { data: org, error } = await ctx.supabase
            .from('organizations')
            .select('render_credits')
            .eq('id', ctx.session.organizationId)
            .single();
        if (error || !org) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch credit balance',
            });
        }
        return {
            balance: org.render_credits,
        };
    }),
    transactions: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(20),
        offset: zod_1.z.number().min(0).default(0),
    }))
        .query(async ({ ctx, input }) => {
        const { data: transactions, error } = await ctx.supabase
            .from('credit_transactions')
            .select('*')
            .eq('organization_id', ctx.session.organizationId)
            .order('created_at', { ascending: false })
            .range(input.offset, input.offset + input.limit - 1);
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch transactions',
            });
        }
        // Get total count separately
        const { count } = await ctx.supabase
            .from('credit_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', ctx.session.organizationId);
        return {
            transactions: transactions || [],
            total: count || 0,
            hasMore: (count || 0) > input.offset + input.limit,
        };
    }),
    usage: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        period: zod_1.z.enum(['day', 'week', 'month', 'year']).default('month'),
    }))
        .query(async ({ ctx, input }) => {
        const now = new Date();
        const startDate = new Date();
        switch (input.period) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        // Get render usage
        const { data: usage, error } = await ctx.supabase
            .from('credit_transactions')
            .select('amount, created_at')
            .eq('organization_id', ctx.session.organizationId)
            .eq('type', 'render')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch usage data',
            });
        }
        // Aggregate usage by day
        const usageByDay = new Map();
        (usage || []).forEach((transaction) => {
            const date = new Date(transaction.created_at).toISOString().split('T')[0];
            if (date) {
                const current = usageByDay.get(date) || 0;
                usageByDay.set(date, current + Math.abs(transaction.amount));
            }
        });
        // Convert to array format
        const chartData = Array.from(usageByDay.entries())
            .map(([date, credits]) => ({
            date,
            credits,
        }))
            .sort((a, b) => a.date.localeCompare(b.date));
        // Calculate total usage
        const totalUsed = (usage || []).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return {
            chartData,
            totalUsed,
            period: input.period,
        };
    }),
    packages: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const { data: packages, error } = await ctx.supabase
            .from('credit_packages')
            .select('*')
            .eq('is_active', true)
            .order('credits', { ascending: true });
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch credit packages',
            });
        }
        return {
            packages: packages || [],
        };
    }),
});
