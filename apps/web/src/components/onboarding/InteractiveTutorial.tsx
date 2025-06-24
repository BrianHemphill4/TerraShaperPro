'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboarding';

type HighlightOverlayProps = {
  target: string | null;
  padding?: number;
};

function HighlightOverlay({ target, padding = 8 }: HighlightOverlayProps) {
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!target) {
      setBounds(null);
      return;
    }

    const element = document.querySelector(target);
    if (!element) {
      setBounds(null);
      return;
    }

    const updateBounds = () => {
      const rect = element.getBoundingClientRect();
      setBounds(rect);
    };

    updateBounds();

    // Update on resize or scroll
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds);

    // Observe DOM changes
    const observer = new MutationObserver(updateBounds);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
      observer.disconnect();
    };
  }, [target]);

  if (!bounds) return null;

  return (
    <>
      {/* Dark overlay with cutout */}
      <div className="pointer-events-none fixed inset-0 z-[9998]">
        <svg className="size-full">
          <defs>
            <mask id="highlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={bounds.left - padding}
                y={bounds.top - padding}
                width={bounds.width + padding * 2}
                height={bounds.height + padding * 2}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#highlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border */}
      <div
        className="border-primary pointer-events-none fixed z-[9999] rounded-lg border-2 transition-all duration-300"
        style={{
          left: bounds.left - padding,
          top: bounds.top - padding,
          width: bounds.width + padding * 2,
          height: bounds.height + padding * 2,
        }}
      />
    </>
  );
}

type TooltipPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

function calculateTooltipPosition(
  targetBounds: DOMRect | null,
  placement: string,
  tooltipWidth = 400,
  tooltipHeight = 200
): TooltipPosition {
  if (!targetBounds) {
    // Center position
    return {
      top: window.innerHeight / 2 - tooltipHeight / 2,
      left: window.innerWidth / 2 - tooltipWidth / 2,
    };
  }

  const padding = 16;
  const position: TooltipPosition = {};

  switch (placement) {
    case 'top':
      position.bottom = window.innerHeight - targetBounds.top + padding;
      position.left = targetBounds.left + targetBounds.width / 2 - tooltipWidth / 2;
      break;
    case 'bottom':
      position.top = targetBounds.bottom + padding;
      position.left = targetBounds.left + targetBounds.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      position.right = window.innerWidth - targetBounds.left + padding;
      position.top = targetBounds.top + targetBounds.height / 2 - tooltipHeight / 2;
      break;
    case 'right':
      position.left = targetBounds.right + padding;
      position.top = targetBounds.top + targetBounds.height / 2 - tooltipHeight / 2;
      break;
    case 'center':
    default:
      position.top = window.innerHeight / 2 - tooltipHeight / 2;
      position.left = window.innerWidth / 2 - tooltipWidth / 2;
  }

  // Ensure tooltip stays within viewport
  if (position.left !== undefined) {
    position.left = Math.max(
      padding,
      Math.min(position.left, window.innerWidth - tooltipWidth - padding)
    );
  }
  if (position.right !== undefined) {
    position.right = Math.max(
      padding,
      Math.min(position.right, window.innerWidth - tooltipWidth - padding)
    );
  }
  if (position.top !== undefined) {
    position.top = Math.max(
      padding,
      Math.min(position.top, window.innerHeight - tooltipHeight - padding)
    );
  }
  if (position.bottom !== undefined) {
    position.bottom = Math.max(
      padding,
      Math.min(position.bottom, window.innerHeight - tooltipHeight - padding)
    );
  }

  return position;
}

export function InteractiveTutorial() {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetBounds, setTargetBounds] = useState<DOMRect | null>(null);

  const {
    currentFlowId,
    currentStepIndex,
    getCurrentFlow,
    getCurrentStep,
    nextStep,
    previousStep,
    skipFlow,
    completeFlow,
  } = useOnboardingStore();

  const flow = getCurrentFlow();
  const step = getCurrentStep();

  useEffect(() => {
    if (!step?.target) {
      setTargetBounds(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      setTargetBounds(element.getBoundingClientRect());
    }
  }, [step]);

  if (!flow || !step) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === flow.steps.length - 1;
  const tooltipPosition = calculateTooltipPosition(targetBounds, step.placement || 'center');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9997]"
      >
        {/* Highlight overlay */}
        <HighlightOverlay target={step.target || null} />

        {/* Tutorial tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-[10000] max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
          style={tooltipPosition}
        >
          {/* Close button */}
          {step.canSkip && (
            <button
              onClick={skipFlow}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Skip tutorial"
            >
              <X className="size-5" />
            </button>
          )}

          {/* Step indicator */}
          <div className="mb-4 flex items-center gap-1">
            {flow.steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === currentStepIndex
                    ? 'bg-primary w-8'
                    : index < currentStepIndex
                      ? 'bg-primary/50 w-4'
                      : 'w-4 bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{step.description}</p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button variant="ghost" size="sm" onClick={previousStep} className="gap-1">
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step.canSkip && (
                <Button variant="ghost" size="sm" onClick={skipFlow}>
                  {step.skipLabel || 'Skip'}
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => {
                  if (step.action?.onClick) {
                    step.action.onClick();
                  }
                  if (isLastStep) {
                    completeFlow();
                  } else {
                    nextStep();
                  }
                }}
                className="gap-1"
              >
                {step.action?.label || 'Next'}
                {!isLastStep && <ChevronRight className="size-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
