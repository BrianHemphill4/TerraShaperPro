import type { OnboardingFlow, OnboardingFlowId, OnboardingState, OnboardingStep } from '@terrashaper/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OnboardingStore = {
  // Actions
  startFlow: (flowId: OnboardingFlowId) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipFlow: () => void;
  completeFlow: () => void;
  resetFlow: (flowId: OnboardingFlowId) => void;
  updatePreferences: (preferences: Partial<OnboardingState['preferences']>) => void;
  
  // Getters
  getCurrentFlow: () => OnboardingFlow | null;
  getCurrentStep: () => OnboardingStep | null;
  isFlowCompleted: (flowId: OnboardingFlowId) => boolean;
  hasSeenAnyFlow: () => boolean;
} & OnboardingState

// Import will be added after creating the flows
let onboardingFlows: Record<OnboardingFlowId, OnboardingFlow> = {};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentFlowId: null,
      currentStepIndex: 0,
      completedFlows: [],
      skippedFlows: [],
      lastSeenAt: null,
      preferences: {
        showTooltips: true,
        showKeyboardShortcuts: true,
      },

      // Actions
      startFlow: (flowId) => {
        set({
          currentFlowId: flowId,
          currentStepIndex: 0,
          lastSeenAt: new Date().toISOString(),
        });
      },

      nextStep: () => {
        const { currentFlowId, currentStepIndex } = get();
        if (!currentFlowId) return;

        const flow = onboardingFlows[currentFlowId];
        if (!flow) return;

        if (currentStepIndex < flow.steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          get().completeFlow();
        }
      },

      previousStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipFlow: () => {
        const { currentFlowId, skippedFlows } = get();
        if (!currentFlowId) return;

        set({
          skippedFlows: [...skippedFlows, currentFlowId],
          currentFlowId: null,
          currentStepIndex: 0,
        });
      },

      completeFlow: () => {
        const { currentFlowId, completedFlows } = get();
        if (!currentFlowId) return;

        const flow = onboardingFlows[currentFlowId];
        if (flow?.completionAction) {
          flow.completionAction();
        }

        set({
          completedFlows: [...completedFlows, currentFlowId],
          currentFlowId: null,
          currentStepIndex: 0,
          lastSeenAt: new Date().toISOString(),
        });
      },

      resetFlow: (flowId) => {
        set((state) => ({
          completedFlows: state.completedFlows.filter((id) => id !== flowId),
          skippedFlows: state.skippedFlows.filter((id) => id !== flowId),
        }));
      },

      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },

      // Getters
      getCurrentFlow: () => {
        const { currentFlowId } = get();
        return currentFlowId ? onboardingFlows[currentFlowId] : null;
      },

      getCurrentStep: () => {
        const { currentFlowId, currentStepIndex } = get();
        if (!currentFlowId) return null;

        const flow = onboardingFlows[currentFlowId];
        return flow?.steps[currentStepIndex] || null;
      },

      isFlowCompleted: (flowId) => {
        const { completedFlows } = get();
        return completedFlows.includes(flowId);
      },

      hasSeenAnyFlow: () => {
        const { completedFlows, skippedFlows } = get();
        return completedFlows.length > 0 || skippedFlows.length > 0;
      },
    }),
    {
      name: 'terrashaper-onboarding',
    }
  )
);

// Export function to set flows (will be called from flows definition)
export const setOnboardingFlows = (flows: Record<OnboardingFlowId, OnboardingFlow>) => {
  onboardingFlows = flows;
};