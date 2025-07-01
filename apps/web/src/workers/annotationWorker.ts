// Annotation processing worker
import type { VirtualObject } from '../lib/canvas/virtualizedCanvas';

interface WorkerMessage {
  id: string;
  type: 'process' | 'analyze' | 'simplify' | 'cluster' | 'export';
  data: any;
}

interface WorkerResponse {
  id: string;
  type: string;
  result?: any;
  error?: string;
  metrics?: {
    duration: number;
    objectsProcessed: number;
  };
}

// Douglas-Peucker algorithm for path simplification
function simplifyPath(points: Array<{x: number; y: number}>, tolerance: number): Array<{x: number; y: number}> {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;

  // Find the point with maximum distance
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPath(points.slice(maxIndex), tolerance);
    return left.slice(0, -1).concat(right);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function perpendicularDistance(
  point: {x: number; y: number},
  lineStart: {x: number; y: number},
  lineEnd: {x: number; y: number}
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + 
      Math.pow(point.y - lineStart.y, 2)
    );
  }

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
  const closestPoint = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy
  };

  return Math.sqrt(
    Math.pow(point.x - closestPoint.x, 2) + 
    Math.pow(point.y - closestPoint.y, 2)
  );
}

// Clustering algorithm
function clusterAnnotations(
  annotations: VirtualObject[],
  threshold: number
): Array<{center: {x: number; y: number}; items: VirtualObject[]}> {
  const clusters: Array<{center: {x: number; y: number}; items: VirtualObject[]}> = [];

  for (const annotation of annotations) {
    const center = {
      x: annotation.bounds.x + annotation.bounds.width / 2,
      y: annotation.bounds.y + annotation.bounds.height / 2
    };

    let added = false;
    for (const cluster of clusters) {
      const distance = Math.sqrt(
        Math.pow(center.x - cluster.center.x, 2) +
        Math.pow(center.y - cluster.center.y, 2)
      );

      if (distance < threshold) {
        cluster.items.push(annotation);
        // Update cluster center
        cluster.center.x = cluster.items.reduce((sum, item) => 
          sum + item.bounds.x + item.bounds.width / 2, 0) / cluster.items.length;
        cluster.center.y = cluster.items.reduce((sum, item) => 
          sum + item.bounds.y + item.bounds.height / 2, 0) / cluster.items.length;
        added = true;
        break;
      }
    }

    if (!added) {
      clusters.push({
        center,
        items: [annotation]
      });
    }
  }

  return clusters;
}

// Analyze annotation complexity
function analyzeComplexity(annotation: any): {
  complexity: 'low' | 'medium' | 'high';
  points: number;
  area: number;
  perimeter: number;
} {
  let points = 0;
  let area = 0;
  let perimeter = 0;

  if (annotation.type === 'polygon' && annotation.points) {
    points = annotation.points.length;
    
    // Calculate area using shoelace formula
    for (let i = 0; i < points; i++) {
      const j = (i + 1) % points;
      area += annotation.points[i].x * annotation.points[j].y;
      area -= annotation.points[j].x * annotation.points[i].y;
      
      // Calculate perimeter
      perimeter += Math.sqrt(
        Math.pow(annotation.points[j].x - annotation.points[i].x, 2) +
        Math.pow(annotation.points[j].y - annotation.points[i].y, 2)
      );
    }
    area = Math.abs(area) / 2;
  } else if (annotation.type === 'rectangle') {
    points = 4;
    area = annotation.width * annotation.height;
    perimeter = 2 * (annotation.width + annotation.height);
  } else if (annotation.type === 'circle') {
    points = 1;
    area = Math.PI * annotation.radius * annotation.radius;
    perimeter = 2 * Math.PI * annotation.radius;
  }

  const complexity = points > 20 ? 'high' : points > 8 ? 'medium' : 'low';

  return { complexity, points, area, perimeter };
}

