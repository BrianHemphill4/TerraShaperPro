import type { Annotation } from '../types/prompt.types';

type PlantInfo = {
  scientificName: string;
  commonName: string;
  description: string;
  visualCharacteristics: string;
}

export class AnnotationConverter {
  private plantDatabase: Map<string, PlantInfo>;

  constructor() {
    this.plantDatabase = new Map();
    this.initializePlantDatabase();
  }

  convertAnnotationsToDescription(annotations: Annotation[]): string {
    const grouped = this.groupAnnotationsByType(annotations);
    const descriptions: string[] = [];

    if (grouped.plant.length > 0) {
      descriptions.push(this.describePlants(grouped.plant));
    }

    if (grouped.hardscape.length > 0) {
      descriptions.push(this.describeHardscape(grouped.hardscape));
    }

    if (grouped.feature.length > 0) {
      descriptions.push(this.describeFeatures(grouped.feature));
    }

    if (grouped.lighting.length > 0) {
      descriptions.push(this.describeLighting(grouped.lighting));
    }

    if (grouped.water.length > 0) {
      descriptions.push(this.describeWater(grouped.water));
    }

    return descriptions.join(', ');
  }

  private groupAnnotationsByType(annotations: Annotation[]): Record<string, Annotation[]> {
    return annotations.reduce((acc, annotation) => {
      if (!acc[annotation.type]) {
        acc[annotation.type] = [];
      }
      acc[annotation.type].push(annotation);
      return acc;
    }, {} as Record<string, Annotation[]>);
  }

  private describePlants(plants: Annotation[]): string {
    const plantGroups = this.groupPlantsByArea(plants);
    const descriptions: string[] = [];

    for (const [area, plantsInArea] of Object.entries(plantGroups)) {
      const plantNames = plantsInArea.map(p => {
        const info = this.plantDatabase.get(p.name);
        return info ? `${info.commonName} (${info.visualCharacteristics})` : p.name;
      });

      descriptions.push(`${area} area with ${plantNames.join(', ')}`);
    }

    return descriptions.join(', ');
  }

  private groupPlantsByArea(plants: Annotation[]): Record<string, Annotation[]> {
    const areas: Record<string, Annotation[]> = {
      foreground: [],
      midground: [],
      background: [],
    };

    plants.forEach(plant => {
      const relativeY = plant.position.y;
      if (relativeY > 0.7) {
        areas.foreground.push(plant);
      } else if (relativeY > 0.3) {
        areas.midground.push(plant);
      } else {
        areas.background.push(plant);
      }
    });

    return areas;
  }

  private describeHardscape(hardscapes: Annotation[]): string {
    const elements = hardscapes.map(h => {
      const material = h.attributes?.material || 'natural stone';
      const pattern = h.attributes?.pattern || 'irregular';
      return `${h.name} made of ${material} in ${pattern} pattern`;
    });

    return `hardscape elements including ${elements.join(', ')}`;
  }

  private describeFeatures(features: Annotation[]): string {
    const elements = features.map(f => {
      const style = f.attributes?.style || 'contemporary';
      return `${style} ${f.name}`;
    });

    return `landscape features including ${elements.join(', ')}`;
  }

  private describeLighting(lighting: Annotation[]): string {
    const types = lighting.map(l => {
      const type = l.attributes?.type || 'accent';
      const placement = l.attributes?.placement || 'strategic';
      return `${type} lighting with ${placement} placement`;
    });

    return `professional landscape lighting with ${types.join(', ')}`;
  }

  private describeWater(water: Annotation[]): string {
    const features = water.map(w => {
      const style = w.attributes?.style || 'natural';
      const flow = w.attributes?.flow || 'gentle';
      return `${style} ${w.name} with ${flow} water movement`;
    });

    return `water features including ${features.join(', ')}`;
  }

  private initializePlantDatabase(): void {
    const plants: PlantInfo[] = [
      {
        scientificName: 'Acer palmatum',
        commonName: 'Japanese Maple',
        description: 'Ornamental tree with delicate leaves',
        visualCharacteristics: 'graceful branching structure with vibrant red-orange foliage',
      },
      {
        scientificName: 'Lavandula angustifolia',
        commonName: 'English Lavender',
        description: 'Fragrant perennial herb',
        visualCharacteristics: 'purple flower spikes above silvery-green foliage',
      },
      {
        scientificName: 'Festuca glauca',
        commonName: 'Blue Fescue',
        description: 'Ornamental grass',
        visualCharacteristics: 'compact blue-gray tufted grass',
      },
      {
        scientificName: 'Hydrangea macrophylla',
        commonName: 'Bigleaf Hydrangea',
        description: 'Flowering shrub',
        visualCharacteristics: 'large round flower clusters in pink or blue',
      },
      {
        scientificName: 'Buxus sempervirens',
        commonName: 'Common Boxwood',
        description: 'Evergreen shrub',
        visualCharacteristics: 'dense green foliage perfect for hedging',
      },
    ];

    plants.forEach(plant => {
      this.plantDatabase.set(plant.commonName, plant);
      this.plantDatabase.set(plant.scientificName, plant);
    });
  }

  enrichAnnotationWithPlantInfo(annotation: Annotation): Annotation {
    if (annotation.type !== 'plant') {
      return annotation;
    }

    const plantInfo = this.plantDatabase.get(annotation.name);
    if (!plantInfo) {
      return annotation;
    }

    return {
      ...annotation,
      attributes: {
        ...annotation.attributes,
        scientificName: plantInfo.scientificName,
        commonName: plantInfo.commonName,
        visualCharacteristics: plantInfo.visualCharacteristics,
      },
    };
  }
}