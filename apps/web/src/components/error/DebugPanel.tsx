'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bug, 
  X, 
  Activity, 
  AlertCircle, 
  Database,
  Clock,
  ChevronDown,
  ChevronRight,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceTracker } from '@/lib/monitoring/performanceTracker';
import { errorLogger } from '@/lib/monitoring/errorLogger';
import { metricsCollector } from '@/lib/monitoring/metricsCollector';
import { memoryMonitor } from '@/lib/monitoring/memoryMonitor';
import { stateRecovery } from '@/lib/error/stateRecovery';

interface DebugPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'bottom-right' | 'bottom-left';
}

export function DebugPanel({ 
  isOpen: controlledIsOpen, 
  onClose,
  position = 'bottom-right' 
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [activeTab, setActiveTab] = useState('performance');
  const [performanceData, setPerformanceData] = useState<any>({});
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Update data periodically
  useEffect(() => {
    const updateData = () => {
      setPerformanceData(performanceTracker.getPerformanceReport());
      setErrorLogs(errorLogger.getLogs().slice(-10)); // Last 10 errors
      setMemoryData(memoryMonitor.getCurrentMemory());
    };

    updateData();
    const interval = setInterval(updateData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Sync with controlled state
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      performance: performanceData,
      errors: errorLogger.getLogs(),
      memory: memoryData,
      metrics: metricsCollector.getReport()
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm('Clear all debug data? This cannot be undone.')) {
      errorLogger.clearLogs();
      metricsCollector.reset();
      setErrorLogs([]);
    }
  };

  if (!isOpen && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Debug Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(true)}
          className={`
            fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'}
            z-50 p-3 bg-gray-900 text-white rounded-full shadow-lg
            hover:bg-gray-800 transition-colors
          `}
          title="Open Debug Panel"
        >
          <Bug className="h-5 w-5" />
        </motion.button>
      )}

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`
              fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'}
              z-50 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-xl
              border border-gray-200 dark:border-gray-700 overflow-hidden
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Debug Panel
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={exportDebugData}
                  title="Export Debug Data"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearData}
                  title="Clear Data"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[500px]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start px-4 pt-2">
                  <TabsTrigger value="performance">
                    <Activity className="h-3 w-3 mr-1" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="errors">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Errors
                  </TabsTrigger>
                  <TabsTrigger value="memory">
                    <Database className="h-3 w-3 mr-1" />
                    Memory
                  </TabsTrigger>
                </TabsList>

                {/* Performance Tab */}
                <TabsContent value="performance" className="p-4 space-y-4">
                  {performanceData.metrics && Object.entries(performanceData.metrics).map(([metric, data]: [string, any]) => (
                    <div key={metric} className="space-y-2">
                      <button
                        onClick={() => toggleSection(metric)}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <span className="font-medium text-sm">{metric}</span>
                        {expandedSections.has(metric) ? 
                          <ChevronDown className="h-3 w-3" /> : 
                          <ChevronRight className="h-3 w-3" />
                        }
                      </button>
                      
                      {expandedSections.has(metric) && (
                        <div className="ml-4 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div>Count: {data.count}</div>
                          <div>Mean: {data.mean?.toFixed(2)}ms</div>
                          <div>P95: {data.p95?.toFixed(2)}ms</div>
                          <div>P99: {data.p99?.toFixed(2)}ms</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {performanceData.pageLoad && (
                    <div className="pt-2 border-t">
                      <h4 className="font-medium text-sm mb-2">Page Load</h4>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div>Total: {performanceData.pageLoad.total}ms</div>
                        <div>DOM Ready: {performanceData.pageLoad.domContentLoaded}ms</div>
                        <div>Interactive: {performanceData.pageLoad.domInteractive}ms</div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Errors Tab */}
                <TabsContent value="errors" className="p-4 space-y-3">
                  {errorLogs.length === 0 ? (
                    <p className="text-sm text-gray-500">No errors logged</p>
                  ) : (
                    errorLogs.map((log, index) => (
                      <div key={log.id || index} className="space-y-1 pb-2 border-b last:border-0">
                        <div className="flex items-start justify-between">
                          <span className="font-medium text-sm truncate flex-1">
                            {log.error.message}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.error.type && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Type: {log.error.type}
                          </div>
                        )}
                        {log.context && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-gray-500">Context</summary>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>

                {/* Memory Tab */}
                <TabsContent value="memory" className="p-4 space-y-4">
                  {memoryData ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Used</span>
                          <span className="font-medium">{memoryData.used} MB</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              memoryData.percentage > 80 ? 'bg-red-600' :
                              memoryData.percentage > 60 ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${memoryData.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>0 MB</span>
                          <span>{memoryData.limit} MB</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Heap</span>
                          <span>{memoryData.total} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heap Limit</span>
                          <span>{memoryData.limit} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usage</span>
                          <span>{memoryData.percentage}%</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => memoryMonitor.forceGarbageCollection()}
                        className="w-full"
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Force Garbage Collection
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Memory API not available</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}