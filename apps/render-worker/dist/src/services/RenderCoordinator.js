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
exports.RenderCoordinator = void 0;
const Sentry = __importStar(require("@sentry/node"));
const ai_service_1 = require("@terrashaper/ai-service");
const db_1 = require("@terrashaper/db");
const gcs_1 = require("../lib/gcs");
const logger_1 = require("../lib/logger");
const metrics_1 = require("../lib/metrics");
const CreditService_1 = require("./CreditService");
const RenderQualityService_1 = require("./RenderQualityService");
const RenderStorageService_1 = require("./RenderStorageService");
/**
 * Main coordinator service that orchestrates the render workflow
 */
class RenderCoordinator {
    constructor() {
        this.initialized = false;
        this.providerManager = new ai_service_1.ProviderManager();
        this.promptGenerator = new ai_service_1.PromptGenerator();
        this.creditService = new CreditService_1.CreditService();
        this.storageService = new RenderStorageService_1.RenderStorageService((0, gcs_1.getStorage)(), process.env.GCS_BUCKET_NAME);
        this.qualityService = new RenderQualityService_1.RenderQualityService();
        this.supabase = (0, db_1.createWorkerClient)();
    }
    /**
     * Initialize AI providers with configurations
     */
    async initializeProviders() {
        if (this.initialized) {
            return;
        }
        const configs = new Map([
            [
                ai_service_1.RenderProvider.GOOGLE_IMAGEN,
                {
                    apiKey: process.env.GOOGLE_API_KEY,
                    projectId: process.env.GOOGLE_CLOUD_PROJECT,
                    region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
                    timeout: 60000,
                    maxRetries: 3,
                },
            ],
            [
                ai_service_1.RenderProvider.OPENAI_GPT_IMAGE,
                {
                    apiKey: process.env.OPENAI_API_KEY,
                    timeout: 60000,
                    maxRetries: 3,
                },
            ],
        ]);
        await this.providerManager.initialize(configs);
        this.initialized = true;
    }
    /**
     * Process a render job from start to completion
     */
    async processRenderJob(job) {
        var _a;
        const { renderId, projectId, prompt, settings, annotations, userId, organizationId } = job.data;
        const startTime = Date.now();
        return Sentry.startSpan({
            name: 'render.process',
            op: 'render',
            attributes: {
                renderId,
                projectId,
                userId,
                organizationId,
                provider: settings.provider || 'auto',
                resolution: settings.resolution,
                quality: ((_a = settings.quality) === null || _a === void 0 ? void 0 : _a.toString()) || 'high',
            },
        }, async () => {
            Sentry.setContext('render', { renderId, projectId, settings });
            metrics_1.workerMetrics.recordJobStart(renderId, 'render.generate');
            try {
                await job.updateProgress(5);
                logger_1.logger.info(`Starting render ${renderId} for project ${projectId}`);
                // Step 1: Handle credit consumption
                await this.creditService.consumeCredits(organizationId, userId, renderId, settings);
                await job.updateProgress(10);
                // Step 2: Initialize providers and prepare generation
                await this.initializeProviders();
                const { generatedPrompt, generationOptions, provider } = await this.prepareGeneration(prompt, settings, annotations);
                await job.updateProgress(30);
                // Step 3: Generate image
                const imageStartTime = Date.now();
                const result = await provider.generateImage(generatedPrompt.prompt, generationOptions);
                Sentry.setMeasurement('image.generation', Date.now() - imageStartTime, 'millisecond');
                await job.updateProgress(70);
                // Step 4: Quality control
                const imageBuffer = await this.storageService.prepareImageBuffer(result);
                const { qualityResult, requiresManualReview } = await this.qualityService.performQualityCheck(result.imageBase64 || result.imageUrl, generationOptions.width, generationOptions.height, renderId, settings, job.attemptsMade);
                await job.updateProgress(80);
                // Step 5: Store results
                const { imageUrl, thumbnailUrl } = await this.storageService.storeRenderResult(renderId, projectId, imageBuffer, settings, generatedPrompt.hash);
                await job.updateProgress(95);
                // Step 6: Update database and record usage
                await this.finalizeRender(renderId, imageUrl, thumbnailUrl, qualityResult, result.metadata, requiresManualReview);
                await this.creditService.recordUsage(organizationId, renderId, projectId, settings);
                await job.updateProgress(100);
                const processingTime = Date.now() - startTime;
                this.recordSuccessMetrics(renderId, settings, processingTime, imageBuffer.length);
                return {
                    renderId,
                    imageUrl,
                    thumbnailUrl,
                    processingTime,
                    promptHash: generatedPrompt.hash,
                    metadata: {
                        width: generationOptions.width,
                        height: generationOptions.height,
                        format: settings.format,
                        fileSize: imageBuffer.length,
                    },
                };
            }
            catch (error) {
                await this.handleRenderFailure(error, renderId, organizationId, userId, settings, startTime);
                throw error;
            }
        });
    }
    async prepareGeneration(prompt, settings, annotations) {
        const convertedAnnotations = annotations
            .filter((a) => a.type === 'assetInstance')
            .map((a) => ({
            id: a.data.id,
            type: a.data.category || 'plant',
            name: a.data.name,
            position: a.data.position || { x: 0, y: 0 },
            size: a.data.size || { width: 100, height: 100 },
            attributes: a.data.attributes,
        }));
        const promptContext = {
            annotations: convertedAnnotations,
            template: {
                base: prompt.user,
                style: 'landscape architecture visualization',
                quality: settings.quality ? `quality level ${settings.quality}` : 'high quality',
            },
            userPreferences: {
                style: 'landscape',
            },
        };
        const promptStartTime = Date.now();
        const generatedPrompt = this.promptGenerator.generatePrompt(promptContext);
        Sentry.setMeasurement('prompt.generation', Date.now() - promptStartTime, 'millisecond');
        const [width, height] = settings.resolution.split('x').map(Number);
        const generationOptions = {
            width,
            height,
            quality: this.mapQualityLevel(settings.quality),
            style: 'realistic',
        };
        const providerType = settings.provider === 'google-imagen'
            ? ai_service_1.RenderProvider.GOOGLE_IMAGEN
            : ai_service_1.RenderProvider.OPENAI_GPT_IMAGE;
        const provider = await this.providerManager.getProvider(providerType);
        return { generatedPrompt, generationOptions, provider };
    }
    async finalizeRender(renderId, imageUrl, thumbnailUrl, qualityResult, metadata, requiresManualReview) {
        await this.supabase
            .from('renders')
            .update({
            status: 'completed',
            qualityStatus: requiresManualReview ? 'pending_review' : 'auto_approved',
            imageUrl,
            thumbnailUrl,
            metadata: Object.assign(Object.assign({}, metadata), { quality: qualityResult.score, perceptualHash: qualityResult.metadata.perceptualHash }),
            completedAt: new Date().toISOString(),
        })
            .eq('id', renderId);
    }
    async handleRenderFailure(error, renderId, organizationId, userId, settings, startTime) {
        var _a;
        logger_1.logger.error(`Error processing render ${renderId}:`, error);
        await this.supabase
            .from('renders')
            .update({
            status: 'failed',
            qualityStatus: 'rejected',
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date().toISOString(),
        })
            .eq('id', renderId);
        if (error instanceof Error && error.message !== 'Insufficient credits') {
            await this.creditService.refundCredits(organizationId, userId, renderId, settings, `Render failed: ${error.message}`);
        }
        await this.qualityService.checkForFailurePatterns();
        metrics_1.workerMetrics.recordJobComplete({
            jobId: renderId,
            jobType: 'render.generate',
            duration: Date.now() - startTime,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
                provider: settings.provider || 'unknown',
                resolution: settings.resolution,
                quality: ((_a = settings.quality) === null || _a === void 0 ? void 0 : _a.toString()) || 'high',
            },
        });
    }
    recordSuccessMetrics(renderId, settings, processingTime, imageSize) {
        var _a;
        metrics_1.workerMetrics.recordJobComplete({
            jobId: renderId,
            jobType: 'render.generate',
            duration: processingTime,
            success: true,
            metadata: {
                provider: settings.provider || 'auto',
                resolution: settings.resolution,
                quality: ((_a = settings.quality) === null || _a === void 0 ? void 0 : _a.toString()) || 'high',
                imageSize,
                creditCost: this.creditService.calculateCreditCost(settings),
            },
        });
    }
    mapQualityLevel(quality) {
        if (!quality) {
            return 'high';
        }
        if (quality <= 25) {
            return 'low';
        }
        if (quality <= 50) {
            return 'medium';
        }
        if (quality <= 75) {
            return 'high';
        }
        return 'ultra';
    }
}
exports.RenderCoordinator = RenderCoordinator;
