'use client';

import React from 'react';
import { AlertTriangle, Home, RefreshCw, Download, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AppError } from '@/lib/error/errorTypes';
import { ErrorSeverity } from '@/lib/error/errorTypes';

interface ErrorFallbackProps {
  error: Error | AppError;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

export function ErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [reportSent, setReportSent] = React.useState(false);

  const appError = error as AppError;
  const severity = appError.severity || ErrorSeverity.MEDIUM;
  const isRecoverable = appError.recoverable !== false;

  const handleSendReport = async () => {
    try {
      // In a real app, this would send the error report to a service
      console.log('Sending error report:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      
      setReportSent(true);
      
      // Simulate sending report
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
    }
  };

  const handleDownloadLogs = () => {
    const errorData = {
      error: {
        message: error.message,
        stack: error.stack,
        type: appError.type,
        severity: appError.severity,
        timestamp: appError.timestamp || new Date().toISOString()
      },
      context: appError.context,
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack
      } : undefined,
      system: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(errorData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = () => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'bg-yellow-50 border-yellow-200';
      case ErrorSeverity.MEDIUM:
        return 'bg-orange-50 border-orange-200';
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200';
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = () => {
    const iconClass = severity === ErrorSeverity.CRITICAL ? 'text-red-600' : 'text-orange-600';
    return <AlertTriangle className={`h-6 w-6 ${iconClass}`} />;
  };

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-6 rounded-lg ${getSeverityColor()}`}>
      <div className="max-w-md w-full space-y-6">
        {/* Error Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            {getSeverityIcon()}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {appError.userMessage || 'Something went wrong'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {severity === ErrorSeverity.CRITICAL
              ? 'A critical error has occurred. The application may need to restart.'
              : severity === ErrorSeverity.HIGH
              ? 'A serious error has occurred. Some features may not work correctly.'
              : 'An error occurred, but you should be able to continue working.'}
          </p>
        </div>

        {/* Error Alert */}
        {appError.technicalDetails && (
          <Alert variant={severity === ErrorSeverity.LOW ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Technical Details</AlertTitle>
            <AlertDescription className="mt-2">
              {appError.technicalDetails}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isRecoverable && (
            <Button 
              onClick={resetError} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>

          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="outline"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSendReport}
            disabled={reportSent}
            className="flex-1"
          >
            <Bug className="mr-2 h-3 w-3" />
            {reportSent ? 'Report Sent' : 'Send Report'}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownloadLogs}
            className="flex-1"
          >
            <Download className="mr-2 h-3 w-3" />
            Download Logs
          </Button>
        </div>

        {/* Error Details Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showDetails ? 'Hide' : 'Show'} error details
          </button>
        </div>

        {/* Error Details */}
        {showDetails && (
          <div className="rounded-md bg-gray-900 p-4 text-xs text-gray-100 overflow-auto max-h-60">
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Error:</span> {error.message}
              </div>
              {appError.type && (
                <div>
                  <span className="text-gray-400">Type:</span> {appError.type}
                </div>
              )}
              {appError.code && (
                <div>
                  <span className="text-gray-400">Code:</span> {appError.code}
                </div>
              )}
              <div>
                <span className="text-gray-400">Severity:</span> {severity}
              </div>
              <div>
                <span className="text-gray-400">Recoverable:</span> {isRecoverable ? 'Yes' : 'No'}
              </div>
              {error.stack && (
                <div className="mt-4">
                  <div className="text-gray-400 mb-1">Stack trace:</div>
                  <pre className="whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div className="mt-4">
                  <div className="text-gray-400 mb-1">Component stack:</div>
                  <pre className="whitespace-pre-wrap break-all">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}