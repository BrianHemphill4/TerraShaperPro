'use client';

import { useSkipLinks } from '@/hooks/use-focus-management';

export function SkipLinks() {
  const { skipToMain, skipToNav } = useSkipLinks();

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50">
      <button
        onClick={skipToMain}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </button>
      <button
        onClick={skipToNav}
        className="ml-2 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to navigation
      </button>
    </div>
  );
}