import { MeasurementUnit, DistanceMeasurement, AreaMeasurement } from './types';
import { UnitConverter } from './UnitConverter';

export interface MeasurementReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportSection {
  title: string;
  items: ReportItem[];
}

export interface ReportItem {
  label: string;
  value: string;
  unit: string;
  notes?: string;
}

export interface ReportMetadata {
  generatedAt: Date;
  totalMeasurements: number;
  scaleAccuracy?: number;
  units: string;
}

export class MeasurementFormatter {
  /**
   * Format a distance measurement with appropriate precision
   */
  static formatDistance(
    distance: number, 
    unit: MeasurementUnit, 
    precision?: number,
    includeUnit: boolean = true
  ): string {
    const adaptivePrecision = precision ?? UnitConverter.getAdaptivePrecision(distance, unit);
    const formattedValue = UnitConverter.roundToPrecision(distance, adaptivePrecision);
    const unitAbbr = UnitConverter.getUnitAbbreviation(unit);
    
    return includeUnit ? `${formattedValue} ${unitAbbr}` : formattedValue;
  }

  /**
   * Format an area measurement with appropriate precision
   */
  static formatArea(
    area: number, 
    unit: MeasurementUnit, 
    precision?: number,
    includeUnit: boolean = true
  ): string {
    const adaptivePrecision = precision ?? UnitConverter.getAdaptivePrecision(area, unit);
    const formattedValue = UnitConverter.roundToPrecision(area, adaptivePrecision);
    const unitAbbr = UnitConverter.getUnitAbbreviation(unit);
    
    return includeUnit ? `${formattedValue} ${unitAbbr}` : formattedValue;
  }

  /**
   * Format a distance measurement object
   */
  static formatDistanceMeasurement(measurement: DistanceMeasurement): string {
    if (measurement.segments.length === 1) {
      return this.formatDistance(measurement.totalDistance, measurement.unit, measurement.precision);
    } else {
      const segmentStrings = measurement.segments.map((segment, index) => 
        `Segment ${index + 1}: ${this.formatDistance(segment.distance, segment.unit, measurement.precision)}`
      );
      const totalString = `Total: ${this.formatDistance(measurement.totalDistance, measurement.unit, measurement.precision)}`;
      
      return [totalString, ...segmentStrings].join('\n');
    }
  }

