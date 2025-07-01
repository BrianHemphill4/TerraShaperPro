import type { Command } from './Command';

/**
 * Command history entry with metadata
 */
interface HistoryEntry {
  command: Command;
  executedAt: Date;
  undoneAt?: Date;
}

/**
 * History branch for supporting branching undo/redo
 */
interface HistoryBranch {
  id: string;
  name: string;
  entries: HistoryEntry[];
  parentBranchId?: string;
  branchPoint: number;
}

/**
 * Command history manager with advanced features
 */
export class CommandHistory {
  private branches: Map<string, HistoryBranch> = new Map();
  private currentBranchId: string = 'main';
  private currentIndex: number = -1;
  private savedIndex: number = -1;
  private listeners: Set<() => void> = new Set();
  
  constructor(
    private readonly maxHistorySize: number = 50,
    private readonly enableBranching: boolean = false
  ) {
    // Initialize main branch
    this.branches.set('main', {
      id: 'main',
      name: 'Main',
      entries: [],
      branchPoint: 0,
    });
  }
  
  /**
   * Execute a command and add to history
   */
  async execute(command: Command): Promise<void> {
    try {
      await command.execute();
      this.addToHistory(command);
    } catch (error) {
      console.error('Command execution failed:', error);
      throw error;
    }
  }
  
  /**
   * Add a command to history without executing
   */
  private addToHistory(command: Command): void {
    const currentBranch = this.getCurrentBranch();
    
    // Remove any entries after current index (for redo functionality)
    currentBranch.entries = currentBranch.entries.slice(0, this.currentIndex + 1);
    
    // Try to merge with previous command if possible
    const lastEntry = currentBranch.entries[currentBranch.entries.length - 1];
    if (lastEntry && command.canMerge?.(lastEntry.command)) {
      try {
        const mergedCommand = command.merge!(lastEntry.command);
        currentBranch.entries[currentBranch.entries.length - 1] = {
          command: mergedCommand,
          executedAt: new Date(),
        };
        this.notifyListeners();
        return;
      } catch (error) {
        console.warn('Command merge failed, adding as separate entry:', error);
      }
    }
    
    // Add new entry
    const entry: HistoryEntry = {
      command,
      executedAt: new Date(),
    };
    
    currentBranch.entries.push(entry);
    this.currentIndex = currentBranch.entries.length - 1;
    
    // Limit history size
    if (currentBranch.entries.length > this.maxHistorySize) {
      const removed = currentBranch.entries.shift();
      if (removed) {
        this.currentIndex--;
        if (this.savedIndex > 0) {
          this.savedIndex--;
        }
      }
    }
    
    this.notifyListeners();
  }
  
  /**
   * Undo the last command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) {
      return false;
    }
    
    const currentBranch = this.getCurrentBranch();
    const entry = currentBranch.entries[this.currentIndex];
    
    try {
      await entry.command.undo();
      entry.undoneAt = new Date();
      this.currentIndex--;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      throw error;
    }
  }
  
  /**
   * Redo the next command
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) {
      return false;
    }
    
    const currentBranch = this.getCurrentBranch();
    const nextIndex = this.currentIndex + 1;
    const entry = currentBranch.entries[nextIndex];
    
    try {
      await entry.command.execute();
      entry.undoneAt = undefined;
      this.currentIndex = nextIndex;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Redo failed:', error);
      throw error;
    }
  }
  
  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }
  
  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    const currentBranch = this.getCurrentBranch();
    return this.currentIndex < currentBranch.entries.length - 1;
  }
  
  /**
   * Get history entries for display
   */
  getHistory(): HistoryEntry[] {
    return [...this.getCurrentBranch().entries];
  }
  
  /**
   * Get current history state info
   */
  getHistoryInfo(): {
    size: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    hasUnsavedChanges: boolean;
    currentBranch: string;
    branches: string[];
  } {
    const currentBranch = this.getCurrentBranch();
    
    return {
      size: currentBranch.entries.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      hasUnsavedChanges: this.hasUnsavedChanges(),
      currentBranch: this.currentBranchId,
      branches: Array.from(this.branches.keys()),
    };
  }
  
