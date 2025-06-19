'use client';

import * as Sentry from '@sentry/nextjs';
import type { ReactNode } from 'react';
import React, { Component } from 'react';

import { captureException } from '@/sentry';

type Props = {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = captureException(error, {
      level: 'error',
      tags: {
        component: 'ErrorBoundary',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="size-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-center text-xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've been notified about this issue and are working to fix it.
            </p>
            {this.state.eventId && (
              <p className="mt-4 text-center text-xs text-gray-500">
                Error ID: {this.state.eventId}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  Sentry.showReportDialog({ eventId: this.state.eventId! });
                }}
                className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    captureException(error, {
      level: 'error',
      extra: errorInfo,
    });
  };
}