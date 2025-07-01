"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFailureMonitor = startFailureMonitor;
const ai_service_1 = require("@terrashaper/ai-service");
const logger_1 = require("../lib/logger");
const sentry_1 = require("../lib/sentry");
const MONITOR_INTERVAL = 5 * 60 * 1000; // 5 minutes
function startFailureMonitor() {
    const failureDetectionService = new ai_service_1.FailureDetectionService();
    // Set up alert handler
    failureDetectionService.onAlert(async (alert) => {
        logger_1.logger.error(`🚨 Failure Alert: ${alert.message}`, alert.details);
        // Send to monitoring service (e.g., PagerDuty, Slack, etc.)
        if (process.env.SLACK_WEBHOOK_URL) {
            try {
                await fetch(process.env.SLACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🚨 Render Service Alert (${alert.severity})`,
                        attachments: [
                            {
                                color: alert.severity === 'critical'
                                    ? 'danger'
                                    : alert.severity === 'high'
                                        ? 'warning'
                                        : 'info',
                                fields: [
                                    { title: 'Type', value: alert.type, short: true },
                                    { title: 'Severity', value: alert.severity, short: true },
                                    { title: 'Message', value: alert.message },
                                    { title: 'Details', value: JSON.stringify(alert.details, null, 2) },
                                ],
                                timestamp: new Date(alert.createdAt).toISOString(),
                            },
                        ],
                    }),
                });
            }
            catch (err) {
                logger_1.logger.error('Failed to send Slack alert:', err);
            }
        }
    });
    // Run periodic health checks
    const checkHealth = async () => {
        try {
            const health = await failureDetectionService.healthCheck();
            logger_1.logger.info('🏥 Health Check:', {
                healthy: health.healthy,
                failureRate: `${(health.recentFailureRate * 100).toFixed(1)}%`,
                activeAlerts: health.activeAlerts,
            });
            if (!health.healthy) {
                (0, sentry_1.captureException)(new Error('Render service unhealthy'), {
                    level: 'warning',
                    extra: health,
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Health check failed:', error);
            (0, sentry_1.captureException)(error);
        }
    };
    // Initial check
    checkHealth();
    // Set up periodic monitoring
    const intervalId = setInterval(async () => {
        try {
            await failureDetectionService.checkForFailurePatterns();
            await checkHealth();
        }
        catch (error) {
            logger_1.logger.error('Failure monitoring error:', error);
            (0, sentry_1.captureException)(error);
        }
    }, MONITOR_INTERVAL);
    // Graceful shutdown
    process.on('SIGTERM', () => {
        clearInterval(intervalId);
    });
    process.on('SIGINT', () => {
        clearInterval(intervalId);
    });
    logger_1.logger.info('🔍 Failure monitoring started');
}
