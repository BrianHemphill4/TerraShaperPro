import { fabric } from 'fabric';
import { BaseCommand } from './Command';

/**
 * Layer interface for command operations
 */
export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  objects: fabric.Object[];
  order: number;
  parentId?: string;
  type: 'layer' | 'group';
}

/**
 * Command for creating a new layer
 */
export class LayerCreateCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly layerData: LayerData,
    private readonly onLayerCreate: (layer: LayerData) => void
  ) {
    super('layer_create', `Create layer "${layerData.name}"`);
  }
  
  execute(): void {
    this.onLayerCreate(this.layerData);
    this.canvas.renderAll();
  }
  
  undo(): void {
    // This would need to be implemented with a callback to remove the layer
    // from the layer management system
    console.warn('Layer deletion not implemented in undo');
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      layerData: {
        ...this.layerData,
        objects: this.layerData.objects.map(obj => 
          obj.toObject(['id', 'layerId', 'material', 'plantId', 'plantName'])
        ),
      },
    };
  }
}

/**
 * Command for deleting a layer
 */
export class LayerDeleteCommand extends BaseCommand {
  private objectsToRestore: fabric.Object[] = [];
  
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly layerData: LayerData,
    private readonly onLayerDelete: (layerId: string) => void,
    private readonly onLayerRestore: (layer: LayerData) => void
  ) {
    super('layer_delete', `Delete layer "${layerData.name}"`);
  }
  
  execute(): void {
    // Store objects that will be moved to another layer
    this.objectsToRestore = [...this.layerData.objects];
    this.onLayerDelete(this.layerData.id);
    this.canvas.renderAll();
  }
  
  undo(): void {
    // Restore the layer
    const restoredLayer: LayerData = {
      ...this.layerData,
      objects: this.objectsToRestore,
    };
    
    this.onLayerRestore(restoredLayer);
    
    // Reassign objects back to the layer
    this.objectsToRestore.forEach(obj => {
      (obj as any).layerId = this.layerData.id;
    });
    
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      layerData: {
        ...this.layerData,
        objects: this.layerData.objects.map(obj => 
          obj.toObject(['id', 'layerId', 'material', 'plantId', 'plantName'])
        ),
      },
    };
  }
}

/**
 * Command for modifying layer properties
 */
export class LayerModifyCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly layerId: string,
    private readonly previousProperties: Partial<LayerData>,
    private readonly newProperties: Partial<LayerData>,
    private readonly onLayerModify: (layerId: string, properties: Partial<LayerData>) => void
  ) {
    super('layer_modify', `Modify layer properties`);
  }
  
  execute(): void {
    this.onLayerModify(this.layerId, this.newProperties);
    this.applyPropertiesToObjects(this.newProperties);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.onLayerModify(this.layerId, this.previousProperties);
    this.applyPropertiesToObjects(this.previousProperties);
    this.canvas.renderAll();
  }
  
  private applyPropertiesToObjects(properties: Partial<LayerData>): void {
    const layerObjects = this.canvas.getObjects().filter(obj => 
      (obj as any).layerId === this.layerId
    );
    
    layerObjects.forEach(obj => {
      if (properties.visible !== undefined) {
        obj.set('visible', properties.visible);
      }
      
      if (properties.locked !== undefined) {
        obj.set({
          selectable: !properties.locked,
          evented: !properties.locked,
        });
      }
      
      if (properties.opacity !== undefined) {
        obj.set('opacity', properties.opacity);
      }
    });
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      layerId: this.layerId,
      previousProperties: this.previousProperties,
      newProperties: this.newProperties,
    };
  }
}

/**
 * Command for reordering layers
 */
