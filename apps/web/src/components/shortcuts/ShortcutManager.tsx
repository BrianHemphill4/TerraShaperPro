'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './ShortcutManager.module.css';

export interface ShortcutDefinition {
  id: string;
  key: string;
  modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: string;
  description: string;
  category: 'tools' | 'edit' | 'layers' | 'export' | 'view' | 'navigation' | 'selection';
  context?: string; // Optional context restriction
  customizable: boolean;
  icon?: string;
  handler?: () => void;
}

export interface ShortcutCustomization {
  shortcutId: string;
  key: string;
  modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[];
}

interface ShortcutManagerProps {
  shortcuts: ShortcutDefinition[];
  customizations: ShortcutCustomization[];
  onShortcutTrigger: (shortcutId: string) => void;
  onCustomizationChange: (customizations: ShortcutCustomization[]) => void;
  activeContext?: string;
  disabled?: boolean;
}

// Default comprehensive shortcuts for professional CAD software
const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // Tools
  { id: 'tool_select', key: 'v', modifiers: [], action: 'select_tool', description: 'Select Tool', category: 'tools', customizable: true, icon: '↖️' },
  { id: 'tool_move', key: 'm', modifiers: [], action: 'move_tool', description: 'Move Tool', category: 'tools', customizable: true, icon: '↔️' },
  { id: 'tool_draw', key: 'd', modifiers: [], action: 'draw_tool', description: 'Draw Tool', category: 'tools', customizable: true, icon: '✏️' },
  { id: 'tool_measure', key: 'r', modifiers: [], action: 'measure_tool', description: 'Measure Tool', category: 'tools', customizable: true, icon: '📏' },
  { id: 'tool_pan', key: 'h', modifiers: [], action: 'pan_tool', description: 'Pan Tool', category: 'tools', customizable: true, icon: '✋' },
  { id: 'tool_zoom', key: 'z', modifiers: [], action: 'zoom_tool', description: 'Zoom Tool', category: 'tools', customizable: true, icon: '🔍' },

  // Edit operations
  { id: 'edit_undo', key: 'z', modifiers: ['ctrl'], action: 'undo', description: 'Undo', category: 'edit', customizable: false, icon: '↶' },
  { id: 'edit_redo', key: 'y', modifiers: ['ctrl'], action: 'redo', description: 'Redo', category: 'edit', customizable: false, icon: '↷' },
  { id: 'edit_redo_alt', key: 'z', modifiers: ['ctrl', 'shift'], action: 'redo', description: 'Redo (Alt)', category: 'edit', customizable: false, icon: '↷' },
  { id: 'edit_copy', key: 'c', modifiers: ['ctrl'], action: 'copy', description: 'Copy', category: 'edit', customizable: false, icon: '📋' },
  { id: 'edit_cut', key: 'x', modifiers: ['ctrl'], action: 'cut', description: 'Cut', category: 'edit', customizable: false, icon: '✂️' },
  { id: 'edit_paste', key: 'v', modifiers: ['ctrl'], action: 'paste', description: 'Paste', category: 'edit', customizable: false, icon: '📌' },
  { id: 'edit_duplicate', key: 'd', modifiers: ['ctrl'], action: 'duplicate', description: 'Duplicate', category: 'edit', customizable: true, icon: '👥' },
  { id: 'edit_delete', key: 'Delete', modifiers: [], action: 'delete', description: 'Delete', category: 'edit', customizable: false, icon: '🗑️' },
  { id: 'edit_delete_alt', key: 'Backspace', modifiers: [], action: 'delete', description: 'Delete (Alt)', category: 'edit', customizable: false, icon: '🗑️' },

  // Selection
  { id: 'select_all', key: 'a', modifiers: ['ctrl'], action: 'select_all', description: 'Select All', category: 'selection', customizable: false, icon: '🔲' },
  { id: 'select_none', key: 'd', modifiers: ['ctrl', 'shift'], action: 'select_none', description: 'Deselect All', category: 'selection', customizable: true, icon: '⬜' },
  { id: 'select_invert', key: 'i', modifiers: ['ctrl', 'shift'], action: 'select_invert', description: 'Invert Selection', category: 'selection', customizable: true, icon: '🔄' },

  // Layers
  { id: 'layer_new', key: 'l', modifiers: ['ctrl', 'shift'], action: 'new_layer', description: 'New Layer', category: 'layers', customizable: true, icon: '📄' },
  { id: 'layer_duplicate', key: 'j', modifiers: ['ctrl'], action: 'duplicate_layer', description: 'Duplicate Layer', category: 'layers', customizable: true, icon: '📄' },
  { id: 'layer_group', key: 'g', modifiers: ['ctrl'], action: 'group_layers', description: 'Group Layers', category: 'layers', customizable: true, icon: '📁' },
  { id: 'layer_ungroup', key: 'g', modifiers: ['ctrl', 'shift'], action: 'ungroup_layers', description: 'Ungroup Layers', category: 'layers', customizable: true, icon: '📂' },
  { id: 'layer_hide', key: 'h', modifiers: ['ctrl'], action: 'hide_layer', description: 'Hide Layer', category: 'layers', customizable: true, icon: '👁️' },
  { id: 'layer_lock', key: 'l', modifiers: ['ctrl'], action: 'lock_layer', description: 'Lock Layer', category: 'layers', customizable: true, icon: '🔒' },

  // View operations
  { id: 'view_zoom_in', key: '=', modifiers: ['ctrl'], action: 'zoom_in', description: 'Zoom In', category: 'view', customizable: true, icon: '🔍' },
  { id: 'view_zoom_out', key: '-', modifiers: ['ctrl'], action: 'zoom_out', description: 'Zoom Out', category: 'view', customizable: true, icon: '🔍' },
  { id: 'view_zoom_fit', key: '0', modifiers: ['ctrl'], action: 'zoom_fit', description: 'Fit to Screen', category: 'view', customizable: true, icon: '🖼️' },
  { id: 'view_zoom_100', key: '1', modifiers: ['ctrl'], action: 'zoom_100', description: 'Actual Size', category: 'view', customizable: true, icon: '💯' },
  { id: 'view_grid_toggle', key: 'g', modifiers: ['ctrl', 'shift'], action: 'toggle_grid', description: 'Toggle Grid', category: 'view', customizable: true, icon: '▦' },
  { id: 'view_rulers_toggle', key: 'r', modifiers: ['ctrl', 'shift'], action: 'toggle_rulers', description: 'Toggle Rulers', category: 'view', customizable: true, icon: '📏' },

  // Navigation
  { id: 'nav_pan_up', key: 'ArrowUp', modifiers: ['shift'], action: 'pan_up', description: 'Pan Up', category: 'navigation', customizable: true, icon: '⬆️' },
  { id: 'nav_pan_down', key: 'ArrowDown', modifiers: ['shift'], action: 'pan_down', description: 'Pan Down', category: 'navigation', customizable: true, icon: '⬇️' },
  { id: 'nav_pan_left', key: 'ArrowLeft', modifiers: ['shift'], action: 'pan_left', description: 'Pan Left', category: 'navigation', customizable: true, icon: '⬅️' },
  { id: 'nav_pan_right', key: 'ArrowRight', modifiers: ['shift'], action: 'pan_right', description: 'Pan Right', category: 'navigation', customizable: true, icon: '➡️' },

  // Export
  { id: 'export_save', key: 's', modifiers: ['ctrl'], action: 'save', description: 'Save', category: 'export', customizable: false, icon: '💾' },
  { id: 'export_save_as', key: 's', modifiers: ['ctrl', 'shift'], action: 'save_as', description: 'Save As', category: 'export', customizable: true, icon: '💾' },
  { id: 'export_export', key: 'e', modifiers: ['ctrl'], action: 'export', description: 'Export', category: 'export', customizable: true, icon: '📤' },
  { id: 'export_print', key: 'p', modifiers: ['ctrl'], action: 'print', description: 'Print', category: 'export', customizable: false, icon: '🖨️' },

  // Help and interface
  { id: 'help_shortcuts', key: '/', modifiers: ['ctrl'], action: 'show_shortcuts', description: 'Show Shortcuts', category: 'tools', customizable: false, icon: '❓' },
  { id: 'help_help', key: 'F1', modifiers: [], action: 'show_help', description: 'Help', category: 'tools', customizable: false, icon: '💡' },
];

