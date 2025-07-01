'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToolError } from '@/lib/error/errorTypes';
import { reportError } from '@/lib/error/errorReporter';

interface ToolErrorBoundaryProps {
  children: React.ReactNode;
  toolName: string;
  onReset?: () => void;
  onClose?: () => void;
}

export function ToolErrorBoundary({ 
  children, 
  toolName, 
  onReset,
  onClose 
}: ToolErrorBoundaryProps) {
  const [errorCount, setErrorCount] = React.useState(0);

  const handleReset = () => {
    setErrorCount(0);
    onReset?.();
  };

  const toolErrorFallback = (error: Error, errorInfo: React.ErrorInfo) => {
    // Report the error
    const toolError = new ToolError(error.message, {
      context: {
        toolName,
        errorInfo: errorInfo.componentStack,
        errorCount: errorCount + 1
      },
      userMessage: `The ${toolName} tool encountered an error and needs to be reset.`
    });
    
    reportError(toolError);

    return (
      <div className="relative rounded-lg border border-red-200 bg-red-50 p-4">
        {/* Close button if onClose provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-red-100"
            aria-label="Close tool"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        )}

        <Alert variant="destructive" className="border-0 bg-transparent p-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{toolName} Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message.includes('memory') 
              ? 'The tool ran out of memory. Try working with smaller selections.'
              : error.message.includes('state')
              ? 'The tool state is corrupted. Please reset and try again.'
              : `An error occurred while using the ${toolName} tool.`}
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-3 w-3" />
            Reset Tool
          </Button>
          
          {onClose && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close Tool
            </Button>
          )}
        </div>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-xs text-red-700">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-red-100 p-2">
              {error.toString()}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    );
  };

  const handleToolError = (error: Error, errorInfo: React.ErrorInfo) => {
    setErrorCount(prev => prev + 1);
    
    // Log tool-specific error information
    console.error(`${toolName} Tool Error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount: errorCount + 1,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <ErrorBoundary
      fallback={toolErrorFallback}
      onError={handleToolError}
    >
      {children}
    </ErrorBoundary>
  );
}