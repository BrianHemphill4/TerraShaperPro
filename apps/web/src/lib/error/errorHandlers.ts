import { toast } from '@/hooks/use-toast';
import type { AppError, ErrorRecoveryStrategy, ErrorType } from './errorTypes';
import { ErrorSeverity, CanvasError, NetworkError, StateError } from './errorTypes';
import { reportError } from './errorReporter';

type ErrorHandler = (error: AppError) => Promise<boolean>;

const errorHandlers: Map<ErrorType, ErrorHandler> = new Map();

// Canvas error handler
errorHandlers.set('CANVAS_RENDER', async (error: AppError) => {
  reportError(error, { handler: 'canvas' });

  // Try to recover canvas state
  if (error.context?.canvas) {
    try {
      // Attempt to reset canvas
      error.context.canvas.clear();
      error.context.canvas.renderAll();
      
      toast({
        title: 'Canvas Reset',
        description: 'The canvas has been reset. Your work has been preserved.',
        variant: 'default'
      });
      
      return true;
    } catch (resetError) {
      reportError(new CanvasError('Failed to reset canvas', {
        context: { originalError: error, resetError }
      }));
    }
  }

  toast({
    title: 'Canvas Error',
    description: error.userMessage || 'The canvas encountered an error. Please refresh the page.',
    variant: 'destructive'
  });

  return false;
});

// Tool operation error handler
errorHandlers.set('TOOL_OPERATION', async (error: AppError) => {
  reportError(error, { handler: 'tool' });

  const toolName = error.context?.toolName || 'Tool';
  
  toast({
    title: `${toolName} Error`,
    description: error.userMessage || `The ${toolName.toLowerCase()} encountered an error. Please try again.`,
    variant: 'destructive'
  });

  // Attempt to reset tool state
  if (error.context?.resetTool) {
    try {
      await error.context.resetTool();
      return true;
    } catch (resetError) {
      reportError(resetError as Error, { 
        context: { originalError: error, tool: toolName }
      });
    }
  }

  return false;
});

// State corruption error handler
errorHandlers.set('STATE_CORRUPTION', async (error: AppError) => {
  reportError(error, { handler: 'state', severity: 'critical' });

  toast({
    title: 'State Error',
    description: 'Application state has been corrupted. Attempting recovery...',
    variant: 'destructive'
  });

  // Attempt state recovery
  if (error.context?.recoverState) {
    try {
      const recovered = await error.context.recoverState();
      if (recovered) {
        toast({
          title: 'State Recovered',
          description: 'Application state has been restored to the last known good state.',
          variant: 'default'
        });
        return true;
      }
    } catch (recoveryError) {
      reportError(new StateError('State recovery failed', {
        context: { originalError: error, recoveryError }
      }));
    }
  }

  // Last resort: reload
  setTimeout(() => {
    window.location.reload();
  }, 3000);

  return false;
});

// Network error handler with retry
errorHandlers.set('NETWORK', async (error: AppError) => {
  const maxRetries = error.maxRetries || 3;
  const retryCount = error.retryCount || 0;

  if (retryCount >= maxRetries) {
    reportError(error, { handler: 'network', finalAttempt: true });
    
    toast({
      title: 'Connection Error',
      description: error.userMessage || 'Unable to connect to the server. Please check your internet connection.',
      variant: 'destructive'
    });
    
    return false;
  }

  // Exponential backoff
  const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
  
  toast({
    title: 'Connection Issue',
    description: `Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`,
    variant: 'default'
  });

  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry the operation
  if (error.context?.retry) {
    try {
      await error.context.retry();
      
      toast({
        title: 'Connection Restored',
        description: 'Successfully reconnected to the server.',
        variant: 'default'
      });
      
      return true;
    } catch (retryError) {
      const newError = new NetworkError(error.message, {
        ...error,
        retryCount: retryCount + 1,
        context: { ...error.context, lastError: retryError }
      });
      
      return handleError(newError);
    }
  }

  return false;
});

// File upload error handler
errorHandlers.set('FILE_UPLOAD', async (error: AppError) => {
  reportError(error, { handler: 'fileUpload' });

  const fileName = error.context?.fileName || 'file';
  const fileSize = error.context?.fileSize;

  let userMessage = `Failed to upload ${fileName}.`;
  
  if (error.message.includes('size')) {
    userMessage = `File "${fileName}" is too large. Maximum size is ${error.context?.maxSize || '10MB'}.`;
  } else if (error.message.includes('format') || error.message.includes('type')) {
    userMessage = `File "${fileName}" is not a supported format. Supported formats: ${error.context?.supportedFormats || 'JPG, PNG, GIF'}.`;
  }

  toast({
    title: 'Upload Failed',
    description: userMessage,
    variant: 'destructive'
  });

  return false;
});

// WebGL error handler
errorHandlers.set('WEBGL', async (error: AppError) => {
  reportError(error, { handler: 'webgl', severity: 'critical' });

  toast({
    title: 'Graphics Error',
    description: 'Your browser or graphics hardware does not support the required features. Please try a different browser or update your graphics drivers.',
    variant: 'destructive',
    duration: 10000
  });

  // Try fallback renderer
  if (error.context?.fallbackRenderer) {
    try {
      await error.context.fallbackRenderer();
      
      toast({
        title: 'Using Fallback Renderer',
        description: 'Switched to a compatibility mode. Some features may be limited.',
        variant: 'default'
      });
      
      return true;
    } catch (fallbackError) {
      reportError(fallbackError as Error, {
        context: { originalError: error }
      });
    }
  }

  return false;
});

