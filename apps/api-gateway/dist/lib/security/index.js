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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cspConfig = exports.corsConfig = exports.SecurityService = void 0;
const helmet_1 = __importDefault(require("@fastify/helmet"));
const cors_1 = require("./cors");
Object.defineProperty(exports, "corsConfig", { enumerable: true, get: function () { return cors_1.corsConfig; } });
const headers_1 = require("./headers");
Object.defineProperty(exports, "cspConfig", { enumerable: true, get: function () { return headers_1.cspConfig; } });
/**
 * Main security configuration service that orchestrates all security modules
 */
class SecurityService {
    app;
    constructor(app) {
        this.app = app;
    }
    /**
     * Apply all security configurations to the Fastify instance
     */
    async configure() {
        await this.configureHelmet();
        this.addCustomHeaders();
        this.configureRequestLimits();
    }
    /**
     * Configure Helmet security middleware
     */
    async configureHelmet() {
        await this.app.register(helmet_1.default, {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    fontSrc: ["'self'", 'https:', 'data:'],
                    connectSrc: ["'self'", 'https:'],
                    mediaSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    frameSrc: ["'self'"],
                    baseUri: ["'self'"],
                    formAction: ["'self'"],
                    frameAncestors: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
        });
    }
    /**
     * Add custom security headers
     */
    addCustomHeaders() {
        (0, headers_1.addSecurityHeaders)(this.app);
    }
    /**
     * Configure request limits
     */
    configureRequestLimits() {
        (0, headers_1.configureRequestLimits)(this.app);
    }
}
exports.SecurityService = SecurityService;
// Re-export all security modules for convenient access
__exportStar(require("./authConfig"), exports);
__exportStar(require("./cors"), exports);
__exportStar(require("./encryption"), exports);
__exportStar(require("./fileValidation"), exports);
__exportStar(require("./headers"), exports);
