'use client';

import { useSkipLinks } from '@terrashaper/hooks/use-focus-management';

export function SkipLinks() {
  const { skipToMain, skipToNav } = useSkipLinks();

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:left-4 focus-within:top-4 focus-within:z-50">
      <button
        onClick={skipToMain}
        className="bg-primary text-primary-foreground focus:ring-ring rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip to main content
      </button>
      <button
        onClick={skipToNav}
        className="bg-primary text-primary-foreground focus:ring-ring ml-2 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip to navigation
      </button>
    </div>
  );
}