// Memory error handler
errorHandlers.set('MEMORY', async (error: AppError) => {
  reportError(error, { handler: 'memory', severity: 'critical' });

  toast({
    title: 'Memory Warning',
    description: 'The application is running low on memory. Some features may be disabled to prevent crashes.',
    variant: 'destructive'
  });

  // Try to free memory
  if (error.context?.freeMemory) {
    try {
      await error.context.freeMemory();
      
      toast({
        title: 'Memory Optimized',
        description: 'Freed up memory. You can continue working.',
        variant: 'default'
      });
      
      return true;
    } catch (cleanupError) {
      reportError(cleanupError as Error, {
        context: { originalError: error }
      });
    }
  }

  return false;
});

// Validation error handler
errorHandlers.set('VALIDATION', async (error: AppError) => {
  reportError(error, { handler: 'validation' });

  const fieldName = error.context?.fieldName || 'Input';
  
  toast({
    title: 'Validation Error',
    description: error.userMessage || `${fieldName} contains invalid data. Please check and try again.`,
    variant: 'destructive'
  });

  return false;
});

// Export error handler
errorHandlers.set('EXPORT', async (error: AppError) => {
  reportError(error, { handler: 'export' });

  const format = error.context?.format || 'file';
  
  toast({
    title: 'Export Failed',
    description: error.userMessage || `Failed to export as ${format}. Please try a different format or reduce the file size.`,
    variant: 'destructive'
  });

  // Try alternative export format
  if (error.context?.tryAlternativeFormat) {
    toast({
      title: 'Trying Alternative Format',
      description: 'Attempting to export in a different format...',
      variant: 'default'
    });

    try {
      await error.context.tryAlternativeFormat();
      
      toast({
        title: 'Export Successful',
        description: 'Successfully exported using an alternative format.',
        variant: 'default'
      });
      
      return true;
    } catch (altError) {
      reportError(altError as Error, {
        context: { originalError: error }
      });
    }
  }

  return false;
});

// Sync error handler
errorHandlers.set('SYNC', async (error: AppError) => {
  reportError(error, { handler: 'sync' });

  toast({
    title: 'Sync Error',
    description: error.userMessage || 'Failed to sync changes. Your work is saved locally and will sync when connection is restored.',
    variant: 'default'
  });

  // Queue for later sync
  if (error.context?.queueForSync) {
    try {
      await error.context.queueForSync();
      return true;
    } catch (queueError) {
      reportError(queueError as Error, {
        context: { originalError: error }
      });
    }
  }

  return false;
});

// Default handler for unknown errors
const defaultHandler: ErrorHandler = async (error: AppError) => {
  reportError(error, { handler: 'default' });

  const severity = error.severity || ErrorSeverity.MEDIUM;
  
  const severityMessages = {
    [ErrorSeverity.LOW]: 'A minor issue occurred. You can continue working.',
    [ErrorSeverity.MEDIUM]: 'An error occurred. Some features may not work correctly.',
    [ErrorSeverity.HIGH]: 'A serious error occurred. Please save your work and refresh.',
    [ErrorSeverity.CRITICAL]: 'A critical error occurred. The application needs to restart.'
  };

  toast({
    title: 'Error',
    description: error.userMessage || severityMessages[severity],
    variant: severity === ErrorSeverity.LOW ? 'default' : 'destructive',
    duration: severity === ErrorSeverity.CRITICAL ? 10000 : 5000
  });

  if (severity === ErrorSeverity.CRITICAL && !error.recoverable) {
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  return false;
};

// Main error handling function
export async function handleError(error: Error | AppError): Promise<boolean> {
  const appError = error as AppError;
  
  if (!appError.type) {
    return defaultHandler(appError);
  }

  const handler = errorHandlers.get(appError.type) || defaultHandler;
  
  try {
    return await handler(appError);
  } catch (handlerError) {
    reportError(handlerError as Error, {
      context: { originalError: error }
    });
    return false;
  }
}

// Recovery strategies
export const recoveryStrategies: ErrorRecoveryStrategy[] = [
  {
    type: 'CANVAS_RENDER',
    execute: async (error: AppError) => {
      if (error.context?.canvas) {
        error.context.canvas.clear();
        error.context.canvas.renderAll();
        return true;
      }
      return false;
    },
    fallback: async () => {
      window.location.reload();
    }
  },
  {
    type: 'STATE_CORRUPTION',
    execute: async (error: AppError) => {
      if (error.context?.resetStore) {
        await error.context.resetStore();
        return true;
      }
      return false;
    }
  },
  {
    type: 'NETWORK',
    execute: async (error: AppError) => {
      if (error.context?.retry && error.retryCount! < error.maxRetries!) {
        await error.context.retry();
        return true;
      }
      return false;
    }
  }
];

// Global error handler setup
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    handleError(new Error(event.reason?.message || 'Unhandled promise rejection'));
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    handleError(event.error || new Error(event.message));
  });
}