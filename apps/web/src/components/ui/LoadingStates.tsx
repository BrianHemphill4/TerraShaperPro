import { Loader2 } from 'lucide-react';

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
