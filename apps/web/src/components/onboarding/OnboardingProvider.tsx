'use client';

import { useUser } from '@clerk/nextjs';
import { ONBOARDING_FLOWS } from '@terrashaper/shared';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { onboardingFlows } from '@/lib/onboardingFlows';
import { setOnboardingFlows, useOnboardingStore } from '@/stores/onboarding';

import { InteractiveTutorial } from './InteractiveTutorial';

// Initialize flows
setOnboardingFlows(onboardingFlows);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { startFlow, hasSeenAnyFlow, isFlowCompleted, currentFlowId } = useOnboardingStore();

  useEffect(() => {
    if (!isLoaded || !user || currentFlowId) return;

    // Check if user should see initial setup
    if (!hasSeenAnyFlow() && pathname.includes('/dashboard')) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startFlow(ONBOARDING_FLOWS.INITIAL_SETUP);
      }, 500);
    }

    // Check for specific page tutorials
    if (pathname.includes('/design') && !isFlowCompleted(ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO)) {
      // Only start if user has completed initial setup
      if (isFlowCompleted(ONBOARDING_FLOWS.INITIAL_SETUP)) {
        setTimeout(() => {
          startFlow(ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO);
        }, 500);
      }
    }
  }, [pathname, user, isLoaded, hasSeenAnyFlow, isFlowCompleted, startFlow, currentFlowId]);

  return (
    <>
      {children}
      <InteractiveTutorial />
    </>
  );
}
