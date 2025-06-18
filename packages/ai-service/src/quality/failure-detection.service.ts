import * as Sentry from '@sentry/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

export type FailurePattern = {
  type: 'timeout' | 'quality' | 'api_error' | 'invalid_prompt' | 'resource_limit';
  count: number;
  timeframe: number; // minutes
  threshold: number;
}

export type FailureAlert = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class FailureDetectionService {
  private supabase: SupabaseClient;
  private patterns: Map<string, FailurePattern>;
  private alertCallbacks: Array<(alert: FailureAlert) => void>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.alertCallbacks = [];
    
    // Define failure patterns to monitor
    this.patterns = new Map([
      ['high_failure_rate', {
        type: 'quality',
        count: 5,
        timeframe: 10,
        threshold: 0.5, // 50% failure rate
      }],
      ['repeated_timeouts', {
        type: 'timeout',
        count: 3,
        timeframe: 5,
        threshold: 1,
      }],
      ['api_errors', {
        type: 'api_error',
        count: 10,
        timeframe: 15,
        threshold: 1,
      }],
      ['quality_degradation', {
        type: 'quality',
        count: 10,
        timeframe: 30,
        threshold: 0.6, // avg quality score below 0.6
      }],
    ]);
  }

  async checkForFailurePatterns(): Promise<FailureAlert[]> {
    const alerts: FailureAlert[] = [];

    for (const [patternName, pattern] of this.patterns) {
      const alert = await this.checkPattern(patternName, pattern);
      if (alert) {
        alerts.push(alert);
        await this.createAlert(alert);
      }
    }

    return alerts;
  }

  private async checkPattern(
    patternName: string,
    pattern: FailurePattern
  ): Promise<FailureAlert | null> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - pattern.timeframe);

    const { data: renders } = await this.supabase
      .from('renders')
      .select('*')
      .gte('createdAt', since.toISOString())
      .order('createdAt', { ascending: false });

    if (!renders || renders.length === 0) {
      return null;
    }

    switch (pattern.type) {
      case 'quality': {
        const qualityIssues = renders.filter(r => 
          r.status === 'failed' && r.error?.includes('Quality')
        );
        
        if (patternName === 'high_failure_rate') {
          const failureRate = qualityIssues.length / renders.length;
          if (failureRate >= pattern.threshold && qualityIssues.length >= pattern.count) {
            return {
              id: crypto.randomUUID(),
              type: 'high_failure_rate',
              severity: 'high',
              message: `High quality failure rate detected: ${(failureRate * 100).toFixed(1)}% in last ${pattern.timeframe} minutes`,
              details: {
                failureRate,
                totalRenders: renders.length,
                failedRenders: qualityIssues.length,
                pattern: patternName,
              },
              createdAt: new Date(),
              acknowledged: false,
            };
          }
        } else if (patternName === 'quality_degradation') {
          const avgScore = renders
            .filter(r => r.metadata?.quality)
            .reduce((sum, r) => sum + (r.metadata.quality || 0), 0) / renders.length;
          
          if (avgScore < pattern.threshold && renders.length >= pattern.count) {
            return {
              id: crypto.randomUUID(),
              type: 'quality_degradation',
              severity: 'medium',
              message: `Average quality score dropped to ${avgScore.toFixed(2)} in last ${pattern.timeframe} minutes`,
              details: {
                avgScore,
                threshold: pattern.threshold,
                sampleSize: renders.length,
                pattern: patternName,
              },
              createdAt: new Date(),
              acknowledged: false,
            };
          }
        }
        break;
      }

      case 'timeout': {
        const timeouts = renders.filter(r => 
          r.status === 'failed' && r.error?.includes('timeout')
        );
        
        if (timeouts.length >= pattern.count) {
          return {
            id: crypto.randomUUID(),
            type: 'repeated_timeouts',
            severity: 'high',
            message: `${timeouts.length} render timeouts in last ${pattern.timeframe} minutes`,
            details: {
              timeoutCount: timeouts.length,
              affectedRenders: timeouts.map(r => r.id),
              pattern: patternName,
            },
            createdAt: new Date(),
            acknowledged: false,
          };
        }
        break;
      }

      case 'api_error': {
        const apiErrors = renders.filter(r => 
          r.status === 'failed' && (
            r.error?.includes('API') || 
            r.error?.includes('provider') ||
            r.error?.includes('rate limit')
          )
        );
        
        if (apiErrors.length >= pattern.count) {
          const errorTypes = this.categorizeApiErrors(apiErrors);
          return {
            id: crypto.randomUUID(),
            type: 'api_errors',
            severity: 'critical',
            message: `${apiErrors.length} API errors in last ${pattern.timeframe} minutes`,
            details: {
              errorCount: apiErrors.length,
              errorTypes,
              affectedProviders: [...new Set(apiErrors.map(r => r.settings?.provider))],
              pattern: patternName,
            },
            createdAt: new Date(),
            acknowledged: false,
          };
        }
        break;
      }
    }

    return null;
  }

  private categorizeApiErrors(renders: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    renders.forEach(render => {
      const error = render.error || '';
      if (error.includes('rate limit')) {
        categories.rate_limit = (categories.rate_limit || 0) + 1;
      } else if (error.includes('authentication')) {
        categories.auth_error = (categories.auth_error || 0) + 1;
      } else if (error.includes('quota')) {
        categories.quota_exceeded = (categories.quota_exceeded || 0) + 1;
      } else {
        categories.unknown = (categories.unknown || 0) + 1;
      }
    });

    return categories;
  }

  private async createAlert(alert: FailureAlert): Promise<void> {
    // Store alert in database
    const { error } = await this.supabase
      .from('failure_alerts')
      .insert(alert);

    if (error) {
      console.error('Failed to create alert:', error);
    }

    // Send to Sentry
    Sentry.captureMessage(alert.message, {
      level: this.mapSeverityToSentryLevel(alert.severity),
      tags: {
        alertType: alert.type,
        severity: alert.severity,
      },
      extra: alert.details,
    });

    // Trigger callbacks (for real-time notifications)
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (err) {
        console.error('Alert callback error:', err);
      }
    });
  }

  private mapSeverityToSentryLevel(severity: FailureAlert['severity']): Sentry.SeverityLevel {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'fatal';
    }
  }

  onAlert(callback: (alert: FailureAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('failure_alerts')
      .update({
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`);
    }
  }

  async getActiveAlerts(): Promise<FailureAlert[]> {
    const { data, error } = await this.supabase
      .from('failure_alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active alerts: ${error.message}`);
    }

    return data as FailureAlert[];
  }

  async getAlertHistory(days: number = 7): Promise<FailureAlert[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from('failure_alerts')
      .select('*')
      .gte('createdAt', since.toISOString())
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch alert history: ${error.message}`);
    }

    return data as FailureAlert[];
  }

  // Health check method to verify service connectivity
  async healthCheck(): Promise<{
    healthy: boolean;
    recentFailureRate: number;
    activeAlerts: number;
  }> {
    try {
      const hourAgo = new Date();
      hourAgo.setHours(hourAgo.getHours() - 1);

      const { data: recentRenders } = await this.supabase
        .from('renders')
        .select('status')
        .gte('createdAt', hourAgo.toISOString());

      const failureRate = recentRenders
        ? recentRenders.filter(r => r.status === 'failed').length / recentRenders.length
        : 0;

      const activeAlerts = await this.getActiveAlerts();

      return {
        healthy: failureRate < 0.1 && activeAlerts.length === 0,
        recentFailureRate: failureRate,
        activeAlerts: activeAlerts.length,
      };
    } catch {
      return {
        healthy: false,
        recentFailureRate: 1,
        activeAlerts: -1,
      };
    }
  }
}