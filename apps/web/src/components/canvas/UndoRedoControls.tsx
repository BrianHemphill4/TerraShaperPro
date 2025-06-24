'use client';

import styles from './UndoRedoControls.module.css';

type UndoRedoControlsProps = {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize?: number;
  currentIndex?: number;
};

const UndoRedoControls = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  historySize,
  currentIndex,
}: UndoRedoControlsProps) => {
  return (
    <div className={styles.undoRedoControls}>
      <button
        type="button"
        className={styles.controlButton}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className={styles.controlButton}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {historySize !== undefined && currentIndex !== undefined && (
        <span className={styles.historyInfo}>
          {currentIndex + 1} / {historySize}
        </span>
      )}
    </div>
  );
};

export default UndoRedoControls;
