import { UnitConverter } from '../UnitConverter';
import { MeasurementUnit } from '../types';

describe('UnitConverter', () => {
  describe('convert', () => {
    it('should convert between length units correctly', () => {
      // Metric conversions
      expect(UnitConverter.convert(1, MeasurementUnit.METERS, MeasurementUnit.CENTIMETERS)).toBe(100);
      expect(UnitConverter.convert(1000, MeasurementUnit.MILLIMETERS, MeasurementUnit.METERS)).toBe(1);
      expect(UnitConverter.convert(1, MeasurementUnit.KILOMETERS, MeasurementUnit.METERS)).toBe(1000);
      
      // Imperial conversions
      expect(UnitConverter.convert(1, MeasurementUnit.FEET, MeasurementUnit.INCHES)).toBe(12);
      expect(UnitConverter.convert(3, MeasurementUnit.FEET, MeasurementUnit.YARDS)).toBe(1);
      expect(UnitConverter.convert(5280, MeasurementUnit.FEET, MeasurementUnit.MILES)).toBe(1);
      
      // Mixed metric/imperial
      expect(UnitConverter.convert(1, MeasurementUnit.METERS, MeasurementUnit.FEET)).toBeCloseTo(3.28084, 4);
      expect(UnitConverter.convert(1, MeasurementUnit.INCHES, MeasurementUnit.CENTIMETERS)).toBeCloseTo(2.54, 2);
    });

    it('should convert between area units correctly', () => {
      // Metric area conversions
      expect(UnitConverter.convert(1, MeasurementUnit.SQUARE_METERS, MeasurementUnit.SQUARE_CENTIMETERS)).toBe(10000);
      expect(UnitConverter.convert(10000, MeasurementUnit.SQUARE_METERS, MeasurementUnit.HECTARES)).toBe(1);
      
      // Imperial area conversions
      expect(UnitConverter.convert(1, MeasurementUnit.SQUARE_FEET, MeasurementUnit.SQUARE_INCHES)).toBe(144);
      expect(UnitConverter.convert(43560, MeasurementUnit.SQUARE_FEET, MeasurementUnit.ACRES)).toBeCloseTo(1, 2);
    });

    it('should return the same value when converting to the same unit', () => {
      expect(UnitConverter.convert(5, MeasurementUnit.METERS, MeasurementUnit.METERS)).toBe(5);
      expect(UnitConverter.convert(10, MeasurementUnit.SQUARE_FEET, MeasurementUnit.SQUARE_FEET)).toBe(10);
    });

    it('should throw error when converting between length and area units', () => {
      expect(() => {
        UnitConverter.convert(1, MeasurementUnit.METERS, MeasurementUnit.SQUARE_METERS);
      }).toThrow('Cannot convert between length and area units');
    });
  });

  describe('formatMeasurement', () => {
    it('should format measurements with correct precision', () => {
      expect(UnitConverter.formatMeasurement(1.2345, MeasurementUnit.METERS, 2)).toBe('1.23 m');
      expect(UnitConverter.formatMeasurement(1, MeasurementUnit.FEET, 0)).toBe('1 ft');
      expect(UnitConverter.formatMeasurement(1.5, MeasurementUnit.SQUARE_METERS, 1)).toBe('1.5 m²');
    });
  });

  describe('isAreaUnit', () => {
    it('should correctly identify area units', () => {
      expect(UnitConverter.isAreaUnit(MeasurementUnit.SQUARE_METERS)).toBe(true);
      expect(UnitConverter.isAreaUnit(MeasurementUnit.ACRES)).toBe(true);
      expect(UnitConverter.isAreaUnit(MeasurementUnit.METERS)).toBe(false);
      expect(UnitConverter.isAreaUnit(MeasurementUnit.FEET)).toBe(false);
    });
  });

  describe('isLengthUnit', () => {
    it('should correctly identify length units', () => {
      expect(UnitConverter.isLengthUnit(MeasurementUnit.METERS)).toBe(true);
      expect(UnitConverter.isLengthUnit(MeasurementUnit.FEET)).toBe(true);
      expect(UnitConverter.isLengthUnit(MeasurementUnit.SQUARE_METERS)).toBe(false);
      expect(UnitConverter.isLengthUnit(MeasurementUnit.ACRES)).toBe(false);
    });
  });

  describe('getAdaptivePrecision', () => {
    it('should return appropriate precision for different units and values', () => {
      // Small values should have higher precision
      expect(UnitConverter.getAdaptivePrecision(0.1, MeasurementUnit.METERS)).toBeGreaterThan(
        UnitConverter.getAdaptivePrecision(100, MeasurementUnit.METERS)
      );
      
      // Millimeters should have no decimal places
      expect(UnitConverter.getAdaptivePrecision(1.5, MeasurementUnit.MILLIMETERS)).toBe(0);
      
      // Area units should have appropriate precision
      expect(UnitConverter.getAdaptivePrecision(0.5, MeasurementUnit.ACRES)).toBe(3);
      expect(UnitConverter.getAdaptivePrecision(2, MeasurementUnit.ACRES)).toBe(2);
    });
  });

  describe('getLinearUnitForArea', () => {
    it('should return correct linear unit for area units', () => {
      expect(UnitConverter.getLinearUnitForArea(MeasurementUnit.SQUARE_METERS)).toBe(MeasurementUnit.METERS);
      expect(UnitConverter.getLinearUnitForArea(MeasurementUnit.SQUARE_FEET)).toBe(MeasurementUnit.FEET);
      expect(UnitConverter.getLinearUnitForArea(MeasurementUnit.ACRES)).toBe(MeasurementUnit.FEET);
      expect(UnitConverter.getLinearUnitForArea(MeasurementUnit.HECTARES)).toBe(MeasurementUnit.METERS);
    });

    it('should throw error for non-area units', () => {
      expect(() => {
        UnitConverter.getLinearUnitForArea(MeasurementUnit.METERS);
      }).toThrow('Cannot determine linear unit for area unit');
    });
  });

  describe('getSuggestedUnit', () => {
    it('should suggest appropriate units based on value magnitude', () => {
      // Large distances should suggest kilometers
      const largeDistance = UnitConverter.convert(5000, MeasurementUnit.METERS, MeasurementUnit.METERS);
      expect(UnitConverter.getSuggestedUnit(largeDistance, MeasurementUnit.METERS)).toBe(MeasurementUnit.KILOMETERS);
      
      // Small distances should suggest smaller units
      const smallDistance = UnitConverter.convert(0.5, MeasurementUnit.METERS, MeasurementUnit.METERS);
      expect(UnitConverter.getSuggestedUnit(smallDistance, MeasurementUnit.METERS)).toBe(MeasurementUnit.CENTIMETERS);
      
      // Large areas should suggest hectares
      const largeArea = UnitConverter.convert(15000, MeasurementUnit.SQUARE_METERS, MeasurementUnit.SQUARE_METERS);
      expect(UnitConverter.getSuggestedUnit(largeArea, MeasurementUnit.SQUARE_METERS)).toBe(MeasurementUnit.HECTARES);
    });
  });
});