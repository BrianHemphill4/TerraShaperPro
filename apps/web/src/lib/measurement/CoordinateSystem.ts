import { MeasurementUnit, ScaleConfiguration } from './types';
import { UnitConverter } from './UnitConverter';

export class CoordinateSystem {
  private config: ScaleConfiguration;
  
  constructor(config: ScaleConfiguration) {
    this.config = config;
  }

  /**
   * Convert canvas pixels to real-world units
   */
  convertToRealWorld(canvasDistance: number, targetUnit?: MeasurementUnit): number {
    const baseUnit = this.config.units === 'metric' ? MeasurementUnit.METERS : MeasurementUnit.FEET;
    const pixelsPerUnit = this.config.units === 'metric' ? this.config.pixelsPerMeter : this.config.pixelsPerFoot;
    
    const realWorldDistance = canvasDistance / pixelsPerUnit;
    
    if (targetUnit && targetUnit !== baseUnit) {
      return UnitConverter.convert(realWorldDistance, baseUnit, targetUnit);
    }
    
    return realWorldDistance;
  }

  /**
   * Convert real-world units to canvas pixels
   */
  convertToCanvas(realWorldDistance: number, sourceUnit?: MeasurementUnit): number {
    const baseUnit = this.config.units === 'metric' ? MeasurementUnit.METERS : MeasurementUnit.FEET;
    const pixelsPerUnit = this.config.units === 'metric' ? this.config.pixelsPerMeter : this.config.pixelsPerFoot;
    
    let distance = realWorldDistance;
    
    if (sourceUnit && sourceUnit !== baseUnit) {
      distance = UnitConverter.convert(realWorldDistance, sourceUnit, baseUnit);
    }
    
    return distance * pixelsPerUnit;
  }

  /**
   * Convert canvas area to real-world area
   */
  convertAreaToRealWorld(canvasArea: number, targetUnit?: MeasurementUnit): number {
    const baseUnit = this.config.units === 'metric' ? MeasurementUnit.SQUARE_METERS : MeasurementUnit.SQUARE_FEET;
    const pixelsPerUnit = this.config.units === 'metric' ? this.config.pixelsPerMeter : this.config.pixelsPerFoot;
    
    const realWorldArea = canvasArea / (pixelsPerUnit * pixelsPerUnit);
    
    if (targetUnit && targetUnit !== baseUnit) {
      return UnitConverter.convert(realWorldArea, baseUnit, targetUnit);
    }
    
    return realWorldArea;
  }

  /**
   * Convert real-world area to canvas area
   */
  convertAreaToCanvas(realWorldArea: number, sourceUnit?: MeasurementUnit): number {
    const baseUnit = this.config.units === 'metric' ? MeasurementUnit.SQUARE_METERS : MeasurementUnit.SQUARE_FEET;
    const pixelsPerUnit = this.config.units === 'metric' ? this.config.pixelsPerMeter : this.config.pixelsPerFoot;
    
    let area = realWorldArea;
    
    if (sourceUnit && sourceUnit !== baseUnit) {
      area = UnitConverter.convert(realWorldArea, sourceUnit, baseUnit);
    }
    
    return area * (pixelsPerUnit * pixelsPerUnit);
  }

  /**
   * Get the base unit for this coordinate system
   */
  getBaseUnit(): MeasurementUnit {
    return this.config.units === 'metric' ? MeasurementUnit.METERS : MeasurementUnit.FEET;
  }

  /**
   * Get the base area unit for this coordinate system
   */
  getBaseAreaUnit(): MeasurementUnit {
    return this.config.units === 'metric' ? MeasurementUnit.SQUARE_METERS : MeasurementUnit.SQUARE_FEET;
  }

  /**
   * Get the pixels per unit ratio
   */
  getPixelsPerUnit(): number {
    return this.config.units === 'metric' ? this.config.pixelsPerMeter : this.config.pixelsPerFoot;
  }

