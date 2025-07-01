import { NetworkError } from './errorTypes';
import { handleError } from './errorHandlers';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
}

interface QueuedRequest {
  id: string;
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retryCount: number;
  timestamp: Date;
}

class NetworkErrorHandler {
  private isOnline: boolean = navigator.onLine;
  private requestQueue: QueuedRequest[] = [];
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private connectionCheckerInterval?: NodeJS.Timeout;

  constructor() {
    this.setupEventListeners();
    this.startConnectionChecker();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startConnectionChecker(): void {
    // Periodically check connection status
    this.connectionCheckerInterval = setInterval(() => {
      this.checkConnection();
    }, 30000); // Check every 30 seconds
  }

  private async checkConnection(): Promise<boolean> {
    if (!this.isOnline) return false;

    try {
      // Make a lightweight request to check connectivity
      const response = await fetch('/api/health', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      return response.ok || response.type === 'opaque';
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryConfig: RetryConfig = {}
  ): Promise<T> {
    const config: Required<RetryConfig> = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        return error.name === 'NetworkError' ||
               error.status >= 500 ||
               error.code === 'ECONNABORTED' ||
               error.code === 'ETIMEDOUT';
      },
      ...retryConfig
    };

    let lastError: any;
    let retryCount = 0;

    while (retryCount <= config.maxRetries) {
      try {
        if (!this.isOnline && retryCount === 0) {
          // Queue the request if offline
          return this.queueRequest(() => 
            this.performFetch<T>(url, options)
          );
        }

        const response = await this.performFetch<T>(url, options);
        return response;
      } catch (error: any) {
        lastError = error;

        if (!config.retryCondition(error) || retryCount >= config.maxRetries) {
          throw this.enhanceError(error, url, retryCount);
        }

        const delay = Math.min(
          config.retryDelay * Math.pow(config.backoffMultiplier, retryCount),
          config.maxDelay
        );

        await this.delay(delay);
        retryCount++;
      }
    }

    throw this.enhanceError(lastError, url, retryCount);
  }

  private async performFetch<T>(url: string, options: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = options.signal ? undefined : setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal
      });

      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`, {
          code: `HTTP_${response.status}`,
          context: {
            url,
            status: response.status,
            statusText: response.statusText
          }
        });
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private enhanceError(error: any, url: string, retryCount: number): NetworkError {
    if (error instanceof NetworkError) {
      error.retryCount = retryCount;
      return error;
    }

    const message = error.message || 'Network request failed';
    const code = error.code || error.name || 'NETWORK_ERROR';

    return new NetworkError(message, {
      code,
      context: {
        url,
        originalError: error,
        retryCount,
        isOnline: this.isOnline
      },
      retryCount,
      retryable: true
    });
  }

  private async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: this.generateRequestId(),
        request,
        resolve,
        reject,
        retryCount: 0,
        timestamp: new Date()
      };

      this.requestQueue.push(queuedRequest);

      // Try to process immediately if online
      if (this.isOnline) {
        this.processQueue();
      }
    });
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.requestQueue.length === 0) {
      return;
    }

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const queuedRequest of requests) {
      try {
        const result = await queuedRequest.request();
        queuedRequest.resolve(result);
      } catch (error) {
        if (queuedRequest.retryCount < 3) {
          queuedRequest.retryCount++;
          this.requestQueue.push(queuedRequest);
        } else {
          queuedRequest.reject(error);
        }
      }
    }

    // Process any remaining requests
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 5000);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Handle specific API errors
  handleApiError(error: any, endpoint: string): void {
    let networkError: NetworkError;

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        networkError = new NetworkError('Authentication required', {
          code: 'AUTH_REQUIRED',
          context: { endpoint, status },
          recoverable: false
        });
      } else if (status === 403) {
        networkError = new NetworkError('Access denied', {
          code: 'ACCESS_DENIED',
          context: { endpoint, status },
          recoverable: false
        });
      } else if (status === 429) {
        networkError = new NetworkError('Too many requests', {
          code: 'RATE_LIMITED',
          context: { 
            endpoint, 
            status,
            retryAfter: error.response.headers['retry-after']
          },
          retryable: true
        });
      } else if (status >= 500) {
        networkError = new NetworkError('Server error', {
          code: 'SERVER_ERROR',
          context: { endpoint, status, message: data?.message },
          retryable: true
        });
      } else {
        networkError = new NetworkError(data?.message || 'Request failed', {
          code: `HTTP_${status}`,
          context: { endpoint, status, data }
        });
      }
    } else if (error.request) {
      // Request made but no response
      networkError = new NetworkError('No response from server', {
        code: 'NO_RESPONSE',
        context: { endpoint },
        retryable: true
      });
    } else {
      // Request setup error
      networkError = new NetworkError(error.message, {
        code: 'REQUEST_ERROR',
        context: { endpoint, error }
      });
    }

    handleError(networkError);
  }

  // Cleanup
  destroy(): void {
    if (this.connectionCheckerInterval) {
      clearInterval(this.connectionCheckerInterval);
    }
    
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    
    // Reject all queued requests
    this.requestQueue.forEach(request => {
      request.reject(new NetworkError('Network handler destroyed'));
    });
    this.requestQueue = [];
  }
}

// Create singleton instance
export const networkErrorHandler = new NetworkErrorHandler();

// Convenience wrapper for fetch with retry
export function fetchWithRetry<T = any>(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<T> {
  return networkErrorHandler.fetchWithRetry<T>(url, options, retryConfig);
}

// Export handler for API errors
export function handleApiError(error: any, endpoint: string): void {
  networkErrorHandler.handleApiError(error, endpoint);
}