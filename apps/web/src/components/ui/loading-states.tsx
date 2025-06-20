import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
}

interface LoadingOverlayProps {
  children?: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ children, className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      'absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        {children && (
          <div className="text-sm text-muted-foreground">{children}</div>
        )}
      </div>
    </div>
  );
}

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

interface ButtonLoaderProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLoader({ loading, children, className }: ButtonLoaderProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      {loading && <Spinner size="sm" />}
      {children}
    </span>
  );
}

interface InlineLoaderProps {
  loading?: boolean;
  children: React.ReactNode;
}

export function InlineLoader({ loading, children }: InlineLoaderProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  return <>{children}</>;
}