  /**
   * Format an area measurement object
   */
  static formatAreaMeasurement(measurement: AreaMeasurement): string {
    const parts: string[] = [];
    
    // Main area
    const areaUnit = measurement.unit;
    const linearUnit = UnitConverter.getLinearUnitForArea(areaUnit);
    
    parts.push(`Area: ${this.formatArea(measurement.area, areaUnit, measurement.precision)}`);
    parts.push(`Perimeter: ${this.formatDistance(measurement.perimeter, linearUnit, measurement.precision)}`);
    
    // Holes
    if (measurement.holes.length > 0) {
      measurement.holes.forEach((hole, index) => {
        parts.push(`Hole ${index + 1}: -${this.formatArea(hole.area, areaUnit, measurement.precision)}`);
      });
      parts.push(`Net Area: ${this.formatArea(measurement.netArea, areaUnit, measurement.precision)}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Convert measurement to different unit
   */
  static convertAndFormat(
    value: number,
    fromUnit: MeasurementUnit,
    toUnit: MeasurementUnit,
    precision?: number
  ): string {
    const convertedValue = UnitConverter.convert(value, fromUnit, toUnit);
    const adaptivePrecision = precision ?? UnitConverter.getAdaptivePrecision(convertedValue, toUnit);
    
    return UnitConverter.formatMeasurement(convertedValue, toUnit, adaptivePrecision);
  }

  /**
   * Generate a comprehensive measurement report
   */
  static generateReport(
    distanceMeasurements: DistanceMeasurement[],
    areaMeasurements: AreaMeasurement[],
    options: {
      title?: string;
      includeMetadata?: boolean;
      groupByUnit?: boolean;
      scaleAccuracy?: number;
    } = {}
  ): MeasurementReport {
    const {
      title = 'Measurement Report',
      includeMetadata = true,
      groupByUnit = false,
      scaleAccuracy
    } = options;

    const sections: ReportSection[] = [];

    // Distance measurements section
    if (distanceMeasurements.length > 0) {
      const distanceSection: ReportSection = {
        title: 'Distance Measurements',
        items: []
      };

      if (groupByUnit) {
        const groupedByUnit = this.groupMeasurementsByUnit(distanceMeasurements);
        Object.entries(groupedByUnit).forEach(([unit, measurements]) => {
          const totalDistance = measurements.reduce((sum, m) => sum + m.totalDistance, 0);
          distanceSection.items.push({
            label: `Total Distance (${UnitConverter.getUnitAbbreviation(unit as MeasurementUnit)})`,
            value: this.formatDistance(totalDistance, unit as MeasurementUnit),
            unit: UnitConverter.getUnitAbbreviation(unit as MeasurementUnit),
            notes: `${measurements.length} measurement(s)`
          });
        });
      } else {
        distanceMeasurements.forEach((measurement, index) => {
          distanceSection.items.push({
            label: `Distance ${index + 1}`,
            value: this.formatDistance(measurement.totalDistance, measurement.unit, measurement.precision),
            unit: UnitConverter.getUnitAbbreviation(measurement.unit),
            notes: measurement.segments.length > 1 ? `${measurement.segments.length} segments` : undefined
          });
        });
      }

      sections.push(distanceSection);
    }

    // Area measurements section
    if (areaMeasurements.length > 0) {
      const areaSection: ReportSection = {
        title: 'Area Measurements',
        items: []
      };

      if (groupByUnit) {
        const groupedByUnit = this.groupMeasurementsByUnit(areaMeasurements);
        Object.entries(groupedByUnit).forEach(([unit, measurements]) => {
          const totalArea = measurements.reduce((sum, m) => sum + m.netArea, 0);
          areaSection.items.push({
            label: `Total Area (${UnitConverter.getUnitAbbreviation(unit as MeasurementUnit)})`,
            value: this.formatArea(totalArea, unit as MeasurementUnit),
            unit: UnitConverter.getUnitAbbreviation(unit as MeasurementUnit),
            notes: `${measurements.length} measurement(s)`
          });
        });
      } else {
        areaMeasurements.forEach((measurement, index) => {
          areaSection.items.push({
            label: `Area ${index + 1}`,
            value: this.formatArea(measurement.netArea, measurement.unit, measurement.precision),
            unit: UnitConverter.getUnitAbbreviation(measurement.unit),
            notes: measurement.holes.length > 0 ? `${measurement.holes.length} hole(s)` : undefined
          });
        });
      }

      sections.push(areaSection);
    }

    // Summary
    const totalMeasurements = distanceMeasurements.length + areaMeasurements.length;
    let summary = `Report contains ${totalMeasurements} measurement`;
    if (totalMeasurements !== 1) summary += 's';
    summary += ` (${distanceMeasurements.length} distance, ${areaMeasurements.length} area)`;

    // Metadata
    const metadata: ReportMetadata = {
      generatedAt: new Date(),
      totalMeasurements,
      scaleAccuracy,
      units: this.getUnitsUsed(distanceMeasurements, areaMeasurements).join(', ')
    };

    return {
      title,
      summary,
      sections,
      metadata: includeMetadata ? metadata : {} as ReportMetadata
    };
  }

  /**
   * Export report as formatted text
   */
  static exportReportAsText(report: MeasurementReport): string {
    const lines: string[] = [];
    
    // Header
    lines.push('='.repeat(50));
    lines.push(report.title.toUpperCase());
    lines.push('='.repeat(50));
    lines.push('');
    
    // Summary
    lines.push('SUMMARY');
    lines.push('-'.repeat(20));
    lines.push(report.summary);
    lines.push('');
    
    // Sections
    report.sections.forEach(section => {
      lines.push(section.title.toUpperCase());
      lines.push('-'.repeat(section.title.length));
      
      section.items.forEach(item => {
        let line = `${item.label}: ${item.value}`;
        if (item.notes) {
          line += ` (${item.notes})`;
        }
        lines.push(line);
      });
      
      lines.push('');
    });
    
    // Metadata
    if (report.metadata.generatedAt) {
      lines.push('METADATA');
      lines.push('-'.repeat(20));
      lines.push(`Generated: ${report.metadata.generatedAt.toLocaleString()}`);
      lines.push(`Total Measurements: ${report.metadata.totalMeasurements}`);
      if (report.metadata.scaleAccuracy) {
        lines.push(`Scale Accuracy: ${report.metadata.scaleAccuracy.toFixed(1)}%`);
      }
      lines.push(`Units Used: ${report.metadata.units}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Export report as CSV
   */
  static exportReportAsCSV(report: MeasurementReport): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Section,Label,Value,Unit,Notes');
    
    // Data
    report.sections.forEach(section => {
      section.items.forEach(item => {
        const values = [
          section.title,
          item.label,
          item.value.replace(/,/g, ''),
          item.unit,
          item.notes || ''
        ];
        lines.push(values.map(v => `"${v}"`).join(','));
      });
    });
    
    return lines.join('\n');
  }

  /**
   * Get list of units used in measurements
   */
  private static getUnitsUsed(
    distanceMeasurements: DistanceMeasurement[],
    areaMeasurements: AreaMeasurement[]
  ): string[] {
    const units = new Set<string>();
    
    distanceMeasurements.forEach(m => {
      units.add(UnitConverter.getUnitAbbreviation(m.unit));
    });
    
    areaMeasurements.forEach(m => {
      units.add(UnitConverter.getUnitAbbreviation(m.unit));
    });
    
    return Array.from(units);
  }

  /**
   * Group measurements by unit
   */
  private static groupMeasurementsByUnit<T extends { unit: MeasurementUnit }>(
    measurements: T[]
  ): Record<string, T[]> {
    return measurements.reduce((groups, measurement) => {
      const unit = measurement.unit;
      if (!groups[unit]) {
        groups[unit] = [];
      }
      groups[unit].push(measurement);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Format value for display in different contexts
   */
  static formatForContext(
    value: number,
    unit: MeasurementUnit,
    context: 'compact' | 'detailed' | 'technical',
    precision?: number
  ): string {
    switch (context) {
      case 'compact':
        return UnitConverter.formatMeasurement(value, unit, Math.min(precision || 2, 1));
      
      case 'detailed':
        return UnitConverter.formatMeasurement(
          value, 
          unit, 
          precision ?? UnitConverter.getAdaptivePrecision(value, unit)
        );
      
      case 'technical':
        const techPrecision = Math.max(precision || 3, 3);
        return `${UnitConverter.roundToPrecision(value, techPrecision)} ${UnitConverter.getUnitAbbreviation(unit)}`;
      
      default:
        return UnitConverter.formatMeasurement(value, unit, precision);
    }
  }
}