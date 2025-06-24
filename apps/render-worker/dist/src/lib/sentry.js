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
exports.initSentry = initSentry;
exports.captureException = captureException;
exports.captureMessage = captureMessage;
exports.setJobContext = setJobContext;
exports.addBreadcrumb = addBreadcrumb;
exports.startTransaction = startTransaction;
exports.withSentry = withSentry;
const Sentry = __importStar(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
function initSentry() {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        integrations: [
            // Add profiling integration
            (0, profiling_node_1.nodeProfilingIntegration)(),
        ],
        // Set transaction name source
        beforeSend(event, _hint) {
            var _a, _b;
            // Sanitize any sensitive data
            if ((_a = event.request) === null || _a === void 0 ? void 0 : _a.cookies) {
                delete event.request.cookies;
            }
            if ((_b = event.request) === null || _b === void 0 ? void 0 : _b.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
            }
            return event;
        },
        // Configure error filtering
        ignoreErrors: [
            // Ignore common browser errors
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            // Ignore specific HTTP status codes
            /^4\d{2}$/,
        ],
    });
}
function captureException(error, context) {
    Sentry.captureException(error, {
        extra: context,
    });
}
function captureMessage(message, level = 'info') {
    Sentry.captureMessage(message, level);
}
function setJobContext(jobId, jobData) {
    Sentry.setContext('job', {
        id: jobId,
        type: jobData.type,
        userId: jobData.userId,
        projectId: jobData.projectId,
    });
}
function addBreadcrumb(breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
}
function startTransaction(name, op) {
    return Sentry.startSpan({ name, op }, () => { });
}
function withSentry(fn, options) {
    return ((...args) => {
        return Sentry.startSpan({
            name: (options === null || options === void 0 ? void 0 : options.name) || fn.name || 'anonymous',
            op: (options === null || options === void 0 ? void 0 : options.op) || 'function',
        }, () => fn(...args));
    });
}
