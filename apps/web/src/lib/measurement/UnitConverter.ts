import { MeasurementUnit } from './types';

// Conversion factors to meters for length units
const LENGTH_TO_METERS: Record<string, number> = {
  [MeasurementUnit.MILLIMETERS]: 0.001,
  [MeasurementUnit.CENTIMETERS]: 0.01,
  [MeasurementUnit.METERS]: 1,
  [MeasurementUnit.KILOMETERS]: 1000,
  [MeasurementUnit.INCHES]: 0.0254,
  [MeasurementUnit.FEET]: 0.3048,
  [MeasurementUnit.YARDS]: 0.9144,
  [MeasurementUnit.MILES]: 1609.344,
};

// Conversion factors to square meters for area units
const AREA_TO_SQUARE_METERS: Record<string, number> = {
  [MeasurementUnit.SQUARE_MILLIMETERS]: 0.000001,
  [MeasurementUnit.SQUARE_CENTIMETERS]: 0.0001,
  [MeasurementUnit.SQUARE_METERS]: 1,
  [MeasurementUnit.SQUARE_KILOMETERS]: 1000000,
  [MeasurementUnit.SQUARE_INCHES]: 0.00064516,
  [MeasurementUnit.SQUARE_FEET]: 0.092903,
  [MeasurementUnit.SQUARE_YARDS]: 0.836127,
  [MeasurementUnit.ACRES]: 4046.86,
  [MeasurementUnit.HECTARES]: 10000,
};

export class UnitConverter {
  /**
   * Convert a value from one unit to another
   */
  static convert(value: number, from: MeasurementUnit, to: MeasurementUnit): number {
    if (from === to) return value;

    const isFromArea = this.isAreaUnit(from);
    const isToArea = this.isAreaUnit(to);

    if (isFromArea !== isToArea) {
      throw new Error('Cannot convert between length and area units');
    }

    if (isFromArea) {
      // Area conversion
      const fromFactor = AREA_TO_SQUARE_METERS[from];
      const toFactor = AREA_TO_SQUARE_METERS[to];
      
      if (!fromFactor || !toFactor) {
        throw new Error(`Unsupported area unit: ${from} or ${to}`);
      }
      
      return (value * fromFactor) / toFactor;
    } else {
      // Length conversion
      const fromFactor = LENGTH_TO_METERS[from];
      const toFactor = LENGTH_TO_METERS[to];
      
      if (!fromFactor || !toFactor) {
        throw new Error(`Unsupported length unit: ${from} or ${to}`);
      }
      
      return (value * fromFactor) / toFactor;
    }
  }

  /**
   * Format a measurement value with appropriate precision and unit
   */
  static formatMeasurement(
    value: number, 
    unit: MeasurementUnit, 
    precision: number = 2
  ): string {
    const roundedValue = this.roundToPrecision(value, precision);
    const abbreviation = this.getUnitAbbreviation(unit);
    return `${roundedValue} ${abbreviation}`;
  }

  /**
   * Get the standard abbreviation for a unit
   */
  static getUnitAbbreviation(unit: MeasurementUnit): string {
    return unit;
  }

  /**
   * Check if a unit is an area unit
   */
  static isAreaUnit(unit: MeasurementUnit): boolean {
    return Object.keys(AREA_TO_SQUARE_METERS).includes(unit);
  }

  /**
   * Check if a unit is a length unit
   */
  static isLengthUnit(unit: MeasurementUnit): boolean {
    return Object.keys(LENGTH_TO_METERS).includes(unit);
  }

  /**
   * Get all available length units
   */
  static getLengthUnits(): MeasurementUnit[] {
    return Object.keys(LENGTH_TO_METERS) as MeasurementUnit[];
  }

  /**
   * Get all available area units
   */
  static getAreaUnits(): MeasurementUnit[] {
    return Object.keys(AREA_TO_SQUARE_METERS) as MeasurementUnit[];
  }

  /**
   * Round a number to specified precision
   */
  static roundToPrecision(value: number, precision: number): string {
    if (precision === 0) {
      return Math.round(value).toString();
    }
    return value.toFixed(precision);
  }

  /**
   * Get appropriate precision based on unit and value magnitude
   */
  static getAdaptivePrecision(value: number, unit: MeasurementUnit): number {
    if (this.isAreaUnit(unit)) {
      // Area measurements
      if (unit === MeasurementUnit.ACRES || unit === MeasurementUnit.HECTARES) {
        return value < 1 ? 3 : 2;
      }
      if (unit === MeasurementUnit.SQUARE_FEET || unit === MeasurementUnit.SQUARE_METERS) {
        return value < 10 ? 2 : 1;
      }
      return 2;
    } else {
      // Length measurements
      if (unit === MeasurementUnit.MILLIMETERS) {
        return 0;
      }
      if (unit === MeasurementUnit.CENTIMETERS || unit === MeasurementUnit.INCHES) {
        return 1;
      }
      if (unit === MeasurementUnit.FEET || unit === MeasurementUnit.METERS) {
        return value < 10 ? 2 : 1;
      }
      if (unit === MeasurementUnit.KILOMETERS || unit === MeasurementUnit.MILES) {
        return value < 1 ? 3 : 2;
      }
      return 2;
    }
  }

  /**
   * Convert between area and length units for perimeter calculations
   */
  static getLinearUnitForArea(areaUnit: MeasurementUnit): MeasurementUnit {
    switch (areaUnit) {
      case MeasurementUnit.SQUARE_MILLIMETERS:
        return MeasurementUnit.MILLIMETERS;
      case MeasurementUnit.SQUARE_CENTIMETERS:
        return MeasurementUnit.CENTIMETERS;
      case MeasurementUnit.SQUARE_METERS:
        return MeasurementUnit.METERS;
      case MeasurementUnit.SQUARE_KILOMETERS:
        return MeasurementUnit.KILOMETERS;
      case MeasurementUnit.SQUARE_INCHES:
        return MeasurementUnit.INCHES;
      case MeasurementUnit.SQUARE_FEET:
        return MeasurementUnit.FEET;
      case MeasurementUnit.SQUARE_YARDS:
        return MeasurementUnit.YARDS;
      case MeasurementUnit.ACRES:
        return MeasurementUnit.FEET; // Acres typically measured in feet
      case MeasurementUnit.HECTARES:
        return MeasurementUnit.METERS; // Hectares typically measured in meters
      default:
        throw new Error(`Cannot determine linear unit for area unit: ${areaUnit}`);
    }
  }

  /**
   * Get suggested units based on measurement magnitude
   */
  static getSuggestedUnit(value: number, currentUnit: MeasurementUnit): MeasurementUnit {
    if (this.isAreaUnit(currentUnit)) {
      // Area unit suggestions
      const squareMeters = this.convert(value, currentUnit, MeasurementUnit.SQUARE_METERS);
      
      if (squareMeters >= 10000) return MeasurementUnit.HECTARES;
      if (squareMeters >= 4047) return MeasurementUnit.ACRES;
      if (squareMeters >= 1) return MeasurementUnit.SQUARE_METERS;
      if (squareMeters >= 0.0001) return MeasurementUnit.SQUARE_CENTIMETERS;
      return MeasurementUnit.SQUARE_MILLIMETERS;
    } else {
      // Length unit suggestions
      const meters = this.convert(value, currentUnit, MeasurementUnit.METERS);
      
      if (meters >= 1000) return MeasurementUnit.KILOMETERS;
      if (meters >= 1) return MeasurementUnit.METERS;
      if (meters >= 0.01) return MeasurementUnit.CENTIMETERS;
      return MeasurementUnit.MILLIMETERS;
    }
  }
}