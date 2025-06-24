export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick?: () => void;
  };
  skipLabel?: string;
  canSkip?: boolean;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  completionAction?: () => void;
}

export interface OnboardingState {
  currentFlowId: string | null;
  currentStepIndex: number;
  completedFlows: string[];
  skippedFlows: string[];
  lastSeenAt: string | null;
  preferences: {
    showTooltips: boolean;
    showKeyboardShortcuts: boolean;
  };
}

export interface UserOnboardingProgress {
  userId: string;
  hasCompletedInitialSetup: boolean;
  hasSeenDashboardTour: boolean;
  hasCreatedFirstProject: boolean;
  hasUsedDesignTools: boolean;
  hasExportedDesign: boolean;
  toolsUsed: string[];
  featuresDiscovered: string[];
  lastActivityAt: string;
}

export const ONBOARDING_FLOWS = {
  INITIAL_SETUP: 'initial-setup',
  DASHBOARD_TOUR: 'dashboard-tour',
  DESIGN_CANVAS_INTRO: 'design-canvas-intro',
  DRAWING_TOOLS: 'drawing-tools',
  PLANT_LIBRARY: 'plant-library',
  LAYERS_AND_PROPERTIES: 'layers-and-properties',
  EXPORT_AND_SHARE: 'export-and-share',
} as const;

export type OnboardingFlowId = (typeof ONBOARDING_FLOWS)[keyof typeof ONBOARDING_FLOWS];
