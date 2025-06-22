'use client';

import { HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboarding';

type ContextualTooltipProps = {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function ContextualTooltip({
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  children,
  showIcon = false,
  className,
}: ContextualTooltipProps) {
  const { preferences } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !preferences.showTooltips) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <span className={cn('inline-flex items-center', className)}>
              <HelpCircle className="size-4 cursor-help text-muted-foreground transition-colors hover:text-foreground" />
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type TooltipWrapperProps = {
  tooltips: Record<string, string>;
  children: React.ReactNode;
}

export function TooltipWrapper({ tooltips, children }: TooltipWrapperProps) {
  useEffect(() => {
    // Add tooltips to elements with data-tooltip attribute
    const addTooltips = () => {
      Object.entries(tooltips).forEach(([selector, content]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (!element.hasAttribute('data-tooltip-initialized')) {
            element.setAttribute('data-tooltip', content);
            element.setAttribute('data-tooltip-initialized', 'true');
          }
        });
      });
    };

    addTooltips();

    // Re-run when DOM changes
    const observer = new MutationObserver(addTooltips);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [tooltips]);

  return <>{children}</>;
}