import { z } from 'zod';
import { StateError, ValidationError } from './errorTypes';

// Define state schemas for different stores
const annotationSchema = z.object({
  id: z.string(),
  type: z.enum(['polygon', 'rectangle', 'circle', 'point', 'brush']),
  points: z.array(z.object({
    x: z.number(),
    y: z.number()
  })),
  properties: z.record(z.any()).optional(),
  isVisible: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

const layerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['annotation', 'measurement', 'reference']),
  isVisible: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1),
  annotations: z.array(annotationSchema).default([]),
  order: z.number()
});

const canvasStateSchema = z.object({
  zoom: z.number().min(0.1).max(10).default(1),
  pan: z.object({
    x: z.number(),
    y: z.number()
  }).default({ x: 0, y: 0 }),
  rotation: z.number().min(0).max(360).default(0),
  selectedTool: z.string().nullable(),
  selectedLayer: z.string().nullable(),
  layers: z.array(layerSchema).default([]),
  history: z.object({
    past: z.array(z.any()).max(50).default([]),
    future: z.array(z.any()).max(50).default([])
  }).optional()
});

const projectStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  thumbnail: z.string().optional(),
  canvasState: canvasStateSchema,
  metadata: z.record(z.any()).optional(),
  lastSaved: z.string().datetime().optional(),
  version: z.number().default(1)
});

// State validation class
export class StateValidator {
  private static schemas = new Map<string, z.ZodSchema>([
    ['canvas', canvasStateSchema],
    ['project', projectStateSchema],
    ['layer', layerSchema],
    ['annotation', annotationSchema]
  ]);

  static validate<T>(type: string, data: unknown): T {
    const schema = this.schemas.get(type);
    
    if (!schema) {
      throw new ValidationError(`No schema defined for state type: ${type}`);
    }

    try {
      return schema.parse(data) as T;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Invalid ${type} state`, {
          context: {
            errors: error.errors,
            data
          },
          userMessage: `The ${type} data is corrupted or invalid.`
        });
      }
      throw error;
    }
  }

  static validatePartial<T>(type: string, data: unknown): Partial<T> {
    const schema = this.schemas.get(type);
    
    if (!schema) {
      throw new ValidationError(`No schema defined for state type: ${type}`);
    }

    try {
      return schema.partial().parse(data) as Partial<T>;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Invalid partial ${type} state`, {
          context: {
            errors: error.errors,
            data
          }
        });
      }
      throw error;
    }
  }

  static isValid(type: string, data: unknown): boolean {
    try {
      this.validate(type, data);
      return true;
    } catch {
      return false;
    }
  }

  static repair<T>(type: string, data: unknown): T | null {
    const schema = this.schemas.get(type);
    
    if (!schema) {
      return null;
    }

    try {
      // Try to parse with defaults
      if ('safeParse' in schema) {
        const result = schema.safeParse(data);
        if (result.success) {
          return result.data as T;
        }
      }

      // Try partial validation and fill in defaults
      const partial = this.validatePartial(type, data);
      const defaults = this.getDefaults(type);
      
      return { ...defaults, ...partial } as T;
    } catch {
      return null;
    }
  }

  private static getDefaults(type: string): any {
    switch (type) {
      case 'canvas':
        return {
          zoom: 1,
          pan: { x: 0, y: 0 },
          rotation: 0,
          selectedTool: null,
          selectedLayer: null,
          layers: [],
          history: { past: [], future: [] }
        };
      
      case 'project':
        return {
          id: crypto.randomUUID(),
          name: 'Untitled Project',
          canvasState: this.getDefaults('canvas'),
          version: 1
        };
      
      case 'layer':
        return {
          id: crypto.randomUUID(),
          name: 'New Layer',
          type: 'annotation',
          isVisible: true,
          isLocked: false,
          opacity: 1,
          annotations: [],
          order: 0
        };
      
      case 'annotation':
        return {
          id: crypto.randomUUID(),
          type: 'polygon',
          points: [],
          isVisible: true,
          isLocked: false,
          properties: {}
        };
      
      default:
        return {};
    }
  }

  static detectCorruption(state: any, type: string): string[] {
    const issues: string[] = [];

    try {
      this.validate(type, state);
    } catch (error) {
      if (error instanceof ValidationError && error.context?.errors) {
        const zodErrors = error.context.errors as z.ZodError['errors'];
        
        zodErrors.forEach((err: any) => {
          const path = err.path.join('.');
          const message = `${path}: ${err.message}`;
          issues.push(message);
        });
      }
    }

    // Additional corruption checks
    if (type === 'canvas') {
      if (state.layers?.length > 100) {
        issues.push('Excessive number of layers detected');
      }
      
      if (state.history?.past?.length > 1000) {
        issues.push('History size exceeds safe limits');
      }
    }

    if (type === 'project') {
      if (state.version && state.version < 1) {
        issues.push('Invalid project version');
      }
    }

    return issues;
  }

  static sanitize<T>(type: string, data: unknown): T {
    // Remove any potentially dangerous properties
    if (typeof data !== 'object' || data === null) {
      return this.getDefaults(type) as T;
    }

    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove any function properties
    const removeFunctions = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'function') {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeFunctions(obj[key]);
        }
      }
    };

    removeFunctions(sanitized);

    // Validate and repair
    const repaired = this.repair<T>(type, sanitized);
    
    if (!repaired) {
      throw new StateError(`Unable to sanitize ${type} state`, {
        context: { originalData: data }
      });
    }

    return repaired;
  }

  static registerSchema(type: string, schema: z.ZodSchema): void {
    this.schemas.set(type, schema);
  }
}