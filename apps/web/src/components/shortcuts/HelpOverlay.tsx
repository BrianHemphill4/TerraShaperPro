'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ShortcutDefinition } from './ShortcutManager';

import styles from './HelpOverlay.module.css';

interface HelpOverlayProps {
  visible: boolean;
  shortcuts: ShortcutDefinition[];
  onClose: () => void;
  onStartTutorial: (tutorialId: string) => void;
  activeContext?: string;
}

interface TutorialInfo {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

const TUTORIALS: TutorialInfo[] = [
  {
    id: 'basic-navigation',
    title: 'Basic Navigation',
    description: 'Learn how to navigate the canvas, zoom, and pan',
    estimatedTime: '3 min',
    difficulty: 'beginner',
    icon: '🧭',
  },
  {
    id: 'drawing-tools',
    title: 'Drawing Tools',
    description: 'Master the essential drawing and design tools',
    estimatedTime: '5 min',
    difficulty: 'beginner',
    icon: '✏️',
  },
  {
    id: 'layer-management',
    title: 'Layer Management',
    description: 'Organize your design with layers and groups',
    estimatedTime: '4 min',
    difficulty: 'intermediate',
    icon: '📄',
  },
  {
    id: 'advanced-shortcuts',
    title: 'Advanced Shortcuts',
    description: 'Power-user shortcuts for efficient workflow',
    estimatedTime: '6 min',
    difficulty: 'advanced',
    icon: '⚡',
  },
];

const HelpOverlay = ({
  visible,
  shortcuts,
  onClose,
  onStartTutorial,
  activeContext,
}: HelpOverlayProps) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'tutorials'>('shortcuts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter shortcuts based on search and category
  const filteredShortcuts = shortcuts.filter(shortcut => {
    // Filter by context if specified
    if (shortcut.context && shortcut.context !== activeContext) {
      return false;
    }

    // Filter by category
    if (selectedCategory !== 'all' && shortcut.category !== selectedCategory) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.key.toLowerCase().includes(query) ||
        shortcut.action.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get unique categories
  const categories = ['all', ...new Set(shortcuts.map(s => s.category))];

  // Group shortcuts by category
  const shortcutsByCategory = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutDefinition[]>);

  // Format shortcut key combination for display
  const formatShortcut = useCallback((shortcut: ShortcutDefinition) => {
    const parts: string[] = [];

    if (shortcut.modifiers.includes('ctrl') || shortcut.modifiers.includes('meta')) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.modifiers.includes('shift')) {
      parts.push('⇧');
    }
    if (shortcut.modifiers.includes('alt')) {
      parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }

    // Format special keys
    let keyDisplay = shortcut.key;
    const specialKeys: Record<string, string> = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Delete': '⌦',
      'Backspace': '⌫',
      'Enter': '↵',
      'Escape': '⎋',
      'Tab': '⇥',
      'Space': '␣',
    };

    if (specialKeys[shortcut.key]) {
      keyDisplay = specialKeys[shortcut.key];
    } else if (shortcut.key.length === 1) {
      keyDisplay = shortcut.key.toUpperCase();
    }

    parts.push(keyDisplay);

    return parts.join(' ');
  }, []);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'shortcuts' ? styles.active : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              <span>⌨️</span>
              Keyboard Shortcuts
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'tutorials' ? styles.active : ''}`}
              onClick={() => setActiveTab('tutorials')}
            >
              <span>🎓</span>
              Interactive Tutorials
            </button>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            title="Close (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'shortcuts' && (
            <div className={styles.shortcutsTab}>
              <div className={styles.controls}>
                <div className={styles.searchContainer}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.categorySelect}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : 
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.shortcutsList}>
                {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                  <div key={category} className={styles.categorySection}>
                    <h3 className={styles.categoryTitle}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    <div className={styles.shortcuts}>
                      {categoryShortcuts.map(shortcut => (
                        <div key={shortcut.id} className={styles.shortcutItem}>
                          <div className={styles.shortcutInfo}>
                            <span className={styles.shortcutIcon}>{shortcut.icon}</span>
                            <div className={styles.shortcutDetails}>
                              <div className={styles.shortcutDescription}>
                                {shortcut.description}
                              </div>
                              {shortcut.context && (
                                <div className={styles.shortcutContext}>
                                  Context: {shortcut.context}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={styles.shortcutKeys}>
                            <kbd className={styles.shortcutKey}>
                              {formatShortcut(shortcut)}
                            </kbd>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredShortcuts.length === 0 && (
                  <div className={styles.emptyState}>
                    <span>🔍</span>
                    <p>No shortcuts found</p>
                    <small>Try adjusting your search or category filter</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tutorials' && (
            <div className={styles.tutorialsTab}>
              <div className={styles.tutorialsList}>
                {TUTORIALS.map(tutorial => (
                  <div key={tutorial.id} className={styles.tutorialCard}>
                    <div className={styles.tutorialIcon}>{tutorial.icon}</div>
                    <div className={styles.tutorialContent}>
                      <h4 className={styles.tutorialTitle}>{tutorial.title}</h4>
                      <p className={styles.tutorialDescription}>{tutorial.description}</p>
                      <div className={styles.tutorialMeta}>
                        <span className={`${styles.difficultyBadge} ${styles[tutorial.difficulty]}`}>
                          {tutorial.difficulty}
                        </span>
                        <span className={styles.tutorialTime}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {tutorial.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.startTutorialButton}
                      onClick={() => onStartTutorial(tutorial.id)}
                    >
                      Start Tutorial
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <small>
              Press <kbd>Ctrl + /</kbd> to toggle this help overlay
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpOverlay;