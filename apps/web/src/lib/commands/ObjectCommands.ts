import { fabric } from 'fabric';
import { BaseCommand, type CommandType } from './Command';

/**
 * Command for adding objects to canvas
 */
export class ObjectAddCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly object: fabric.Object,
    private readonly layerId?: string
  ) {
    super('object_add', `Add ${object.type || 'object'}`);
  }
  
  execute(): void {
    if (this.layerId) {
      (this.object as any).layerId = this.layerId;
    }
    this.canvas.add(this.object);
    this.canvas.setActiveObject(this.object);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.canvas.remove(this.object);
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      objectData: this.object.toObject(['id', 'layerId', 'material', 'plantId', 'plantName']),
      objectType: this.object.type,
      layerId: this.layerId,
    };
  }
}

/**
 * Command for removing objects from canvas
 */
export class ObjectRemoveCommand extends BaseCommand {
  private objectIndex: number = -1;
  
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly object: fabric.Object
  ) {
    super('object_remove', `Remove ${object.type || 'object'}`);
  }
  
  execute(): void {
    this.objectIndex = this.canvas.getObjects().indexOf(this.object);
    this.canvas.remove(this.object);
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }
  
  undo(): void {
    if (this.objectIndex >= 0) {
      this.canvas.insertAt(this.object, this.objectIndex);
    } else {
      this.canvas.add(this.object);
    }
    this.canvas.setActiveObject(this.object);
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      objectData: this.object.toObject(['id', 'layerId', 'material', 'plantId', 'plantName']),
      objectType: this.object.type,
      objectIndex: this.objectIndex,
    };
  }
}

/**
 * Command for moving objects
 */
export class ObjectMoveCommand extends BaseCommand {
  private startTime: number = Date.now();
  private readonly MERGE_TIME_WINDOW = 1000; // 1 second
  
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly object: fabric.Object,
    private readonly previousPosition: { left: number; top: number },
    private readonly newPosition: { left: number; top: number }
  ) {
    super('object_move', `Move ${object.type || 'object'}`);
  }
  
  execute(): void {
    this.object.set({
      left: this.newPosition.left,
      top: this.newPosition.top,
    });
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.object.set({
      left: this.previousPosition.left,
      top: this.previousPosition.top,
    });
    this.canvas.renderAll();
  }
  
  canMerge(other: ObjectMoveCommand): boolean {
    if (!(other instanceof ObjectMoveCommand)) {
      return false;
    }
    
    const timeDiff = Math.abs(this.startTime - other.startTime);
    const isSameObject = other.object === this.object;
    const isWithinTimeWindow = timeDiff < this.MERGE_TIME_WINDOW;
    
    return isSameObject && isWithinTimeWindow;
  }
  
  merge(other: ObjectMoveCommand): ObjectMoveCommand {
    if (!this.canMerge(other)) {
      throw new Error('Cannot merge these move commands');
    }
    
    // Create a new command that represents the combined movement
    return new ObjectMoveCommand(
      this.canvas,
      this.object,
      this.previousPosition,
      other.newPosition
    );
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      objectId: (this.object as any).id,
      previousPosition: this.previousPosition,
      newPosition: this.newPosition,
    };
  }
}

/**
 * Command for transforming objects (scale, rotate, skew)
 */
export class ObjectTransformCommand extends BaseCommand {
  private startTime: number = Date.now();
  private readonly MERGE_TIME_WINDOW = 1000; // 1 second
  
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly object: fabric.Object,
    private readonly previousTransform: {
      scaleX: number;
      scaleY: number;
      angle: number;
      skewX: number;
      skewY: number;
    },
    private readonly newTransform: {
      scaleX: number;
      scaleY: number;
      angle: number;
      skewX: number;
      skewY: number;
    }
  ) {
    super('object_transform', `Transform ${object.type || 'object'}`);
  }
  
  execute(): void {
    this.object.set(this.newTransform);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.object.set(this.previousTransform);
    this.canvas.renderAll();
  }
  
  canMerge(other: ObjectTransformCommand): boolean {
    if (!(other instanceof ObjectTransformCommand)) {
      return false;
    }
    
    const timeDiff = Math.abs(this.startTime - other.startTime);
    const isSameObject = other.object === this.object;
    const isWithinTimeWindow = timeDiff < this.MERGE_TIME_WINDOW;
    
    return isSameObject && isWithinTimeWindow;
  }
  
  merge(other: ObjectTransformCommand): ObjectTransformCommand {
    if (!this.canMerge(other)) {
      throw new Error('Cannot merge these transform commands');
    }
    
    return new ObjectTransformCommand(
      this.canvas,
      this.object,
      this.previousTransform,
      other.newTransform
    );
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      objectId: (this.object as any).id,
      previousTransform: this.previousTransform,
      newTransform: this.newTransform,
    };
  }
}

/**
 * Command for modifying object properties
 */
export class ObjectModifyCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly object: fabric.Object,
    private readonly previousProperties: Record<string, any>,
    private readonly newProperties: Record<string, any>,
    description?: string
  ) {
    super('object_modify', description || `Modify ${object.type || 'object'}`);
  }
  
  execute(): void {
    this.object.set(this.newProperties);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.object.set(this.previousProperties);
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      objectId: (this.object as any).id,
      previousProperties: this.previousProperties,
      newProperties: this.newProperties,
    };
  }
}

/**
 * Command for changing object layer assignment
 */
export class ObjectLayerChangeCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly object: fabric.Object,
    private readonly previousLayerId: string,
    private readonly newLayerId: string
  ) {
    super('object_modify', `Move ${object.type || 'object'} to layer`);
  }
  
  execute(): void {
    (this.object as any).layerId = this.newLayerId;
    this.canvas.renderAll();
  }
  
  undo(): void {
    (this.object as any).layerId = this.previousLayerId;
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      objectId: (this.object as any).id,
      previousLayerId: this.previousLayerId,
      newLayerId: this.newLayerId,
    };
  }
}

/**
 * Command for duplicating objects
 */
export class ObjectDuplicateCommand extends BaseCommand {
  private duplicatedObject?: fabric.Object;
  
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly sourceObject: fabric.Object,
    private readonly offset: { x: number; y: number } = { x: 20, y: 20 }
  ) {
    super('object_add', `Duplicate ${sourceObject.type || 'object'}`);
  }
  
  async execute(): Promise<void> {
    return new Promise((resolve) => {
      this.sourceObject.clone((cloned: fabric.Object) => {
        this.duplicatedObject = cloned;
        
        // Apply offset
        cloned.set({
          left: (cloned.left || 0) + this.offset.x,
          top: (cloned.top || 0) + this.offset.y,
        });
        
        // Copy layer assignment if exists
        const sourceLayerId = (this.sourceObject as any).layerId;
        if (sourceLayerId) {
          (cloned as any).layerId = sourceLayerId;
        }
        
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.renderAll();
        
        resolve();
      }, ['id', 'layerId', 'material', 'plantId', 'plantName']);
    });
  }
  
  undo(): void {
    if (this.duplicatedObject) {
      this.canvas.remove(this.duplicatedObject);
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      sourceObjectId: (this.sourceObject as any).id,
      offset: this.offset,
      duplicatedObjectData: this.duplicatedObject?.toObject(['id', 'layerId', 'material', 'plantId', 'plantName']),
    };
  }
}