  /**
   * Clear all history
   */
  clear(): void {
    this.branches.clear();
    this.branches.set('main', {
      id: 'main',
      name: 'Main',
      entries: [],
      branchPoint: 0,
    });
    this.currentBranchId = 'main';
    this.currentIndex = -1;
    this.savedIndex = -1;
    this.notifyListeners();
  }
  
  /**
   * Mark current state as saved
   */
  markSaved(): void {
    this.savedIndex = this.currentIndex;
    this.notifyListeners();
  }
  
  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.currentIndex !== this.savedIndex;
  }
  
  /**
   * Create a new branch from current state
   */
  createBranch(name: string): string {
    if (!this.enableBranching) {
      throw new Error('Branching is not enabled');
    }
    
    const branchId = `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentBranch = this.getCurrentBranch();
    
    const newBranch: HistoryBranch = {
      id: branchId,
      name,
      entries: [...currentBranch.entries.slice(0, this.currentIndex + 1)],
      parentBranchId: this.currentBranchId,
      branchPoint: this.currentIndex,
    };
    
    this.branches.set(branchId, newBranch);
    this.currentBranchId = branchId;
    this.notifyListeners();
    
    return branchId;
  }
  
  /**
   * Switch to a different branch
   */
  switchBranch(branchId: string): boolean {
    if (!this.branches.has(branchId)) {
      return false;
    }
    
    this.currentBranchId = branchId;
    const branch = this.getCurrentBranch();
    this.currentIndex = branch.entries.length - 1;
    this.notifyListeners();
    
    return true;
  }
  
  /**
   * Delete a branch
   */
  deleteBranch(branchId: string): boolean {
    if (branchId === 'main' || branchId === this.currentBranchId) {
      return false;
    }
    
    return this.branches.delete(branchId);
  }
  
  /**
   * Get all branches
   */
  getBranches(): HistoryBranch[] {
    return Array.from(this.branches.values());
  }
  
  /**
   * Jump to a specific history index
   */
  async jumpToIndex(index: number): Promise<boolean> {
    const currentBranch = this.getCurrentBranch();
    
    if (index < -1 || index >= currentBranch.entries.length) {
      return false;
    }
    
    try {
      // Undo back to the target index
      while (this.currentIndex > index && this.canUndo()) {
        await this.undo();
      }
      
      // Redo forward to the target index
      while (this.currentIndex < index && this.canRedo()) {
        await this.redo();
      }
      
      return this.currentIndex === index;
    } catch (error) {
      console.error('Failed to jump to history index:', error);
      return false;
    }
  }
  
  /**
   * Add a listener for history changes
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Export history for persistence
   */
  exportHistory(): Record<string, any> {
    const exportData: Record<string, any> = {
      branches: {},
      currentBranchId: this.currentBranchId,
      currentIndex: this.currentIndex,
      savedIndex: this.savedIndex,
      maxHistorySize: this.maxHistorySize,
      enableBranching: this.enableBranching,
    };
    
    for (const [branchId, branch] of this.branches) {
      exportData.branches[branchId] = {
        id: branch.id,
        name: branch.name,
        parentBranchId: branch.parentBranchId,
        branchPoint: branch.branchPoint,
        entries: branch.entries.map(entry => ({
          command: entry.command.getSerializableData?.() || {},
          executedAt: entry.executedAt.toISOString(),
          undoneAt: entry.undoneAt?.toISOString(),
        })),
      };
    }
    
    return exportData;
  }
  
  /**
   * Get current branch
   */
  private getCurrentBranch(): HistoryBranch {
    const branch = this.branches.get(this.currentBranchId);
    if (!branch) {
      throw new Error(`Branch ${this.currentBranchId} not found`);
    }
    return branch;
  }
  
  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('History listener error:', error);
      }
    });
  }
}