export const useShortcutManager = (
  onShortcutTrigger: (shortcutId: string) => void,
  activeContext?: string,
  disabled?: boolean
) => {
  const [shortcuts, setShortcuts] = useState<ShortcutDefinition[]>(DEFAULT_SHORTCUTS);
  const [customizations, setCustomizations] = useState<ShortcutCustomization[]>([]);
  const pressedKeys = useRef<Set<string>>(new Set());

  // Load customizations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('terrashaper-shortcuts');
      if (saved) {
        const savedCustomizations = JSON.parse(saved);
        setCustomizations(savedCustomizations);
      }
    } catch (error) {
      console.warn('Failed to load shortcut customizations:', error);
    }
  }, []);

  // Save customizations to localStorage
  const saveCustomizations = useCallback((newCustomizations: ShortcutCustomization[]) => {
    try {
      localStorage.setItem('terrashaper-shortcuts', JSON.stringify(newCustomizations));
      setCustomizations(newCustomizations);
    } catch (error) {
      console.warn('Failed to save shortcut customizations:', error);
    }
  }, []);

  // Apply customizations to shortcuts
  const getEffectiveShortcuts = useCallback(() => {
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
  }, [shortcuts, customizations]);

  // Check if a key combination matches a shortcut
  const matchesShortcut = useCallback((
    shortcut: ShortcutDefinition,
    pressedKey: string,
    pressedModifiers: Set<string>
  ): boolean => {
    if (shortcut.key.toLowerCase() !== pressedKey.toLowerCase()) {
      return false;
    }

    const requiredModifiers = new Set(shortcut.modifiers);
    const actualModifiers = new Set(pressedModifiers);

    // Check if all required modifiers are pressed
    for (const modifier of requiredModifiers) {
      if (!actualModifiers.has(modifier)) {
        return false;
      }
    }

    // Check if any extra modifiers are pressed
    for (const modifier of actualModifiers) {
      if (!requiredModifiers.has(modifier)) {
        return false;
      }
    }

    return true;
  }, []);

  // Handle key down events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Ignore events from input elements
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key;
    const modifiers = new Set<string>();

    if (event.ctrlKey || event.metaKey) modifiers.add('ctrl');
    if (event.shiftKey) modifiers.add('shift');
    if (event.altKey) modifiers.add('alt');
    if (event.metaKey) modifiers.add('meta');

    pressedKeys.current.add(key);

    const effectiveShortcuts = getEffectiveShortcuts();

    for (const shortcut of effectiveShortcuts) {
      // Check context if specified
      if (shortcut.context && shortcut.context !== activeContext) {
        continue;
      }

      if (matchesShortcut(shortcut, key, modifiers)) {
        event.preventDefault();
        event.stopPropagation();
        onShortcutTrigger(shortcut.id);
        return;
      }
    }
  }, [disabled, activeContext, getEffectiveShortcuts, matchesShortcut, onShortcutTrigger]);

  // Handle key up events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    pressedKeys.current.delete(event.key);
  }, []);

  // Set up global event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: ShortcutDefinition) => {
    setShortcuts(prev => {
      const existing = prev.findIndex(s => s.id === shortcut.id);
      if (existing >= 0) {
        const newShortcuts = [...prev];
        newShortcuts[existing] = shortcut;
        return newShortcuts;
      }
      return [...prev, shortcut];
    });
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((shortcutId: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== shortcutId));
  }, []);

  // Customize a shortcut
  const customizeShortcut = useCallback((
    shortcutId: string,
    newKey: string,
    newModifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[]
  ) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (!shortcut || !shortcut.customizable) {
      return false;
    }

    const newCustomization: ShortcutCustomization = {
      shortcutId,
      key: newKey,
      modifiers: newModifiers,
    };

    const newCustomizations = customizations.filter(c => c.shortcutId !== shortcutId);
    newCustomizations.push(newCustomization);

    saveCustomizations(newCustomizations);
    return true;
  }, [shortcuts, customizations, saveCustomizations]);

  // Reset a shortcut to default
  const resetShortcut = useCallback((shortcutId: string) => {
    const newCustomizations = customizations.filter(c => c.shortcutId !== shortcutId);
    saveCustomizations(newCustomizations);
  }, [customizations, saveCustomizations]);

  // Reset all shortcuts to defaults
  const resetAllShortcuts = useCallback(() => {
    saveCustomizations([]);
  }, [saveCustomizations]);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: string) => {
    return getEffectiveShortcuts().filter(s => s.category === category);
  }, [getEffectiveShortcuts]);

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut: ShortcutDefinition) => {
    const effectiveShortcut = customizations.find(c => c.shortcutId === shortcut.id) || shortcut;
    const parts: string[] = [];

    if (effectiveShortcut.modifiers.includes('ctrl') || effectiveShortcut.modifiers.includes('meta')) {
      parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl');
    }
    if (effectiveShortcut.modifiers.includes('shift')) {
      parts.push('Shift');
    }
    if (effectiveShortcut.modifiers.includes('alt')) {
      parts.push('Alt');
    }

    parts.push(effectiveShortcut.key);

    return parts.join(' + ');
  }, [customizations]);

  return {
    shortcuts: getEffectiveShortcuts(),
    customizations,
    registerShortcut,
    unregisterShortcut,
    customizeShortcut,
    resetShortcut,
    resetAllShortcuts,
    getShortcutsByCategory,
    formatShortcut,
  };
};

