import React from 'react';
import { Loader2, Upload, Download, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return <Loader2 className={cn('text-primary animate-spin', sizeClasses[size], className)} />;
}

type LoadingOverlayProps = {
  children?: React.ReactNode;
  className?: string;
};

export function LoadingOverlay({ children, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        {children && <div className="text-muted-foreground text-sm">{children}</div>}
      </div>
    </div>
  );
}

type PageLoaderProps = {
  text?: string;
};

export function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </div>
  );
}

type ButtonLoaderProps = {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function ButtonLoader({ loading, children, className }: ButtonLoaderProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      {loading && <Spinner size="sm" />}
      {children}
    </span>
  );
}

type InlineLoaderProps = {
  loading?: boolean;
  children: React.ReactNode;
};

export function InlineLoader({ loading, children }: InlineLoaderProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
      }}
    />
  );
}

interface CanvasSkeletonProps {
  showToolbar?: boolean;
  showSidebar?: boolean;
}

export function CanvasSkeleton({ showToolbar = true, showSidebar = true }: CanvasSkeletonProps) {
  return (
    <div className="flex h-full bg-gray-50">
      {showSidebar && (
        <div className="w-64 border-r bg-white p-4 space-y-4">
          <Skeleton height={40} />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={36} />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        {showToolbar && (
          <div className="h-16 border-b bg-white px-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width={40} height={40} variant="circular" />
            ))}
          </div>
        )}
        
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-3/4 h-3/4">
              <Skeleton className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToolPaletteSkeletonProps {
  itemCount?: number;
}

export function ToolPaletteSkeleton({ itemCount = 8 }: ToolPaletteSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <Skeleton height={24} width="60%" className="mb-4" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Skeleton key={i} height={40} variant="circular" />
        ))}
      </div>
    </div>
  );
}

interface SceneThumbnailSkeletonProps {
  count?: number;
}

export function SceneThumbnailSkeleton({ count = 5 }: SceneThumbnailSkeletonProps) {
  return (
    <div className="flex gap-2 p-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0">
          <Skeleton width={120} height={80} className="mb-2" />
          <Skeleton height={16} width="80%" />
        </div>
      ))}
    </div>
  );
}

interface HistoryPanelSkeletonProps {
  itemCount?: number;
}

export function HistoryPanelSkeleton({ itemCount = 5 }: HistoryPanelSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton height={24} width={100} />
        <div className="flex gap-2">
          <Skeleton width={32} height={32} variant="circular" />
          <Skeleton width={32} height={32} variant="circular" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton width={24} height={24} variant="circular" />
            <div className="flex-1">
              <Skeleton height={16} className="mb-1" />
              <Skeleton height={12} width="60%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  className?: string;
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'linear',
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: { height: 'h-1', text: 'text-xs', circular: 'w-8 h-8' },
    md: { height: 'h-2', text: 'text-sm', circular: 'w-12 h-12' },
    lg: { height: 'h-3', text: 'text-base', circular: 'w-16 h-16' },
  };

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`relative ${sizeClasses[size].circular}`}>
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="18"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="50%"
              cy="50%"
              r="18"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-blue-600 transition-all duration-300"
            />
          </svg>
          {showPercentage && (
            <div className={`absolute inset-0 flex items-center justify-center ${sizeClasses[size].text}`}>
              {percentage}%
            </div>
          )}
        </div>
        {label && <span className={sizeClasses[size].text}>{label}</span>}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className={sizeClasses[size].text}>{label}</span>}
          {showPercentage && <span className={sizeClasses[size].text}>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size].height}`}>
        <div
          className={`bg-blue-600 transition-all duration-300 ${sizeClasses[size].height}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface LoadingOverlayExtendedProps {
  message?: string;
  progress?: number;
  icon?: 'upload' | 'download' | 'save' | 'refresh' | 'default';
}

export function LoadingOverlayExtended({ message = 'Loading...', progress, icon = 'default' }: LoadingOverlayExtendedProps) {
  const icons = {
    upload: Upload,
    download: Download,
    save: Save,
    refresh: RefreshCw,
    default: Loader2,
  };

  const Icon = icons[icon];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <Icon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-900 font-medium mb-4">{message}</p>
          {progress !== undefined && (
            <ProgressIndicator value={progress} size="md" />
          )}
        </div>
      </div>
    </div>
  );
}

interface BatchProgressProps {
  items: Array<{
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
  }>;
  title?: string;
}

export function BatchProgress({ items, title = 'Processing items...' }: BatchProgressProps) {
  const completed = items.filter(item => item.status === 'completed').length;
  const failed = items.filter(item => item.status === 'failed').length;
  const totalProgress = Math.round((completed / items.length) * 100);

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium text-gray-900 mb-4">{title}</h3>
      <ProgressIndicator value={totalProgress} className="mb-4" />
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
            <span className="text-sm text-gray-700 truncate flex-1">{item.name}</span>
            <div className="flex items-center gap-2">
              {item.status === 'pending' && (
                <span className="text-xs text-gray-500">Waiting</span>
              )}
              {item.status === 'processing' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  {item.progress && <span className="text-xs text-blue-600">{item.progress}%</span>}
                </>
              )}
              {item.status === 'completed' && (
                <span className="text-xs text-green-600">✓ Done</span>
              )}
              {item.status === 'failed' && (
                <span className="text-xs text-red-600">✗ Failed</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {failed > 0 && (
        <div className="mt-4 p-2 bg-red-50 rounded text-sm text-red-700">
          {failed} item{failed > 1 ? 's' : ''} failed to process
        </div>
      )}
    </div>
  );
}

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <span className="text-green-600">✓</span>
            <span>Saved {lastSaved ? `at ${lastSaved.toLocaleTimeString()}` : ''}</span>
          </>
        );
      case 'error':
        return (
          <>
            <span className="text-red-600">✗</span>
            <span>Save failed</span>
          </>
        );
      default:
        return null;
    }
  };

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {getStatusDisplay()}
    </div>
  );
}
