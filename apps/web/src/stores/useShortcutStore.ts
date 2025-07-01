import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ShortcutCustomization, ShortcutDefinition } from '@/components/shortcuts/ShortcutManager';

interface ShortcutStore {
  // State
  customizations: ShortcutCustomization[];
  helpVisible: boolean;
  tutorialMode: boolean;
  currentTutorial: string | null;
  activeContext: string | null;
  
  // Actions
  setCustomizations: (customizations: ShortcutCustomization[]) => void;
  addCustomization: (customization: ShortcutCustomization) => void;
  removeCustomization: (shortcutId: string) => void;
  updateCustomization: (shortcutId: string, updates: Partial<ShortcutCustomization>) => void;
  resetCustomizations: () => void;
  
  // Help overlay
  showHelp: () => void;
  hideHelp: () => void;
  toggleHelp: () => void;
  
  // Tutorial system
  startTutorial: (tutorialId: string) => void;
  stopTutorial: () => void;
  setTutorialMode: (enabled: boolean) => void;
  
  // Context management
  setActiveContext: (context: string | null) => void;
  
  // Utilities
  getCustomization: (shortcutId: string) => ShortcutCustomization | undefined;
  exportCustomizations: () => ShortcutCustomization[];
  importCustomizations: (customizations: ShortcutCustomization[]) => void;
  hasCustomizations: () => boolean;
}

export const useShortcutStore = create<ShortcutStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        customizations: [],
        helpVisible: false,
        tutorialMode: false,
        currentTutorial: null,
        activeContext: null,

        // Actions
        setCustomizations: (customizations) => {
          set({ customizations }, false, 'setCustomizations');
        },

        addCustomization: (customization) => {
          set((state) => {
            // Remove any existing customization for this shortcut
            const filtered = state.customizations.filter(
              c => c.shortcutId !== customization.shortcutId
            );
            return {
              customizations: [...filtered, customization],
            };
          }, false, 'addCustomization');
        },

        removeCustomization: (shortcutId) => {
          set((state) => ({
            customizations: state.customizations.filter(c => c.shortcutId !== shortcutId),
          }), false, 'removeCustomization');
        },

        updateCustomization: (shortcutId, updates) => {
          set((state) => ({
            customizations: state.customizations.map(c =>
              c.shortcutId === shortcutId ? { ...c, ...updates } : c
            ),
          }), false, 'updateCustomization');
        },

        resetCustomizations: () => {
          set({ customizations: [] }, false, 'resetCustomizations');
        },

        // Help overlay
        showHelp: () => {
          set({ helpVisible: true }, false, 'showHelp');
        },

        hideHelp: () => {
          set({ helpVisible: false }, false, 'hideHelp');
        },

        toggleHelp: () => {
          set((state) => ({ helpVisible: !state.helpVisible }), false, 'toggleHelp');
        },

        // Tutorial system
        startTutorial: (tutorialId) => {
          set({
            currentTutorial: tutorialId,
            tutorialMode: true,
            helpVisible: false, // Close help when starting tutorial
          }, false, 'startTutorial');
        },

        stopTutorial: () => {
          set({
            currentTutorial: null,
            tutorialMode: false,
          }, false, 'stopTutorial');
        },

        setTutorialMode: (enabled) => {
          set((state) => ({
            tutorialMode: enabled,
            currentTutorial: enabled ? state.currentTutorial : null,
          }), false, 'setTutorialMode');
        },

        // Context management
        setActiveContext: (context) => {
          set({ activeContext: context }, false, 'setActiveContext');
        },

        // Utilities
        getCustomization: (shortcutId) => {
          return get().customizations.find(c => c.shortcutId === shortcutId);
        },

        exportCustomizations: () => {
          return get().customizations;
        },

        importCustomizations: (customizations) => {
          set({ customizations }, false, 'importCustomizations');
        },

        hasCustomizations: () => {
          return get().customizations.length > 0;
        },
      }),
      {
        name: 'terrashaper-shortcuts',
        partialize: (state) => ({
          customizations: state.customizations,
        }),
      }
    ),
    { name: 'ShortcutStore' }
  )
);

// Hook for shortcut actions
export const useShortcutActions = () => {
  const store = useShortcutStore();
  
  const handleShortcutAction = (action: string) => {
    switch (action) {
      case 'show_shortcuts':
        store.toggleHelp();
        break;
      case 'show_help':
        store.showHelp();
        break;
      default:
        // Handle other shortcut actions
        console.log('Shortcut action:', action);
    }
  };

  return {
    handleShortcutAction,
    ...store,
  };
};

// Helper hook for getting effective shortcuts (with customizations applied)
export const useEffectiveShortcuts = (shortcuts: ShortcutDefinition[]) => {
  const customizations = useShortcutStore(state => state.customizations);
  
  return shortcuts.map(shortcut => {
    const customization = customizations.find(c => c.shortcutId === shortcut.id);
    if (customization) {
      return {
        ...shortcut,
        key: customization.key,
        modifiers: customization.modifiers,
      };
    }
    return shortcut;
  });
};