const ShortcutManager = ({
  shortcuts,
  customizations,
  onShortcutTrigger,
  onCustomizationChange,
  activeContext,
  disabled,
}: ShortcutManagerProps) => {
  const {
    customizeShortcut,
    resetShortcut,
    resetAllShortcuts,
    getShortcutsByCategory,
    formatShortcut,
  } = useShortcutManager(onShortcutTrigger, activeContext, disabled);

  const handleCustomizationChange = useCallback((newCustomizations: ShortcutCustomization[]) => {
    onCustomizationChange(newCustomizations);
  }, [onCustomizationChange]);

  return (
    <div className={styles.shortcutManager}>
      {/* This component would render the shortcut management UI */}
      <div className={styles.categories}>
        {['tools', 'edit', 'layers', 'view', 'navigation', 'export', 'selection'].map(category => (
          <div key={category} className={styles.category}>
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <div className={styles.shortcuts}>
              {getShortcutsByCategory(category).map(shortcut => (
                <div key={shortcut.id} className={styles.shortcutItem}>
                  <div className={styles.shortcutInfo}>
                    <span className={styles.shortcutIcon}>{shortcut.icon}</span>
                    <span className={styles.shortcutDescription}>{shortcut.description}</span>
                  </div>
                  <div className={styles.shortcutKey}>
                    {formatShortcut(shortcut)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortcutManager;