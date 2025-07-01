import type { AppError } from '@/lib/error/errorTypes';
import { browserLogger } from '@/lib/logger';

interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: AppError | Error;
  context?: Record<string, any>;
  userAgent: string;
  url: string;
  sessionId: string;
  userId?: string;
  stackTrace?: string;
  breadcrumbs: Breadcrumb[];
}

interface Breadcrumb {
  timestamp: Date;
  type: 'navigation' | 'click' | 'console' | 'error' | 'custom';
  category: string;
  message: string;
  data?: Record<string, any>;
}

interface ErrorLoggerConfig {
  maxBreadcrumbs?: number;
  maxLogs?: number;
  enableConsoleCapture?: boolean;
  enableClickTracking?: boolean;
  enableNavigationTracking?: boolean;
  storageKey?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogEntry[] = [];
  private breadcrumbs: Breadcrumb[] = [];
  private config: ErrorLoggerConfig;
  private sessionId: string;
  private originalConsole: Record<string, any> = {};

  static getInstance(): ErrorLogger {
    if (!this.instance) {
      this.instance = new ErrorLogger();
    }
    return this.instance;
  }

  constructor(config: ErrorLoggerConfig = {}) {
    this.config = {
      maxBreadcrumbs: 50,
      maxLogs: 100,
      enableConsoleCapture: true,
      enableClickTracking: true,
      enableNavigationTracking: true,
      storageKey: 'error-logs',
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupCapture();
    this.loadLogs();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log an error
  logError(
    error: Error | AppError,
    context?: Record<string, any>,
    userId?: string
  ): string {
    const logEntry: ErrorLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      error: this.serializeError(error),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      userId,
      stackTrace: error.stack,
      breadcrumbs: [...this.breadcrumbs]
    };

    this.logs.push(logEntry);
    
    // Limit logs
    if (this.logs.length > this.config.maxLogs!) {
      this.logs = this.logs.slice(-this.config.maxLogs!);
    }

    // Save to storage
    this.saveLogs();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      browserLogger.error('Error logged:', logEntry);
    }

    return logEntry.id;
  }

