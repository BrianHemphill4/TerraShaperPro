import type { OnboardingFlow, OnboardingFlowId } from '@terrashaper/shared';
import { ONBOARDING_FLOWS } from '@terrashaper/shared';

export const onboardingFlows: Record<OnboardingFlowId, OnboardingFlow> = {
  [ONBOARDING_FLOWS.INITIAL_SETUP]: {
    id: ONBOARDING_FLOWS.INITIAL_SETUP,
    name: 'Welcome to TerraShaperPro',
    description: 'Get started with your landscape design journey',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to TerraShaperPro! 🌿',
        description:
          "The professional landscape design tool built for Texas. Let's take a quick tour to get you started.",
        placement: 'center',
        action: {
          label: 'Get Started',
        },
        skipLabel: 'Skip Tour',
        canSkip: true,
      },
      {
        id: 'dashboard-overview',
        title: 'Your Dashboard',
        description:
          'This is your home base. Here you can manage projects, view recent activity, and access all features.',
        target: '[data-onboarding="dashboard-home"]',
        placement: 'bottom',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'create-project',
        title: 'Create Your First Project',
        description: 'Click here to start a new landscape design project.',
        target: '[data-onboarding="create-project-button"]',
        placement: 'bottom',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'organization-settings',
        title: 'Organization Settings',
        description: 'Manage your team, billing, and organization preferences here.',
        target: '[data-onboarding="settings-nav"]',
        placement: 'right',
        action: {
          label: 'Complete Tour',
        },
      },
    ],
  },

  [ONBOARDING_FLOWS.DASHBOARD_TOUR]: {
    id: ONBOARDING_FLOWS.DASHBOARD_TOUR,
    name: 'Dashboard Features',
    description: 'Learn about your dashboard capabilities',
    steps: [
      {
        id: 'projects-section',
        title: 'Your Projects',
        description:
          'All your landscape designs are organized here. You can search, filter, and manage them easily.',
        target: '[data-onboarding="projects-list"]',
        placement: 'top',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'recent-activity',
        title: 'Recent Activity',
        description: "Track what's happening across your projects and team.",
        target: '[data-onboarding="activity-feed"]',
        placement: 'left',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'quick-actions',
        title: 'Quick Actions',
        description: 'Access frequently used features with one click.',
        target: '[data-onboarding="quick-actions"]',
        placement: 'top',
        action: {
          label: 'Got it!',
        },
      },
    ],
  },

  [ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO]: {
    id: ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO,
    name: 'Design Canvas Basics',
    description: 'Learn the fundamentals of the design canvas',
    steps: [
      {
        id: 'canvas-overview',
        title: 'Your Design Canvas',
        description:
          "This is where you'll create your landscape designs. Let's explore the tools available.",
        target: '[data-onboarding="design-canvas"]',
        placement: 'center',
        action: {
          label: 'Start Tutorial',
        },
      },
      {
        id: 'toolbar-intro',
        title: 'Design Tools',
        description: 'These tools help you draw, select, and manipulate objects in your design.',
        target: '[data-onboarding="toolbar"]',
        placement: 'right',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'select-tool',
        title: 'Select Tool (S)',
        description: 'Use this to select and move objects. Click on any object to select it.',
        target: '[data-onboarding="tool-select"]',
        placement: 'right',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'save-work',
        title: 'Auto-Save',
        description:
          'Your work is automatically saved every few seconds. You can also save manually here.',
        target: '[data-onboarding="save-button"]',
        placement: 'bottom',
        action: {
          label: 'Complete Intro',
        },
      },
    ],
  },

  [ONBOARDING_FLOWS.DRAWING_TOOLS]: {
    id: ONBOARDING_FLOWS.DRAWING_TOOLS,
    name: 'Drawing Tools Tutorial',
    description: 'Master the drawing tools',
    steps: [
      {
        id: 'polygon-tool',
        title: 'Polygon Tool (P)',
        description:
          'Create closed shapes like garden beds. Click to add points, double-click to finish.',
        target: '[data-onboarding="tool-polygon"]',
        placement: 'right',
        action: {
          label: 'Try It',
        },
      },
      {
        id: 'area-tool',
        title: 'Area Tool (A)',
        description:
          'Draw areas with materials like grass, mulch, or gravel. Select a material after drawing.',
        target: '[data-onboarding="tool-area"]',
        placement: 'right',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'line-tool',
        title: 'Line Tool (L)',
        description: 'Perfect for edging, borders, and pathways. Double-click to finish drawing.',
        target: '[data-onboarding="tool-line"]',
        placement: 'right',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'material-selector',
        title: 'Material Selection',
        description: 'After drawing an area, choose the material type from this panel.',
        target: '[data-onboarding="material-selector"]',
        placement: 'left',
        action: {
          label: 'Got it!',
        },
      },
    ],
  },

  [ONBOARDING_FLOWS.PLANT_LIBRARY]: {
    id: ONBOARDING_FLOWS.PLANT_LIBRARY,
    name: 'Plant Library Guide',
    description: 'Discover and use Texas native plants',
    steps: [
      {
        id: 'open-library',
        title: 'Plant Library',
        description: 'Access over 400 Texas native plants perfect for your designs.',
        target: '[data-onboarding="plant-library-button"]',
        placement: 'left',
        action: {
          label: 'Open Library',
        },
      },
      {
        id: 'search-plants',
        title: 'Search & Filter',
        description: 'Find plants by name, type, sun requirements, or USDA zone.',
        target: '[data-onboarding="plant-search"]',
        placement: 'bottom',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'drag-drop',
        title: 'Drag & Drop',
        description: 'Simply drag plants from the library onto your canvas to place them.',
        target: '[data-onboarding="plant-grid"]',
        placement: 'top',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'plant-info',
        title: 'Plant Information',
        description: 'Click on any plant to see detailed care information and requirements.',
        target: '[data-onboarding="plant-card"]',
        placement: 'right',
        action: {
          label: 'Complete',
        },
      },
    ],
  },

  [ONBOARDING_FLOWS.LAYERS_AND_PROPERTIES]: {
    id: ONBOARDING_FLOWS.LAYERS_AND_PROPERTIES,
    name: 'Layers & Properties',
    description: 'Organize your design with layers',
    steps: [
      {
        id: 'layers-panel',
        title: 'Layers Panel',
        description: 'Organize your design elements into layers for better control.',
        target: '[data-onboarding="layers-panel"]',
        placement: 'left',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'layer-controls',
        title: 'Layer Controls',
        description: 'Show/hide layers, lock them, or change their order.',
        target: '[data-onboarding="layer-controls"]',
        placement: 'left',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'properties-panel',
        title: 'Properties Panel',
        description: 'Fine-tune selected objects by adjusting their properties here.',
        target: '[data-onboarding="properties-panel"]',
        placement: 'left',
        action: {
          label: 'Got it!',
        },
      },
    ],
  },

  [ONBOARDING_FLOWS.EXPORT_AND_SHARE]: {
    id: ONBOARDING_FLOWS.EXPORT_AND_SHARE,
    name: 'Export & Share',
    description: 'Share your designs with clients',
    steps: [
      {
        id: 'export-button',
        title: 'Export Your Design',
        description: 'Export your design in various formats including PDF, PNG, and more.',
        target: '[data-onboarding="export-button"]',
        placement: 'bottom',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'share-options',
        title: 'Share with Clients',
        description: 'Generate a link to share your design with clients for review and approval.',
        target: '[data-onboarding="share-button"]',
        placement: 'bottom',
        action: {
          label: 'Next',
        },
      },
      {
        id: 'render-design',
        title: 'AI Rendering',
        description: 'Transform your 2D design into a photorealistic 3D visualization.',
        target: '[data-onboarding="render-button"]',
        placement: 'bottom',
        action: {
          label: 'Complete Tour',
        },
      },
    ],
  },
};
