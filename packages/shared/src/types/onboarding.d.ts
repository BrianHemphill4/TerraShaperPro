export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    target?: string;
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
export declare const ONBOARDING_FLOWS: {
    readonly INITIAL_SETUP: "initial-setup";
    readonly DASHBOARD_TOUR: "dashboard-tour";
    readonly DESIGN_CANVAS_INTRO: "design-canvas-intro";
    readonly DRAWING_TOOLS: "drawing-tools";
    readonly PLANT_LIBRARY: "plant-library";
    readonly LAYERS_AND_PROPERTIES: "layers-and-properties";
    readonly EXPORT_AND_SHARE: "export-and-share";
};
export type OnboardingFlowId = (typeof ONBOARDING_FLOWS)[keyof typeof ONBOARDING_FLOWS];
