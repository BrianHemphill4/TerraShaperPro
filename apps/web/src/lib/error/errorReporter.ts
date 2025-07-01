import { browserLogger } from '@/lib/logger';
import type { AppError, ErrorReport, ErrorType, ErrorSeverity } from './errorTypes';

interface ErrorReporterConfig {
  endpoint?: string;
  apiKey?: string;
  environment: 'development' | 'production' | 'test';
  enableConsoleLog: boolean;
  enableRemoteLogging: boolean;
  sampleRate: number; // 0-1, percentage of errors to report
  userIdentifier?: string;
  metadata?: Record<string, any>;
}

class ErrorReporter {
  private config: ErrorReporterConfig;
  private queue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;
  private sessionId: string;
  private errorCounts: Map<ErrorType, number> = new Map();
  private lastReportTime: Map<string, Date> = new Map();

  constructor(config: Partial<ErrorReporterConfig> = {}) {
    this.config = {
      environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
      enableConsoleLog: process.env.NODE_ENV === 'development',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      sampleRate: 1,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    window.addEventListener('unload', () => {
      this.flushQueue(true);
    });
  }

  report(error: AppError | Error, additionalContext?: Record<string, any>): void {
    const appError = this.normalizeError(error);
    
    if (!this.shouldReport(appError)) {
      return;
    }

    const report: ErrorReport = {
      error: appError,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.config.userIdentifier,
      additionalContext: {
        ...this.config.metadata,
        ...additionalContext,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        memory: this.getMemoryInfo(),
        errorCount: this.incrementErrorCount(appError.type)
      }
    };

    if (this.config.enableConsoleLog) {
      this.logToConsole(report);
    }

    if (this.config.enableRemoteLogging) {
      this.sendReport(report);
    }

    this.updateLastReportTime(appError);
  }

  private normalizeError(error: Error | AppError): AppError {
    if ('type' in error && 'severity' in error) {
      return error as AppError;
    }

    return {
      ...error,
      type: 'UNKNOWN' as ErrorType,
      severity: 'medium' as ErrorSeverity,
      timestamp: new Date(),
      recoverable: true,
      retryable: false,
      context: {}
    };
  }

  private shouldReport(error: AppError): boolean {
    // Check sample rate
    if (Math.random() > this.config.sampleRate) {
      return false;
    }

    // Check for duplicate errors (debounce)
    const errorKey = `${error.type}-${error.message}`;
    const lastReport = this.lastReportTime.get(errorKey);
    if (lastReport && Date.now() - lastReport.getTime() < 5000) {
      return false;
    }

    // Don't report low severity errors in production
    if (this.config.environment === 'production' && error.severity === 'low') {
      return false;
    }

    return true;
  }

  private incrementErrorCount(type: ErrorType): number {
    const count = (this.errorCounts.get(type) || 0) + 1;
    this.errorCounts.set(type, count);
    return count;
  }

  private updateLastReportTime(error: AppError): void {
    const errorKey = `${error.type}-${error.message}`;
    this.lastReportTime.set(errorKey, new Date());
  }

  private getMemoryInfo(): Record<string, number> | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return undefined;
  }

  private logToConsole(report: ErrorReport): void {
    const groupLabel = `🚨 ${report.error.name}: ${report.error.message}`;
    
    console.group(groupLabel);
    console.error('Error Details:', {
      type: report.error.type,
      severity: report.error.severity,
      recoverable: report.error.recoverable,
      retryable: report.error.retryable,
      timestamp: report.error.timestamp
    });
    
    if (report.error.context && Object.keys(report.error.context).length > 0) {
      console.log('Context:', report.error.context);
    }
    
    console.log('Session Info:', {
      sessionId: report.sessionId,
      url: report.url,
      errorCount: report.additionalContext?.errorCount
    });
    
    if (report.error.stack) {
      console.log('Stack Trace:', report.error.stack);
    }
    
    console.groupEnd();
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    if (!this.config.endpoint) {
      this.queue.push(report);
      return;
    }

    if (!this.isOnline) {
      this.queue.push(report);
      return;
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey })
        },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        throw new Error(`Failed to send error report: ${response.statusText}`);
      }
    } catch (error) {
      browserLogger.error('Failed to send error report', error);
      this.queue.push(report);
    }
  }

  private async flushQueue(synchronous = false): Promise<void> {
    if (this.queue.length === 0 || !this.isOnline || !this.config.endpoint) {
      return;
    }

    const reports = [...this.queue];
    this.queue = [];

    if (synchronous) {
      // Use sendBeacon for synchronous sending on page unload
      navigator.sendBeacon(
        this.config.endpoint,
        JSON.stringify({ reports, apiKey: this.config.apiKey })
      );
    } else {
      for (const report of reports) {
        await this.sendReport(report);
      }
    }
  }

  getErrorStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.errorCounts.forEach((count, type) => {
      stats[type] = count;
    });

    return {
      sessionId: this.sessionId,
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorsByType: stats,
      queuedReports: this.queue.length,
      isOnline: this.isOnline
    };
  }

  clearStats(): void {
    this.errorCounts.clear();
    this.lastReportTime.clear();
  }

  setUserIdentifier(userId: string): void {
    this.config.userIdentifier = userId;
  }

  updateMetadata(metadata: Record<string, any>): void {
    this.config.metadata = {
      ...this.config.metadata,
      ...metadata
    };
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

// Convenience function for reporting errors
export function reportError(
  error: Error | AppError,
  context?: Record<string, any>
): void {
  errorReporter.report(error, context);
}