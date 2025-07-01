'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppError, ErrorSeverity } from '@/lib/error/errorTypes';

interface ErrorNotificationProps {
  error: AppError | Error;
  onDismiss?: () => void;
  autoHide?: boolean;
  hideDelay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
}

export function ErrorNotification({
  error,
  onDismiss,
  autoHide = true,
  hideDelay = 5000,
  position = 'top-right',
  showDetails = false
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  const appError = error as AppError;
  const severity = appError.severity || 'medium';

  useEffect(() => {
    if (autoHide && severity !== 'critical') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, severity, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getIcon = () => {
    switch (severity) {
      case 'low':
        return <Info className="h-5 w-5" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    switch (severity) {
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-900 dark:text-yellow-100'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          text: 'text-orange-900 dark:text-orange-100'
        };
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-900 dark:text-gray-100'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('top') ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full`}
        >
          <div
            className={`
              ${colors.bg} ${colors.border} ${colors.text}
              border rounded-lg shadow-lg p-4
              backdrop-blur-sm
            `}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${colors.icon}`}>
                {getIcon()}
              </div>
              
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  {appError.userMessage || error.message}
                </h3>
                
                {appError.code && (
                  <p className="mt-1 text-xs opacity-75">
                    Error Code: {appError.code}
                  </p>
                )}

                {showFullDetails && (
                  <div className="mt-2 text-xs space-y-1">
                    {appError.type && (
                      <p>Type: {appError.type}</p>
                    )}
                    {appError.technicalDetails && (
                      <p>Details: {appError.technicalDetails}</p>
                    )}
                    {appError.retryable && (
                      <p className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        This error can be retried
                      </p>
                    )}
                  </div>
                )}

                {!showFullDetails && (appError.technicalDetails || appError.type) && (
                  <button
                    onClick={() => setShowFullDetails(true)}
                    className="mt-1 text-xs underline opacity-75 hover:opacity-100"
                  >
                    Show details
                  </button>
                )}
              </div>

              {(!autoHide || severity === 'critical') && (
                <button
                  onClick={handleDismiss}
                  className={`
                    ml-3 flex-shrink-0 rounded-full p-1
                    hover:bg-black/10 dark:hover:bg-white/10
                    transition-colors
                  `}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Progress bar for auto-hide */}
            {autoHide && severity !== 'critical' && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: hideDelay / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.icon} origin-left`}
                style={{ backgroundColor: 'currentColor' }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Notification manager for multiple notifications
interface Notification {
  id: string;
  error: AppError | Error;
  timestamp: Date;
}

export function ErrorNotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for error events (you'd implement this based on your error system)
  useEffect(() => {
    const handleError = (event: CustomEvent<{ error: AppError | Error }>) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        error: event.detail.error,
        timestamp: new Date()
      };

      setNotifications(prev => [...prev, notification]);
    };

    window.addEventListener('app-error' as any, handleError);
    return () => window.removeEventListener('app-error' as any, handleError);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: index * 0.1 }}
          >
            <ErrorNotification
              error={notification.error}
              onDismiss={() => dismissNotification(notification.id)}
              position="top-right"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}