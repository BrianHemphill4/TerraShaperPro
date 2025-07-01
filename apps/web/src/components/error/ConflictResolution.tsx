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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitMerge, 
  FileText, 
  Clock, 
  User, 
  Cloud,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { ConflictInfo, ConflictResolutionStrategy } from '@/lib/error/conflictResolver';

interface ConflictResolutionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictInfo[];
  onResolve: (strategy: ConflictResolutionStrategy, resolutions?: Record<string, any>) => Promise<void>;
  localTimestamp?: Date;
  remoteTimestamp?: Date;
}

export function ConflictResolution({
  isOpen,
  onOpenChange,
  conflicts,
  onResolve,
  localTimestamp,
  remoteTimestamp
}: ConflictResolutionProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy>(
    ConflictResolutionStrategy.MERGE
  );
  const [manualResolutions, setManualResolutions] = useState<Record<string, any>>({});
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve(selectedStrategy, manualResolutions);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            Resolve Sync Conflicts
          </DialogTitle>
          <DialogDescription>
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found between local and remote versions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Version Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Local Version</span>
              <span className="text-gray-500">{formatTimestamp(localTimestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="h-4 w-4 text-green-600" />
              <span className="font-medium">Remote Version</span>
              <span className="text-gray-500">{formatTimestamp(remoteTimestamp)}</span>
            </div>
          </div>

          {/* Resolution Strategy */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Resolution Strategy</Label>
            <RadioGroup value={selectedStrategy} onValueChange={(value) => setSelectedStrategy(value as ConflictResolutionStrategy)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={ConflictResolutionStrategy.LOCAL_WINS} id="local" />
                <Label htmlFor="local" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Keep Local Version</p>
                    <p className="text-sm text-gray-500">Use your local changes and discard remote changes</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={ConflictResolutionStrategy.REMOTE_WINS} id="remote" />
                <Label htmlFor="remote" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Keep Remote Version</p>
                    <p className="text-sm text-gray-500">Use remote changes and discard your local changes</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={ConflictResolutionStrategy.MERGE} id="merge" />
                <Label htmlFor="merge" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Auto-Merge</p>
                    <p className="text-sm text-gray-500">Automatically merge changes where possible</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={ConflictResolutionStrategy.MANUAL} id="manual" />
                <Label htmlFor="manual" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Manual Resolution</p>
                    <p className="text-sm text-gray-500">Review and resolve each conflict individually</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conflict Details */}
          {selectedStrategy === ConflictResolutionStrategy.MANUAL && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Conflicts to Resolve
              </h3>
              
              {conflicts.map((conflict, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {conflict.path.join(' → ')}
                    </h4>
                    <span className="text-xs text-gray-500 capitalize">
                      {conflict.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Local Value
                      </Label>
                      <pre className="bg-blue-50 p-2 rounded text-xs overflow-auto max-h-32">
                        {formatValue(conflict.localValue)}
                      </pre>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Cloud className="h-3 w-3" />
                        Remote Value
                      </Label>
                      <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-32">
                        {formatValue(conflict.remoteValue)}
                      </pre>
                    </div>
                  </div>

                  {conflict.baseValue !== undefined && (
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Original Value
                      </Label>
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-20">
                        {formatValue(conflict.baseValue)}
                      </pre>
                    </div>
                  )}

                  <RadioGroup
                    value={manualResolutions[index] || 'local'}
                    onValueChange={(value) => {
                      setManualResolutions(prev => ({
                        ...prev,
                        [index]: value
                      }));
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id={`${index}-local`} />
                      <Label htmlFor={`${index}-local`} className="text-sm">Use Local</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id={`${index}-remote`} />
                      <Label htmlFor={`${index}-remote`} className="text-sm">Use Remote</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          {/* Warning for destructive actions */}
          {(selectedStrategy === ConflictResolutionStrategy.LOCAL_WINS || 
            selectedStrategy === ConflictResolutionStrategy.REMOTE_WINS) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will permanently discard {selectedStrategy === ConflictResolutionStrategy.LOCAL_WINS ? 'remote' : 'local'} changes. 
                Make sure you have exported or saved any important data.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isResolving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={isResolving || (selectedStrategy === ConflictResolutionStrategy.MANUAL && 
                      Object.keys(manualResolutions).length < conflicts.length)}
          >
            {isResolving ? (
              <>Resolving...</>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolve Conflicts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}