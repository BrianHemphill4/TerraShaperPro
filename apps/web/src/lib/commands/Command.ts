/**
 * Base command interface for implementing the command pattern
 * Used for comprehensive undo/redo functionality
 */
export interface Command {
  readonly id: string;
  readonly description: string;
  readonly timestamp: Date;
  readonly type: CommandType;
  
  /**
   * Execute the command
   */
  execute(): Promise<void> | void;
  
  /**
   * Undo the command
   */
  undo(): Promise<void> | void;
  
  /**
   * Check if this command can be merged with another
   * Used for optimization to reduce history size
   */
  canMerge?(other: Command): boolean;
  
  /**
   * Merge this command with another
   * Returns a new command that represents both operations
   */
  merge?(other: Command): Command;
  
  /**
   * Get serializable data for persistence
   */
  getSerializableData?(): Record<string, any>;
}

/**
 * Command types for categorization and filtering
 */
export type CommandType = 
  | 'object_add'
  | 'object_remove'
  | 'object_modify'
  | 'object_move'
  | 'object_transform'
  | 'layer_create'
  | 'layer_delete'
  | 'layer_modify'
  | 'layer_reorder'
  | 'canvas_clear'
  | 'canvas_background'
  | 'batch_operation';

/**
 * Base abstract command class with common functionality
 */
export abstract class BaseCommand implements Command {
  public readonly id: string;
  public readonly timestamp: Date;
  
  constructor(
    public readonly type: CommandType,
    public readonly description: string,
    id?: string
  ) {
    this.id = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
  
  abstract execute(): Promise<void> | void;
  abstract undo(): Promise<void> | void;
  
  canMerge(other: Command): boolean {
    return false; // Default: no merging
  }
  
  merge(other: Command): Command {
    throw new Error('Merge not implemented for this command type');
  }
  
  getSerializableData(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Composite command for batch operations
 */
export class BatchCommand extends BaseCommand {
  constructor(
    public readonly commands: Command[],
    description: string = 'Batch operation'
  ) {
    super('batch_operation', description);
  }
  
  async execute(): Promise<void> {
    for (const command of this.commands) {
      await command.execute();
    }
  }
  
  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      await this.commands[i].undo();
    }
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      commands: this.commands.map(cmd => cmd.getSerializableData()),
    };
  }
}

/**
 * No-op command for testing or placeholder operations
 */
export class NoOpCommand extends BaseCommand {
  constructor(description: string = 'No operation') {
    super('object_modify', description);
  }
  
  execute(): void {
    // No operation
  }
  
  undo(): void {
    // No operation
  }
}