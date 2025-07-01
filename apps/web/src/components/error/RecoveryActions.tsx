'use client';

import React from 'react';
import { 
  RefreshCw, 
  Save, 
  Download, 
  Undo, 
  AlertCircle,
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AppError, ErrorType } from '@/lib/error/errorTypes';

interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => Promise<void>;
  available: boolean;
  dangerous?: boolean;
}

interface RecoveryActionsProps {
  error: AppError;
  onRecoveryComplete?: () => void;
  customActions?: RecoveryAction[];
}

export function RecoveryActions({ 
  error, 
  onRecoveryComplete,
  customActions = []
}: RecoveryActionsProps) {
  const [executing, setExecuting] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<Record<string, 'success' | 'failed'>>({});

  const getDefaultActions = (): RecoveryAction[] => {
    const actions: RecoveryAction[] = [];

    // Common recovery actions based on error type
    switch (error.type) {
      case 'CANVAS_RENDER':
        actions.push({
          id: 'reset-canvas',
          label: 'Reset Canvas',
          description: 'Clear and reinitialize the canvas',
          icon: RefreshCw,
          action: async () => {
            if (error.context?.resetCanvas) {
              await error.context.resetCanvas();
            }
          },
          available: !!error.context?.resetCanvas
        });
        break;

      case 'STATE_CORRUPTION':
        actions.push({
          id: 'restore-backup',
          label: 'Restore Backup',
          description: 'Restore from last known good state',
          icon: Undo,
          action: async () => {
            if (error.context?.restoreBackup) {
              await error.context.restoreBackup();
            }
          },
          available: !!error.context?.restoreBackup
        });
        actions.push({
          id: 'export-current',
          label: 'Export Current Work',
          description: 'Save your work before resetting',
          icon: Download,
          action: async () => {
            if (error.context?.exportWork) {
              await error.context.exportWork();
            }
          },
          available: !!error.context?.exportWork
        });
        break;

      case 'NETWORK':
        actions.push({
          id: 'retry-connection',
          label: 'Retry Connection',
          description: 'Attempt to reconnect to the server',
          icon: RefreshCw,
          action: async () => {
            if (error.context?.retry) {
              await error.context.retry();
            }
          },
          available: !!error.context?.retry
        });
        actions.push({
          id: 'work-offline',
          label: 'Continue Offline',
          description: 'Work offline and sync later',
          icon: Save,
          action: async () => {
            if (error.context?.enableOfflineMode) {
              await error.context.enableOfflineMode();
            }
          },
          available: !!error.context?.enableOfflineMode
        });
        break;

      case 'MEMORY':
        actions.push({
          id: 'clear-cache',
          label: 'Clear Cache',
          description: 'Free up memory by clearing caches',
          icon: RefreshCw,
          action: async () => {
            if (error.context?.clearCache) {
              await error.context.clearCache();
            }
          },
          available: !!error.context?.clearCache
        });
        actions.push({
          id: 'reduce-quality',
          label: 'Reduce Quality',
          description: 'Lower quality settings to use less memory',
          icon: Save,
          action: async () => {
            if (error.context?.reduceQuality) {
              await error.context.reduceQuality();
            }
          },
          available: !!error.context?.reduceQuality
        });
        break;
    }

    // Always available actions
    actions.push({
      id: 'reload-page',
      label: 'Reload Page',
      description: 'Refresh the entire application',
      icon: RefreshCw,
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.reload();
      },
      available: true,
      dangerous: true
    });

    return actions;
  };

  const allActions = [...getDefaultActions(), ...customActions].filter(a => a.available);

  const executeAction = async (action: RecoveryAction) => {
    setExecuting(action.id);
    
    try {
      await action.action();
      setResults(prev => ({ ...prev, [action.id]: 'success' }));
      
      if (onRecoveryComplete) {
        setTimeout(onRecoveryComplete, 1000);
      }
    } catch (error) {
      console.error(`Recovery action ${action.id} failed:`, error);
      setResults(prev => ({ ...prev, [action.id]: 'failed' }));
    } finally {
      setExecuting(null);
    }
  };

  if (allActions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No automatic recovery actions are available for this error.
          Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Recovery Options</h3>
      
      <div className="space-y-2">
        {allActions.map(action => {
          const isExecuting = executing === action.id;
          const result = results[action.id];
          const Icon = action.icon;

          return (
            <div
              key={action.id}
              className={`
                relative rounded-lg border p-3 transition-colors
                ${result === 'success' ? 'border-green-200 bg-green-50' : 
                  result === 'failed' ? 'border-red-200 bg-red-50' :
                  action.dangerous ? 'border-orange-200 bg-orange-50' :
                  'border-gray-200 bg-white hover:bg-gray-50'}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isExecuting ? (
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  ) : result === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : result === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Icon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {action.label}
                    </h4>
                    
                    {!result && (
                      <Button
                        size="sm"
                        variant={action.dangerous ? "destructive" : "outline"}
                        onClick={() => executeAction(action)}
                        disabled={!!executing}
                      >
                        {isExecuting ? 'Running...' : 'Try'}
                      </Button>
                    )}
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-600">
                    {action.description}
                  </p>
                  
                  {result === 'success' && (
                    <p className="mt-1 text-xs text-green-600">
                      Recovery action completed successfully
                    </p>
                  )}
                  
                  {result === 'failed' && (
                    <p className="mt-1 text-xs text-red-600">
                      Recovery action failed. Please try another option.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Object.values(results).some(r => r === 'failed') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some recovery actions failed. If problems persist, please contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}