export class LayerReorderCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly layerId: string,
    private readonly previousOrder: number,
    private readonly newOrder: number,
    private readonly onLayerReorder: (layerId: string, newOrder: number) => void
  ) {
    super('layer_reorder', `Reorder layer`);
  }
  
  execute(): void {
    this.onLayerReorder(this.layerId, this.newOrder);
    this.reorderCanvasObjects(this.newOrder);
  }
  
  undo(): void {
    this.onLayerReorder(this.layerId, this.previousOrder);
    this.reorderCanvasObjects(this.previousOrder);
  }
  
  private reorderCanvasObjects(order: number): void {
    const layerObjects = this.canvas.getObjects().filter(obj => 
      (obj as any).layerId === this.layerId
    );
    
    // Remove objects from canvas
    layerObjects.forEach(obj => this.canvas.remove(obj));
    
    // Get all objects and sort by layer order
    const allObjects = this.canvas.getObjects();
    const sortedObjects: { obj: fabric.Object; layerOrder: number }[] = [];
    
    allObjects.forEach(obj => {
      const objLayerId = (obj as any).layerId || 'default';
      // This would need to get the actual layer order from the layer management system
      const layerOrder = objLayerId === this.layerId ? order : 0;
      sortedObjects.push({ obj, layerOrder });
    });
    
    // Sort by layer order and re-add to canvas
    sortedObjects.sort((a, b) => a.layerOrder - b.layerOrder);
    
    // Clear canvas (except grid/background objects)
    const objectsToKeep = this.canvas.getObjects().filter(obj => 
      (obj as any).evented === false
    );
    this.canvas.clear();
    objectsToKeep.forEach(obj => this.canvas.add(obj));
    
    // Add objects back in correct order
    sortedObjects.forEach(({ obj }) => this.canvas.add(obj));
    layerObjects.forEach(obj => this.canvas.add(obj));
    
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      layerId: this.layerId,
      previousOrder: this.previousOrder,
      newOrder: this.newOrder,
    };
  }
}

/**
 * Command for grouping layers
 */
export class LayerGroupCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly layerIds: string[],
    private readonly groupName: string,
    private readonly onLayerGroup: (layerIds: string[], groupName: string) => LayerData
  ) {
    super('layer_modify', `Group layers into "${groupName}"`);
  }
  
  execute(): void {
    this.onLayerGroup(this.layerIds, this.groupName);
    this.canvas.renderAll();
  }
  
  undo(): void {
    // This would need to be implemented with a callback to ungroup layers
    console.warn('Layer ungrouping not implemented in undo');
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      layerIds: this.layerIds,
      groupName: this.groupName,
    };
  }
}

/**
 * Command for ungrouping layers
 */
export class LayerUngroupCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly groupId: string,
    private readonly childLayerIds: string[],
    private readonly onLayerUngroup: (groupId: string) => void,
    private readonly onLayerGroup: (layerIds: string[], groupName: string) => LayerData
  ) {
    super('layer_modify', `Ungroup layer group`);
  }
  
  execute(): void {
    this.onLayerUngroup(this.groupId);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.onLayerGroup(this.childLayerIds, 'Restored Group');
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      groupId: this.groupId,
      childLayerIds: this.childLayerIds,
    };
  }
}

/**
 * Command for bulk layer operations
 */
export class LayerBulkOperationCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly layerIds: string[],
    private readonly operation: 'show' | 'hide' | 'lock' | 'unlock' | 'delete',
    private readonly previousStates: Map<string, Partial<LayerData>>,
    private readonly onLayerBulkOperation: (layerIds: string[], operation: string, previousStates: Map<string, Partial<LayerData>>) => void
  ) {
    super('layer_modify', `Bulk ${operation} ${layerIds.length} layers`);
  }
  
  execute(): void {
    this.onLayerBulkOperation(this.layerIds, this.operation, this.previousStates);
    this.canvas.renderAll();
  }
  
  undo(): void {
    // Restore previous states
    this.layerIds.forEach(layerId => {
      const previousState = this.previousStates.get(layerId);
      if (previousState) {
        this.applyLayerProperties(layerId, previousState);
      }
    });
    this.canvas.renderAll();
  }
  
  private applyLayerProperties(layerId: string, properties: Partial<LayerData>): void {
    const layerObjects = this.canvas.getObjects().filter(obj => 
      (obj as any).layerId === layerId
    );
    
    layerObjects.forEach(obj => {
      if (properties.visible !== undefined) {
        obj.set('visible', properties.visible);
      }
      
      if (properties.locked !== undefined) {
        obj.set({
          selectable: !properties.locked,
          evented: !properties.locked,
        });
      }
      
      if (properties.opacity !== undefined) {
        obj.set('opacity', properties.opacity);
      }
    });
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      layerIds: this.layerIds,
      operation: this.operation,
      previousStates: Object.fromEntries(this.previousStates),
    };
  }
}