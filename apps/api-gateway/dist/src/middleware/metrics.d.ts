import type { Context } from '../context';
export declare const metricsMiddleware: ({ ctx, next, path, type, }: {
    ctx: Context;
    next: () => Promise<any>;
    path: string;
    type: "query" | "mutation" | "subscription";
}) => Promise<any>;
