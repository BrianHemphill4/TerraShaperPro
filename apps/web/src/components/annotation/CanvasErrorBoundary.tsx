'use client';

import React from 'react';
import { RefreshCw, AlertTriangle, Home, FileImage } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ErrorFallback } from '@/components/error/ErrorFallback';
import { RecoveryActions } from '@/components/error/RecoveryActions';
import { CanvasError, WebGLError, ToolError } from '@/lib/error/errorTypes';
import { reportError } from '@/lib/error/errorReporter';
import { stateRecovery } from '@/lib/error/stateRecovery';
import { performanceTracker } from '@/lib/monitoring/performanceTracker';

interface CanvasErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
  sceneName?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  getCanvasState?: () => any;
}

export function CanvasErrorBoundary({ 
  children, 
  onReset, 
  sceneName,
  canvasRef,
  getCanvasState 
}: CanvasErrorBoundaryProps) {
  const handleReset = async () => {
    performanceTracker.startMark('canvas-error-recovery');
    
    try {
      // Try to save current state before reset
      if (getCanvasState) {
        const currentState = getCanvasState();
        await stateRecovery.createSnapshot('canvas', currentState, {
          reason: 'Error recovery snapshot',
          important: true
        });
      }
      
      // Try to reset the canvas state
      onReset?.();
      
      performanceTracker.endMark('canvas-error-recovery', { result: 'success' });
    } catch (resetError) {
      reportError(resetError as Error, { context: 'canvas-reset' });
      performanceTracker.endMark('canvas-error-recovery', { result: 'failed' });
      
      // Force a page reload as fallback
      window.location.reload();
    }
  };

  const handleReturnHome = () => {
    window.location.href = '/dashboard';
  };

  const canvasErrorFallback = (error: Error, errorInfo: React.ErrorInfo) => {
    // Determine error type and create appropriate error object
    let appError: CanvasError | WebGLError | ToolError;
    
    const isWebGLError = error.message.includes('WebGL') || 
                        error.message.includes('GPU') ||
                        error.message.includes('graphics');

    const isMaskError = error.message.includes('mask') ||
                       error.message.includes('polygon') ||
                       error.message.includes('brush');

    const isMeasurementError = error.message.includes('measurement') ||
                              error.message.includes('distance') ||
                              error.message.includes('area');
    
    if (isWebGLError) {
      appError = new WebGLError(error.message, {
        context: { 
          sceneName,
          errorInfo: errorInfo.componentStack,
          fallbackRenderer: async () => {
            // Implement WebGL fallback logic
            console.log('Switching to 2D canvas renderer');
          }
        },
        userMessage: 'Your graphics hardware does not support the required features.',
        recoverable: false
      });
    } else if (isMaskError || isMeasurementError) {
      appError = new ToolError(error.message, {
        context: {
          toolName: isMaskError ? 'Annotation' : 'Measurement',
          sceneName,
          errorInfo: errorInfo.componentStack,
          resetTool: onReset
        },
        userMessage: `The ${isMaskError ? 'annotation' : 'measurement'} tool encountered an error.`,
        recoverable: true
      });
    } else {
      appError = new CanvasError(error.message, {
        context: {
          sceneName,
          errorInfo: errorInfo.componentStack,
          canvas: canvasRef?.current,
          resetCanvas: handleReset,
          recoverState: async () => {
            const latestSnapshot = stateRecovery.getLatestSnapshot('canvas');
            if (latestSnapshot) {
              const state = await stateRecovery.restoreSnapshot(latestSnapshot.id);
              return state;
            }
            return null;
          }
        },
        userMessage: 'The canvas encountered an error while rendering.',
        recoverable: true
      });
    }

    // Use enhanced error fallback component
    return (
      <ErrorFallback 
        error={appError}
        resetError={handleReset}
        errorInfo={errorInfo}
      />
    );
  };

  const handleCanvasError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Create appropriate error type
    const appError = error instanceof CanvasError || error instanceof WebGLError || error instanceof ToolError
      ? error
      : new CanvasError(error.message, {
          context: {
            sceneName,
            errorInfo: errorInfo.componentStack,
            originalError: error
          }
        });
    
    // Report error with enhanced context
    reportError(appError, {
      componentStack: errorInfo.componentStack,
      sceneName,
      canvasState: getCanvasState?.()
    });

    // Track performance metrics
    performanceTracker.recordMetric({
      name: 'canvas-error',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        errorType: appError.type,
        sceneName: sceneName || 'unknown'
      }
    });
  };

  return (
    <ErrorBoundary
      fallback={canvasErrorFallback}
      onError={handleCanvasError}
    >
      {children}
    </ErrorBoundary>
  );
}