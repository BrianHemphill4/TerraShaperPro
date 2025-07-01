'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  Download, 
  Home,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { AppError } from '@/lib/error/errorTypes';
import { RecoveryActions } from './RecoveryActions';

interface RecoveryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: AppError;
  onRecover?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onReset?: () => void;
  customActions?: Array<{
    label: string;
    action: () => Promise<void>;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

export function RecoveryDialog({
  isOpen,
  onOpenChange,
  error,
  onRecover,
  onExport,
  onReset,
  customActions = []
}: RecoveryDialogProps) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleRecover = async () => {
    if (!onRecover) return;

    setIsRecovering(true);
    setRecoveryStatus('idle');
    setStatusMessage('');

    try {
      await onRecover();
      setRecoveryStatus('success');
      setStatusMessage('Recovery completed successfully!');
      
      // Auto close after success
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      setRecoveryStatus('failed');
      setStatusMessage(error instanceof Error ? error.message : 'Recovery failed');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleExport = async () => {
    if (!onExport) return;

    try {
      await onExport();
      setStatusMessage('Data exported successfully');
    } catch (error) {
      setStatusMessage('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAction = async (action: () => Promise<void>) => {
    setIsRecovering(true);
    try {
      await action();
      setRecoveryStatus('success');
      setStatusMessage('Action completed successfully');
    } catch (error) {
      setRecoveryStatus('failed');
      setStatusMessage(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setIsRecovering(false);
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <AlertTriangle className="h-8 w-8 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-8 w-8 text-orange-600" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getSeverityIcon()}
            <div>
              <DialogTitle>Recovery Required</DialogTitle>
              <DialogDescription>
                {error.userMessage || 'An error occurred that requires your attention'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Details */}
          <Alert variant={error.severity === 'critical' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Error Type:</strong> {error.type}</p>
                <p><strong>Severity:</strong> {error.severity}</p>
                {error.code && <p><strong>Code:</strong> {error.code}</p>}
                {error.technicalDetails && (
                  <p className="text-sm mt-2">{error.technicalDetails}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Recovery Actions */}
          {error.recoverable !== false && (
            <RecoveryActions 
              error={error}
              onRecoveryComplete={() => {
                setRecoveryStatus('success');
                setStatusMessage('Recovery completed!');
                setTimeout(() => onOpenChange(false), 1500);
              }}
            />
          )}

          {/* Status Messages */}
          {statusMessage && (
            <Alert variant={recoveryStatus === 'success' ? 'default' : 'destructive'}>
              {recoveryStatus === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : recoveryStatus === 'failed' ? (
                <XCircle className="h-4 w-4" />
              ) : null}
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Export Data */}
          {onExport && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isRecovering}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          )}

          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={() => handleAction(action.action)}
              disabled={isRecovering}
            >
              {action.label}
            </Button>
          ))}

          {/* Primary Actions */}
          <div className="flex gap-2 sm:ml-auto">
            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
                disabled={isRecovering}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}

            {onRecover && error.recoverable !== false && (
              <Button
                onClick={handleRecover}
                disabled={isRecovering}
              >
                {isRecovering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Recover
                  </>
                )}
              </Button>
            )}

            {!error.recoverable && (
              <Button
                variant="destructive"
                onClick={() => window.location.href = '/dashboard'}
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}