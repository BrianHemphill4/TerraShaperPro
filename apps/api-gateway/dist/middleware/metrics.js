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
exports.metricsMiddleware = void 0;
const server_1 = require("@trpc/server");
const Sentry = __importStar(require("@sentry/node"));
const metrics_1 = require("../lib/metrics");
const metricsMiddleware = async ({ ctx, next, path, type, }) => {
    const start = performance.now();
    let success = true;
    let errorCode;
    // Set Sentry tags for this operation
    Sentry.setTag('trpc.path', path);
    Sentry.setTag('trpc.type', type);
    Sentry.setTag('user.id', ctx.session?.userId || 'anonymous');
    try {
        const result = await next();
        return result;
    }
    catch (error) {
        success = false;
        if (error instanceof server_1.TRPCError) {
            errorCode = error.code;
        }
        throw error;
    }
    finally {
        const duration = performance.now() - start;
        // Record metrics
        metrics_1.apiMetrics.recordTrpcCall(path, duration, success, {
            type,
            userId: ctx.session?.userId || 'anonymous',
            errorCode: errorCode || '',
        });
        // Report performance metric
        if (!success && errorCode) {
            Sentry.setTag('error.code', errorCode);
        }
    }
};
exports.metricsMiddleware = metricsMiddleware;