  // Add a breadcrumb
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date()
    });

    // Limit breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs!) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs!);
    }
  }

  // Get error logs
  getLogs(filter?: {
    startDate?: Date;
    endDate?: Date;
    errorType?: string;
    userId?: string;
    sessionId?: string;
  }): ErrorLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(
          log => log.timestamp >= filter.startDate!
        );
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(
          log => log.timestamp <= filter.endDate!
        );
      }

      if (filter.errorType) {
        filteredLogs = filteredLogs.filter(
          log => (log.error as AppError).type === filter.errorType
        );
      }

      if (filter.userId) {
        filteredLogs = filteredLogs.filter(
          log => log.userId === filter.userId
        );
      }

      if (filter.sessionId) {
        filteredLogs = filteredLogs.filter(
          log => log.sessionId === filter.sessionId
        );
      }
    }

    return filteredLogs;
  }

  // Get error statistics
  getStatistics(): Record<string, any> {
    const stats: Record<string, any> = {
      totalErrors: this.logs.length,
      errorsByType: {},
      errorsByUrl: {},
      errorsByUser: {},
      errorRate: 0
    };

    // Count by type
    this.logs.forEach(log => {
      const errorType = (log.error as AppError).type || 'Unknown';
      stats.errorsByType[errorType] = (stats.errorsByType[errorType] || 0) + 1;

      // Count by URL
      const url = new URL(log.url).pathname;
      stats.errorsByUrl[url] = (stats.errorsByUrl[url] || 0) + 1;

      // Count by user
      if (log.userId) {
        stats.errorsByUser[log.userId] = (stats.errorsByUser[log.userId] || 0) + 1;
      }
    });

    // Calculate error rate (errors per minute)
    if (this.logs.length > 0) {
      const oldestLog = this.logs[0];
      const newestLog = this.logs[this.logs.length - 1];
      const timeSpan = newestLog.timestamp.getTime() - oldestLog.timestamp.getTime();
      const minutes = timeSpan / 60000;
      stats.errorRate = this.logs.length / minutes;
    }

    return stats;
  }

  // Export logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      // CSV export
      const headers = [
        'ID',
        'Timestamp',
        'Error Type',
        'Error Message',
        'URL',
        'User ID',
        'Session ID'
      ];

      const rows = this.logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        (log.error as AppError).type || 'Unknown',
        log.error.message,
        log.url,
        log.userId || '',
        log.sessionId
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    }
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.breadcrumbs = [];
    this.saveLogs();
  }

  // Setup capture mechanisms
  private setupCapture(): void {
    // Capture console errors
    if (this.config.enableConsoleCapture) {
      this.captureConsoleErrors();
    }

    // Capture clicks
    if (this.config.enableClickTracking) {
      this.captureClicks();
    }

    // Capture navigation
    if (this.config.enableNavigationTracking) {
      this.captureNavigation();
    }

    // Capture unhandled errors
    this.captureUnhandledErrors();
  }

  private captureConsoleErrors(): void {
    // Store original console methods
    this.originalConsole.error = console.error;
    this.originalConsole.warn = console.warn;

    // Override console.error
    console.error = (...args: any[]) => {
      this.addBreadcrumb({
        type: 'console',
        category: 'console.error',
        message: args.map(arg => String(arg)).join(' '),
        data: { arguments: args }
      });

      // Call original
      this.originalConsole.error.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      this.addBreadcrumb({
        type: 'console',
        category: 'console.warn',
        message: args.map(arg => String(arg)).join(' '),
        data: { arguments: args }
      });

      // Call original
      this.originalConsole.warn.apply(console, args);
    };
  }

  private captureClicks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const selector = this.getElementSelector(target);

      this.addBreadcrumb({
        type: 'click',
        category: 'ui.click',
        message: `Clicked ${selector}`,
        data: {
          selector,
          text: target.textContent?.slice(0, 100),
          tagName: target.tagName
        }
      });
    }, true);
  }

  private captureNavigation(): void {
    // Capture history changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args: any[]) => {
      this.addBreadcrumb({
        type: 'navigation',
        category: 'navigation.pushState',
        message: `Navigate to ${args[2]}`,
        data: { url: args[2] }
      });

      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args: any[]) => {
      this.addBreadcrumb({
        type: 'navigation',
        category: 'navigation.replaceState',
        message: `Replace state ${args[2]}`,
        data: { url: args[2] }
      });

      return originalReplaceState.apply(history, args);
    };

    // Capture popstate
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        category: 'navigation.popstate',
        message: `Navigate to ${window.location.href}`,
        data: { url: window.location.href }
      });
    });
  }

  private captureUnhandledErrors(): void {
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        { reason: event.reason }
      );
    });
  }

  private getElementSelector(element: HTMLElement): string {
    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  private serializeError(error: Error | AppError): any {
    const serialized: any = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };

    // Copy additional properties
    Object.keys(error).forEach(key => {
      if (!(key in serialized)) {
        serialized[key] = (error as any)[key];
      }
    });

    return serialized;
  }

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.config.storageKey!, JSON.stringify({
        logs: this.logs,
        breadcrumbs: this.breadcrumbs
      }));
    } catch (error) {
      console.warn('Failed to save error logs:', error);
    }
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey!);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore logs with proper Date objects
        this.logs = (data.logs || []).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          breadcrumbs: (log.breadcrumbs || []).map((b: any) => ({
            ...b,
            timestamp: new Date(b.timestamp)
          }))
        }));

        this.breadcrumbs = (data.breadcrumbs || []).map((b: any) => ({
          ...b,
          timestamp: new Date(b.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load error logs:', error);
    }
  }

  // Restore original console methods
  destroy(): void {
    if (this.originalConsole.error) {
      console.error = this.originalConsole.error;
    }
    if (this.originalConsole.warn) {
      console.warn = this.originalConsole.warn;
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience function
export function logError(
  error: Error | AppError,
  context?: Record<string, any>
): string {
  return errorLogger.logError(error, context);
}