  /**
   * Calculate measurement accuracy based on pixel precision
   */
  calculateAccuracy(canvasDistance: number): number {
    const pixelsPerUnit = this.getPixelsPerUnit();
    const realWorldDistance = canvasDistance / pixelsPerUnit;
    
    // Accuracy decreases with smaller measurements due to pixel limitations
    // Minimum accuracy is determined by 1 pixel resolution
    const pixelAccuracy = 1 / pixelsPerUnit;
    const relativeError = pixelAccuracy / Math.max(realWorldDistance, pixelAccuracy);
    
    return Math.max(0, 100 - (relativeError * 100));
  }

  /**
   * Get suggested precision based on measurement magnitude
   */
  getSuggestedPrecision(canvasDistance: number, targetUnit?: MeasurementUnit): number {
    const unit = targetUnit || this.getBaseUnit();
    const realWorldDistance = this.convertToRealWorld(canvasDistance, unit);
    
    return UnitConverter.getAdaptivePrecision(realWorldDistance, unit);
  }

  /**
   * Validate if the coordinate system is properly calibrated
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.config.pixelsPerMeter <= 0) {
      errors.push('Pixels per meter must be greater than 0');
    }
    
    if (this.config.pixelsPerFoot <= 0) {
      errors.push('Pixels per foot must be greater than 0');
    }
    
    if (this.config.calibrationPoints.length < 1) {
      errors.push('At least one calibration point is required');
    }
    
    if (this.config.accuracy < 50) {
      errors.push('Scale accuracy is below 50% - recalibration recommended');
    }
    
    // Check calibration consistency
    if (this.config.calibrationPoints.length >= 1) {
      const point = this.config.calibrationPoints[0];
      const expectedPixels = this.convertToCanvas(point.realWorldDistance, point.unit);
      const actualPixels = Math.sqrt(
        Math.pow(point.canvasCoordinate.x, 2) + 
        Math.pow(point.canvasCoordinate.y, 2)
      );
      
      const error = Math.abs(expectedPixels - actualPixels) / expectedPixels;
      if (error > 0.1) { // 10% tolerance
        errors.push('Calibration points show inconsistent scaling');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a calibration from two points and known distance
   */
  static createCalibrationFromPoints(
    point1: { x: number; y: number },
    point2: { x: number; y: number },
    knownDistance: number,
    unit: MeasurementUnit,
    config: Partial<ScaleConfiguration>
  ): ScaleConfiguration {
    const canvasDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
    
    // Convert known distance to both meters and feet
    const distanceInMeters = UnitConverter.convert(knownDistance, unit, MeasurementUnit.METERS);
    const distanceInFeet = UnitConverter.convert(knownDistance, unit, MeasurementUnit.FEET);
    
    const pixelsPerMeter = canvasDistance / distanceInMeters;
    const pixelsPerFoot = canvasDistance / distanceInFeet;
    
    // Calculate accuracy based on pixel resolution
    const minPixelResolution = 1;
    const accuracy = Math.min(100, (canvasDistance / minPixelResolution) * 10);
    
    return {
      id: config.id || crypto.randomUUID(),
      name: config.name || 'New Scale Configuration',
      sceneId: config.sceneId || '',
      pixelsPerMeter,
      pixelsPerFoot,
      calibrationPoints: [
        {
          canvasCoordinate: point1,
          realWorldDistance: 0, // Starting point
          unit,
          label: 'Start Point'
        },
        {
          canvasCoordinate: point2,
          realWorldDistance: knownDistance,
          unit,
          label: 'End Point'
        }
      ],
      accuracy: Math.min(100, Math.max(0, accuracy)),
      units: UnitConverter.isLengthUnit(unit) && 
             [MeasurementUnit.METERS, MeasurementUnit.CENTIMETERS, MeasurementUnit.MILLIMETERS, MeasurementUnit.KILOMETERS]
               .includes(unit) ? 'metric' : 'imperial',
      isDefault: config.isDefault || false,
      createdAt: new Date()
    };
  }

  /**
   * Update configuration with new calibration data
   */
  updateConfiguration(updates: Partial<ScaleConfiguration>): CoordinateSystem {
    this.config = { ...this.config, ...updates };
    return this;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): ScaleConfiguration {
    return { ...this.config };
  }
}