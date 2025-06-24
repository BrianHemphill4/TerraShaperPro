"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const shared_1 = require("@terrashaper/shared");
const sentry_1 = require("./sentry");
// Create render-worker specific logger
const baseLogger = (0, shared_1.createServiceLogger)('render-worker');
// Extend with Sentry integration
exports.logger = {
    info: (message, meta) => {
        baseLogger.info(message, meta);
        (0, sentry_1.captureMessage)(message, 'info');
    },
    warn: (message, meta) => {
        baseLogger.warn(message, meta);
        (0, sentry_1.captureMessage)(message, 'warning');
    },
    error: (message, error, meta) => {
        baseLogger.error(message, error, meta);
        (0, sentry_1.captureMessage)(message, 'error');
    },
    debug: (message, meta) => {
        baseLogger.debug(message, meta);
    },
    trace: (message, meta) => {
        baseLogger.trace(message, meta);
    },
    fatal: (message, error, meta) => {
        baseLogger.fatal(message, error, meta);
        (0, sentry_1.captureMessage)(message, 'fatal');
    },
    time: (label) => baseLogger.time(label),
    metric: (name, value, unit, tags) => baseLogger.metric(name, value, unit, tags),
};
