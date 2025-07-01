'use client';

import { useCallback, useState } from 'react';

import type { Command } from '@/lib/commands';
import { DiffThumbnail, DiffThumbnailModal } from './DiffThumbnail';

import styles from './ActionHistoryPanel.module.css';

interface HistoryEntry {
  command: Command;
  executedAt: Date;
  undoneAt?: Date;
  thumbnail?: string;
  canvasState?: string;
}

interface ActionHistoryPanelProps {
  history: HistoryEntry[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges: boolean;
  onJumpToIndex: (index: number) => Promise<boolean>;
  onUndo: () => Promise<boolean>;
  onRedo: () => Promise<boolean>;
  onClearHistory: () => void;
  onMarkSaved: () => void;
  // Branch support (optional)
  currentBranch?: string;
  branches?: Array<{ id: string; name: string; entries: HistoryEntry[] }>;
  onCreateBranch?: (name: string) => string | null;
  onSwitchBranch?: (branchId: string) => boolean;
  onDeleteBranch?: (branchId: string) => boolean;
}

const ActionHistoryPanel = ({
  history,
  currentIndex,
  canUndo,
  canRedo,
  hasUnsavedChanges,
  onJumpToIndex,
  onUndo,
  onRedo,
  onClearHistory,
  onMarkSaved,
  currentBranch = 'main',
  branches = [],
  onCreateBranch,
  onSwitchBranch,
  onDeleteBranch,
}: ActionHistoryPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [filter, setFilter] = useState<'all' | 'object' | 'layer' | 'canvas'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [diffModalState, setDiffModalState] = useState<{
    isOpen: boolean;
    beforeIndex: number;
    afterIndex: number;
  }>({ isOpen: false, beforeIndex: -1, afterIndex: -1 });

  const getCommandIcon = (commandType: string): string => {
    switch (commandType) {
      case 'object_add':
        return '➕';
      case 'object_remove':
        return '➖';
      case 'object_move':
        return '↔️';
      case 'object_transform':
        return '🔄';
      case 'object_modify':
        return '✏️';
      case 'layer_create':
        return '📄';
      case 'layer_delete':
        return '🗑️';
      case 'layer_modify':
        return '⚙️';
      case 'layer_reorder':
        return '↕️';
      case 'canvas_clear':
        return '🧹';
      case 'canvas_background':
        return '🎨';
      case 'batch_operation':
        return '📦';
      default:
        return '•';
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return date.toLocaleDateString();
  };

  const filteredHistory = history.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'object') return entry.command.type.startsWith('object_');
    if (filter === 'layer') return entry.command.type.startsWith('layer_');
    if (filter === 'canvas') return entry.command.type.startsWith('canvas_');
    return true;
  });

  const handleJumpToIndex = useCallback(async (index: number) => {
    const success = await onJumpToIndex(index);
    if (!success) {
      console.warn('Failed to jump to history index:', index);
    }
  }, [onJumpToIndex]);

  const handleCreateBranch = useCallback(async () => {
    if (!newBranchName.trim() || !onCreateBranch) return;

    const branchId = onCreateBranch(newBranchName.trim());
    if (branchId) {
      setNewBranchName('');
      setIsCreatingBranch(false);
    }
  }, [newBranchName, onCreateBranch]);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Clear all history? This action cannot be undone.')) {
      onClearHistory();
    }
  }, [onClearHistory]);

  return (
    <div className={styles.historyPanel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <button
            type="button"
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse history' : 'Expand history'}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h3>History</h3>
          {hasUnsavedChanges && <span className={styles.unsavedIndicator}>●</span>}
        </div>

        <div className={styles.headerActions}>
          <span className={styles.historyCount}>
            {currentIndex + 1} / {history.length}
          </span>
          
          <button
            type="button"
            className={styles.actionButton}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 7v6h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.actionButton}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 7v6h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.controls}>
            <div className={styles.filterTabs}>
              {(['all', 'object', 'layer', 'canvas'] as const).map(filterType => (
                <button
                  key={filterType}
                  type="button"
                  className={`${styles.filterTab} ${filter === filterType ? styles.active : ''}`}
                  onClick={() => setFilter(filterType)}
                >
                  {filterType === 'all' ? 'All' : 
                   filterType === 'object' ? 'Objects' :
                   filterType === 'layer' ? 'Layers' : 'Canvas'}
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              {onCreateBranch && (
                <button
                  type="button"
                  className={styles.branchButton}
                  onClick={() => setShowBranches(!showBranches)}
                  title="Manage branches"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="18" cy="6" r="3" strokeWidth="2" />
                    <circle cx="6" cy="15" r="3" strokeWidth="2" />
                    <path d="M18 9a9 9 0 0 1-9 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                className={styles.saveButton}
                onClick={onMarkSaved}
                disabled={!hasUnsavedChanges}
                title="Mark as saved (Ctrl+S)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 21 17 13 7 13 7 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 3 7 8 15 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearHistory}
                title="Clear history"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {showBranches && onCreateBranch && (
            <div className={styles.branchPanel}>
              <div className={styles.branchHeader}>
                <h4>Branches</h4>
                <button
                  type="button"
                  className={styles.createBranchButton}
                  onClick={() => setIsCreatingBranch(!isCreatingBranch)}
                >
                  +
                </button>
              </div>

              {isCreatingBranch && (
                <div className={styles.branchCreator}>
                  <input
                    type="text"
                    placeholder="Branch name"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateBranch();
                      if (e.key === 'Escape') setIsCreatingBranch(false);
                    }}
                    autoFocus
                  />
                  <button type="button" onClick={handleCreateBranch}>Create</button>
                </div>
              )}

              <div className={styles.branchList}>
                {branches.map(branch => (
                  <div
                    key={branch.id}
                    className={`${styles.branchItem} ${branch.id === currentBranch ? styles.active : ''}`}
                  >
                    <button
                      type="button"
                      className={styles.branchName}
                      onClick={() => onSwitchBranch?.(branch.id)}
                    >
                      {branch.name}
                    </button>
                    <span className={styles.branchCount}>({branch.entries.length})</span>
                    {branch.id !== 'main' && onDeleteBranch && (
                      <button
                        type="button"
                        className={styles.deleteBranchButton}
                        onClick={() => onDeleteBranch(branch.id)}
                        title="Delete branch"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.historyList}>
            {filteredHistory.length === 0 ? (
              <div className={styles.emptyState}>
                No history entries
              </div>
            ) : (
              filteredHistory.map((entry, index) => {
                const isCurrentIndex = index === currentIndex;
                const isFuture = index > currentIndex;
                const isUndone = entry.undoneAt !== undefined;

                return (
                  <div
                    key={entry.command.id}
                    className={`${styles.historyEntry} ${
                      isCurrentIndex ? styles.current : ''
                    } ${isFuture ? styles.future : ''} ${isUndone ? styles.undone : ''}`}
                    onClick={() => handleJumpToIndex(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className={styles.entryIcon}>
                      {getCommandIcon(entry.command.type)}
                    </div>
                    
                    <div className={styles.entryContent}>
                      <div className={styles.entryDescription}>
                        {entry.command.description}
                      </div>
                      <div className={styles.entryMeta}>
                        <span className={styles.entryTime}>
                          {getRelativeTime(entry.executedAt)}
                        </span>
                        {isUndone && (
                          <span className={styles.undoneIndicator}>
                            (undone {getRelativeTime(entry.undoneAt!)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.entryActions}>
                      {isCurrentIndex && (
                        <span className={styles.currentIndicator}>●</span>
                      )}
                      {index > 0 && (
                        <button
                          type="button"
                          className={styles.diffButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDiffModalState({
                              isOpen: true,
                              beforeIndex: index - 1,
                              afterIndex: index,
                            });
                          }}
                          title="View changes"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {hoveredIndex !== null && hoveredIndex > 0 && (
            <div className={styles.diffPreview}>
              <DiffThumbnail
                beforeState={history[hoveredIndex - 1]}
                afterState={history[hoveredIndex]}
                size="small"
                showControls={false}
              />
            </div>
          )}
        </div>
      )}
      
      <DiffThumbnailModal
        isOpen={diffModalState.isOpen}
        onClose={() => setDiffModalState({ isOpen: false, beforeIndex: -1, afterIndex: -1 })}
        beforeState={diffModalState.beforeIndex >= 0 ? history[diffModalState.beforeIndex] : ''}
        afterState={diffModalState.afterIndex >= 0 ? history[diffModalState.afterIndex] : ''}
      />
    </div>
  );
};

export default ActionHistoryPanel;