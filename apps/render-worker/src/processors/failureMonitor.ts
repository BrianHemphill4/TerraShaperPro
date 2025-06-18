import { FailureDetectionService } from '@terrashaper/ai-service';

import { logger } from '../lib/logger';
import { captureException } from '../lib/sentry';

const MONITOR_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function startFailureMonitor() {
  const failureDetectionService = new FailureDetectionService(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Set up alert handler
  failureDetectionService.onAlert(async (alert) => {
    logger.error(`🚨 Failure Alert: ${alert.message}`, alert.details);

    // Send to monitoring service (e.g., PagerDuty, Slack, etc.)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Render Service Alert (${alert.severity})`,
            attachments: [{
              color: alert.severity === 'critical'
                ? 'danger'
                : alert.severity === 'high' ? 'warning' : 'info',
              fields: [
                { title: 'Type', value: alert.type, short: true },
                { title: 'Severity', value: alert.severity, short: true },
                { title: 'Message', value: alert.message },
                { title: 'Details', value: JSON.stringify(alert.details, null, 2) },
              ],
              timestamp: new Date(alert.createdAt).toISOString(),
            }],
          }),
        });
      } catch (err) {
        logger.error('Failed to send Slack alert:', err);
      }
    }
  });

  // Run periodic health checks
  const checkHealth = async () => {
    try {
      const health = await failureDetectionService.healthCheck();
      logger.info('🏥 Health Check:', {
        healthy: health.healthy,
        failureRate: `${(health.recentFailureRate * 100).toFixed(1)}%`,
        activeAlerts: health.activeAlerts,
      });

      if (!health.healthy) {
        captureException(new Error('Render service unhealthy'), {
          level: 'warning',
          extra: health,
        });
      }
    } catch (error) {
      logger.error('Health check failed:', error);
      captureException(error as Error);
    }
  };

  // Initial check
  checkHealth();

  // Set up periodic monitoring
  const intervalId = setInterval(async () => {
    try {
      await failureDetectionService.checkForFailurePatterns();
      await checkHealth();
    } catch (error) {
      logger.error('Failure monitoring error:', error);
      captureException(error as Error);
    }
  }, MONITOR_INTERVAL);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    clearInterval(intervalId);
  });

  process.on('SIGINT', () => {
    clearInterval(intervalId);
  });

  logger.info('🔍 Failure monitoring started');
}
