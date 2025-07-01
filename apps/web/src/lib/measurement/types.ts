// Measurement system type definitions
export enum MeasurementUnit {
  // Length units
  MILLIMETERS = 'mm',
  CENTIMETERS = 'cm', 
  METERS = 'm',
  KILOMETERS = 'km',
  INCHES = 'in',
  FEET = 'ft',
  YARDS = 'yd',
  MILES = 'mi',
  
  // Area units
  SQUARE_MILLIMETERS = 'mm²',
  SQUARE_CENTIMETERS = 'cm²',
  SQUARE_METERS = 'm²',
  SQUARE_KILOMETERS = 'km²',
  SQUARE_INCHES = 'in²',
  SQUARE_FEET = 'ft²',
  SQUARE_YARDS = 'yd²',
  ACRES = 'ac',
  HECTARES = 'ha'
}

export interface CalibrationPoint {
  canvasCoordinate: { x: number; y: number };
  realWorldDistance: number;
  unit: MeasurementUnit;
  label: string;
}

export interface ScaleConfiguration {
  id: string;
  name: string;
  sceneId: string;
  pixelsPerMeter: number;
  pixelsPerFoot: number;
  calibrationPoints: CalibrationPoint[];
  accuracy: number; // 0-100 percentage
  units: 'metric' | 'imperial' | 'custom';
  isDefault: boolean;
  createdAt: Date;
}

export interface RealWorldPoint {
  x: number;
  y: number;
  unit: MeasurementUnit;
}

export interface LineSegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
  distance: number;
  unit: MeasurementUnit;
}

export interface DistanceMeasurement {
  id: string;
  segments: LineSegment[];
  totalDistance: number;
  unit: MeasurementUnit;
  precision: number;
  createdAt: Date;
}

export interface HoleMeasurement {
  points: { x: number; y: number }[];
  area: number;
  perimeter: number;
}

export interface AreaMeasurement {
  id: string;
  area: number;
  perimeter: number;
  holes: HoleMeasurement[];
  netArea: number; // area minus holes
  unit: MeasurementUnit;
  precision: number;
  createdAt: Date;
}

export interface DimensionStyle {
  lineColor: string;
  lineWidth: number;
  arrowSize: number;
  textSize: number;
  textColor: string;
  extensionLineLength: number;
  textOffset: number;
}

export interface DimensionOptions {
  textPosition: 'above' | 'below' | 'center';
  style: DimensionStyle;
  showExtensionLines: boolean;
  precision: number;
}

export interface ScaleCalibrationWizard {
  step: 'select-points' | 'enter-distance' | 'validate' | 'save';
  point1?: { x: number; y: number };
  point2?: { x: number; y: number };
  knownDistance: number;
  selectedUnit: MeasurementUnit;
  calculatedScale: number;
  accuracy: number;
}

export interface SnapSettings {
  enabled: boolean;
  threshold: number; // pixels
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
}

export interface MeasurementSettings {
  defaultUnit: MeasurementUnit;
  precision: number;
  snapSettings: SnapSettings;
  dimensionStyle: DimensionStyle;
  showRealTimeUpdates: boolean;
  persistMeasurements: boolean;
}