// Export annotations to different formats
function exportAnnotations(annotations: any[], format: 'geojson' | 'svg' | 'json'): string {
  switch (format) {
    case 'geojson':
      return JSON.stringify({
        type: 'FeatureCollection',
        features: annotations.map(ann => ({
          type: 'Feature',
          geometry: convertToGeoJSON(ann),
          properties: {
            id: ann.id,
            type: ann.type,
            ...ann.metadata
          }
        }))
      });

    case 'svg':
      const svgElements = annotations.map(ann => {
        switch (ann.type) {
          case 'rectangle':
            return `<rect x="${ann.x}" y="${ann.y}" width="${ann.width}" height="${ann.height}" fill="${ann.color || 'none'}" stroke="${ann.stroke || 'black'}"/>`;
          case 'circle':
            return `<circle cx="${ann.x}" cy="${ann.y}" r="${ann.radius}" fill="${ann.color || 'none'}" stroke="${ann.stroke || 'black'}"/>`;
          case 'polygon':
            const points = ann.points.map((p: any) => `${p.x},${p.y}`).join(' ');
            return `<polygon points="${points}" fill="${ann.color || 'none'}" stroke="${ann.stroke || 'black'}"/>`;
          default:
            return '';
        }
      }).join('\n');
      
      return `<svg xmlns="http://www.w3.org/2000/svg">\n${svgElements}\n</svg>`;

    case 'json':
    default:
      return JSON.stringify(annotations, null, 2);
  }
}

function convertToGeoJSON(annotation: any): any {
  switch (annotation.type) {
    case 'point':
      return {
        type: 'Point',
        coordinates: [annotation.x, annotation.y]
      };
    case 'rectangle':
      return {
        type: 'Polygon',
        coordinates: [[
          [annotation.x, annotation.y],
          [annotation.x + annotation.width, annotation.y],
          [annotation.x + annotation.width, annotation.y + annotation.height],
          [annotation.x, annotation.y + annotation.height],
          [annotation.x, annotation.y]
        ]]
      };
    case 'polygon':
      return {
        type: 'Polygon',
        coordinates: [annotation.points.map((p: any) => [p.x, p.y])]
      };
    default:
      return null;
  }
}

// Message handler
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = event.data;
  const startTime = performance.now();
  
  try {
    let result: any;
    let objectsProcessed = 0;

    switch (type) {
      case 'process':
        // Process annotations (e.g., validation, normalization)
        result = data.annotations.map((ann: any) => {
          objectsProcessed++;
          return {
            ...ann,
            valid: validateAnnotation(ann),
            normalized: normalizeAnnotation(ann)
          };
        });
        break;

      case 'analyze':
        // Analyze annotation complexity
        result = data.annotations.map((ann: any) => {
          objectsProcessed++;
          return {
            id: ann.id,
            analysis: analyzeComplexity(ann)
          };
        });
        break;

      case 'simplify':
        // Simplify complex paths
        result = data.annotations.map((ann: any) => {
          objectsProcessed++;
          if (ann.type === 'polygon' && ann.points) {
            return {
              ...ann,
              points: simplifyPath(ann.points, data.tolerance || 1)
            };
          }
          return ann;
        });
        break;

      case 'cluster':
        // Cluster nearby annotations
        result = clusterAnnotations(data.annotations, data.threshold || 50);
        objectsProcessed = data.annotations.length;
        break;

      case 'export':
        // Export to different formats
        result = exportAnnotations(data.annotations, data.format || 'json');
        objectsProcessed = data.annotations.length;
        break;

      default:
        throw new Error(`Unknown operation: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      type,
      result,
      metrics: {
        duration: performance.now() - startTime,
        objectsProcessed
      }
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(response);
  }
});

// Helper functions
function validateAnnotation(annotation: any): boolean {
  if (!annotation.type || !annotation.id) return false;

  switch (annotation.type) {
    case 'rectangle':
      return annotation.x !== undefined && 
             annotation.y !== undefined &&
             annotation.width > 0 &&
             annotation.height > 0;
    case 'circle':
      return annotation.x !== undefined &&
             annotation.y !== undefined &&
             annotation.radius > 0;
    case 'polygon':
      return Array.isArray(annotation.points) &&
             annotation.points.length >= 3;
    default:
      return false;
  }
}

function normalizeAnnotation(annotation: any): any {
  const normalized = { ...annotation };

  // Ensure bounds are calculated
  if (!normalized.bounds) {
    switch (normalized.type) {
      case 'rectangle':
        normalized.bounds = {
          x: normalized.x,
          y: normalized.y,
          width: normalized.width,
          height: normalized.height
        };
        break;
      case 'circle':
        normalized.bounds = {
          x: normalized.x - normalized.radius,
          y: normalized.y - normalized.radius,
          width: normalized.radius * 2,
          height: normalized.radius * 2
        };
        break;
      case 'polygon':
        if (normalized.points && normalized.points.length > 0) {
          const xs = normalized.points.map((p: any) => p.x);
          const ys = normalized.points.map((p: any) => p.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);
          
          normalized.bounds = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          };
        }
        break;
    }
  }

  return normalized;
}

// Export for TypeScript
export type { WorkerMessage, WorkerResponse };