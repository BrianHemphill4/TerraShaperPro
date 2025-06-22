export type SampleProject = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'residential' | 'commercial' | 'xeriscape';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
  canvasData: any; // Fabric.js JSON data
}

export const sampleProjects: SampleProject[] = [
  {
    id: 'backyard-oasis',
    name: 'Backyard Oasis',
    description: 'Transform your backyard into a relaxing retreat with native Texas plants and a small patio area.',
    thumbnail: '/samples/backyard-oasis.jpg',
    category: 'residential',
    difficulty: 'beginner',
    estimatedTime: '30 minutes',
    features: ['Native plants', 'Patio area', 'Garden beds', 'Mulch paths'],
    canvasData: {
      version: '5.3.0',
      objects: [
        // Simplified example - actual data would include complete Fabric.js objects
        {
          type: 'polygon',
          points: [
            { x: 100, y: 100 },
            { x: 300, y: 100 },
            { x: 300, y: 200 },
            { x: 100, y: 200 },
          ],
          fill: '#8B4513',
          stroke: '#654321',
          strokeWidth: 2,
          selectable: true,
          name: 'Garden Bed 1',
          customType: 'area',
          material: 'mulch',
        },
        {
          type: 'polygon',
          points: [
            { x: 350, y: 150 },
            { x: 450, y: 150 },
            { x: 450, y: 250 },
            { x: 350, y: 250 },
          ],
          fill: '#228B22',
          stroke: '#006400',
          strokeWidth: 2,
          selectable: true,
          name: 'Grass Area',
          customType: 'area',
          material: 'grass',
        },
      ],
      background: '#F5F5DC',
    },
  },
  {
    id: 'xeriscape-front',
    name: 'Xeriscape Front Yard',
    description: 'Create a water-wise front yard using drought-tolerant Texas native plants and decorative gravel.',
    thumbnail: '/samples/xeriscape-front.jpg',
    category: 'xeriscape',
    difficulty: 'intermediate',
    estimatedTime: '45 minutes',
    features: ['Drought-tolerant plants', 'Gravel paths', 'Rock gardens', 'Minimal lawn'],
    canvasData: {
      version: '5.3.0',
      objects: [
        {
          type: 'polygon',
          points: [
            { x: 50, y: 50 },
            { x: 200, y: 50 },
            { x: 250, y: 150 },
            { x: 200, y: 250 },
            { x: 50, y: 250 },
          ],
          fill: '#C0C0C0',
          stroke: '#808080',
          strokeWidth: 2,
          selectable: true,
          name: 'Gravel Path',
          customType: 'area',
          material: 'gravel',
        },
        {
          type: 'polygon',
          points: [
            { x: 300, y: 100 },
            { x: 400, y: 100 },
            { x: 400, y: 200 },
            { x: 300, y: 200 },
          ],
          fill: '#DEB887',
          stroke: '#D2691E',
          strokeWidth: 2,
          selectable: true,
          name: 'Rock Garden',
          customType: 'area',
          material: 'decomposed_granite',
        },
      ],
      background: '#F5F5DC',
    },
  },
  {
    id: 'commercial-entrance',
    name: 'Commercial Entrance',
    description: 'Design a welcoming commercial property entrance with structured planting beds and walkways.',
    thumbnail: '/samples/commercial-entrance.jpg',
    category: 'commercial',
    difficulty: 'advanced',
    estimatedTime: '1 hour',
    features: ['Formal planting beds', 'Concrete walkways', 'Signage area', 'Irrigation zones'],
    canvasData: {
      version: '5.3.0',
      objects: [
        {
          type: 'polyline',
          points: [
            { x: 100, y: 300 },
            { x: 200, y: 250 },
            { x: 300, y: 250 },
            { x: 400, y: 300 },
          ],
          fill: 'transparent',
          stroke: '#696969',
          strokeWidth: 20,
          selectable: true,
          name: 'Main Walkway',
          customType: 'line',
          material: 'concrete',
        },
        {
          type: 'polygon',
          points: [
            { x: 150, y: 100 },
            { x: 350, y: 100 },
            { x: 350, y: 200 },
            { x: 150, y: 200 },
          ],
          fill: '#8B4513',
          stroke: '#654321',
          strokeWidth: 2,
          selectable: true,
          name: 'Entry Bed',
          customType: 'area',
          material: 'mulch',
        },
      ],
      background: '#F5F5DC',
    },
  },
];

export function getSampleProject(id: string): SampleProject | undefined {
  return sampleProjects.find(project => project.id === id);
}

export function getSampleProjectsByCategory(category: SampleProject['category']): SampleProject[] {
  return sampleProjects.filter(project => project.category === category);
}

export function getSampleProjectsByDifficulty(difficulty: SampleProject['difficulty']): SampleProject[] {
  return sampleProjects.filter(project => project.difficulty === difficulty);
}