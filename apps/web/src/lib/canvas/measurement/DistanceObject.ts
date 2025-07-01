import { fabric } from 'fabric';
import { LineSegment, MeasurementUnit, DimensionStyle } from '../../measurement/types';
import { UnitConverter } from '../../measurement/UnitConverter';
import { GeometryUtils } from '../../measurement/GeometryCalculations';

export interface DistanceObjectOptions extends fabric.IGroupOptions {
  segments: LineSegment[];
  totalDistance: number;
  unit: MeasurementUnit;
  precision: number;
  style: DimensionStyle;
  showRunningDimensions: boolean;
  isMeasurement?: boolean;
}

export class DistanceObject extends fabric.Group {
  public segments: LineSegment[];
  public totalDistance: number;
  public unit: MeasurementUnit;
  public precision: number;
  public style: DimensionStyle;
  public showRunningDimensions: boolean;

  private lines: fabric.Line[] = [];
  private arrows: fabric.Object[] = [];
  private texts: fabric.Text[] = [];

  constructor(options: DistanceObjectOptions) {
    super([], options);
    
    this.segments = options.segments;
    this.totalDistance = options.totalDistance;
    this.unit = options.unit;
    this.precision = options.precision;
    this.style = options.style;
    this.showRunningDimensions = options.showRunningDimensions;
    
    // Mark as measurement object
    (this as any).isMeasurement = true;
    
    this.createGeometry();
  }

  private createGeometry(): void {
    this.clear();
    this.lines = [];
    this.arrows = [];
    this.texts = [];

    let runningDistance = 0;

    this.segments.forEach((segment, index) => {
      // Create main line
      const line = new fabric.Line([
        segment.start.x, segment.start.y,
        segment.end.x, segment.end.y
      ], {
        stroke: this.style.lineColor,
        strokeWidth: this.style.lineWidth,
        selectable: false,
        evented: false
      });

      this.lines.push(line);
      this.addWithUpdate(line);

      // Create arrows for first and last segments
      if (index === 0) {
        const startArrow = this.createArrow(segment.start, segment.end, true);
        this.arrows.push(startArrow);
        this.addWithUpdate(startArrow);
      }

      if (index === this.segments.length - 1) {
        const endArrow = this.createArrow(segment.start, segment.end, false);
        this.arrows.push(endArrow);
        this.addWithUpdate(endArrow);
      }

      // Create dimension text
      const midpoint = {
        x: (segment.start.x + segment.end.x) / 2,
        y: (segment.start.y + segment.end.y) / 2
      };

      const segmentDistance = segment.distance;
      runningDistance += segmentDistance;

      // Individual segment dimension
      const segmentText = this.createDimensionText(
        UnitConverter.formatMeasurement(segmentDistance, this.unit, this.precision),
        midpoint,
        segment
      );
      this.texts.push(segmentText);
      this.addWithUpdate(segmentText);

      // Running dimension (if enabled and not the first segment)
      if (this.showRunningDimensions && index > 0) {
        const runningText = this.createRunningDimensionText(
          UnitConverter.formatMeasurement(runningDistance, this.unit, this.precision),
          segment.end
        );
        this.texts.push(runningText);
        this.addWithUpdate(runningText);
      }
    });

    // Total distance text (for multi-segment measurements)
    if (this.segments.length > 1) {
      const lastSegment = this.segments[this.segments.length - 1];
      const totalText = this.createTotalDimensionText(
        `Total: ${UnitConverter.formatMeasurement(this.totalDistance, this.unit, this.precision)}`,
        lastSegment.end
      );
      this.texts.push(totalText);
      this.addWithUpdate(totalText);
    }
  }

  private createArrow(start: { x: number; y: number }, end: { x: number; y: number }, isStart: boolean): fabric.Polygon {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = this.style.arrowSize;
    const arrowWidth = this.style.arrowSize * 0.6;

    let arrowPoint: { x: number; y: number };
    let basePoint1: { x: number; y: number };
    let basePoint2: { x: number; y: number };

    if (isStart) {
      // Arrow pointing from start
      arrowPoint = start;
      basePoint1 = {
        x: start.x + arrowLength * Math.cos(angle + Math.PI * 0.8),
        y: start.y + arrowLength * Math.sin(angle + Math.PI * 0.8)
      };
      basePoint2 = {
        x: start.x + arrowLength * Math.cos(angle - Math.PI * 0.8),
        y: start.y + arrowLength * Math.sin(angle - Math.PI * 0.8)
      };
    } else {
      // Arrow pointing to end
      arrowPoint = end;
      basePoint1 = {
        x: end.x - arrowLength * Math.cos(angle + Math.PI * 0.2),
        y: end.y - arrowLength * Math.sin(angle + Math.PI * 0.2)
      };
      basePoint2 = {
        x: end.x - arrowLength * Math.cos(angle - Math.PI * 0.2),
        y: end.y - arrowLength * Math.sin(angle - Math.PI * 0.2)
      };
    }

    return new fabric.Polygon([arrowPoint, basePoint1, basePoint2], {
      fill: this.style.lineColor,
      stroke: this.style.lineColor,
      strokeWidth: 1,
      selectable: false,
      evented: false
    });
  }

  private createDimensionText(text: string, position: { x: number; y: number }, segment: LineSegment): fabric.Text {
    // Calculate text position with offset
    const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x);
    const perpAngle = angle + Math.PI / 2;
    
    const textPosition = {
      x: position.x + Math.cos(perpAngle) * this.style.textOffset,
      y: position.y + Math.sin(perpAngle) * this.style.textOffset
    };

    return new fabric.Text(text, {
      left: textPosition.x,
      top: textPosition.y,
      fontSize: this.style.textSize,
      fill: this.style.textColor,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: 4,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      angle: this.getTextAngle(angle)
    });
  }

  private createRunningDimensionText(text: string, position: { x: number; y: number }): fabric.Text {
    return new fabric.Text(text, {
      left: position.x,
      top: position.y - 25,
      fontSize: this.style.textSize * 0.8,
      fill: this.style.textColor,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 3,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      fontStyle: 'italic'
    });
  }

  private createTotalDimensionText(text: string, position: { x: number; y: number }): fabric.Text {
    return new fabric.Text(text, {
      left: position.x,
      top: position.y + 25,
      fontSize: this.style.textSize * 1.1,
      fill: this.style.textColor,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: 6,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      fontWeight: 'bold'
    });
  }

  private getTextAngle(lineAngle: number): number {
    // Keep text readable by ensuring it's never upside down
    let angle = lineAngle * (180 / Math.PI);
    
    // Normalize angle to -180 to 180
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    
    // Flip text if it would be upside down
    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    
    return angle;
  }

  /**
   * Update the distance measurement with new segments
   */
  updateSegments(segments: LineSegment[], totalDistance: number): void {
    this.segments = segments;
    this.totalDistance = totalDistance;
    this.createGeometry();
  }

  /**
   * Update the measurement style
   */
  updateStyle(style: Partial<DimensionStyle>): void {
    this.style = { ...this.style, ...style };
    this.createGeometry();
  }

  /**
   * Update the unit and precision
   */
  updateUnit(unit: MeasurementUnit, precision: number): void {
    this.unit = unit;
    this.precision = precision;
    
    // Recalculate segments with new unit
    this.segments = this.segments.map(segment => ({
      ...segment,
      distance: UnitConverter.convert(segment.distance, this.unit, unit),
      unit
    }));
    
    this.totalDistance = UnitConverter.convert(this.totalDistance, this.unit, unit);
    
    this.createGeometry();
  }

  /**
   * Toggle running dimensions display
   */
  toggleRunningDimensions(show: boolean): void {
    this.showRunningDimensions = show;
    this.createGeometry();
  }

  /**
   * Get measurement data
   */
  getMeasurementData(): {
    segments: LineSegment[];
    totalDistance: number;
    unit: MeasurementUnit;
    precision: number;
  } {
    return {
      segments: [...this.segments],
      totalDistance: this.totalDistance,
      unit: this.unit,
      precision: this.precision
    };
  }

  /**
   * Export measurement as JSON
   */
  exportData(): string {
    return JSON.stringify({
      type: 'distance',
      ...this.getMeasurementData(),
      style: this.style,
      showRunningDimensions: this.showRunningDimensions,
      createdAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Create a distance object from JSON data
   */
  static fromJSON(data: any): DistanceObject {
    return new DistanceObject({
      segments: data.segments,
      totalDistance: data.totalDistance,
      unit: data.unit,
      precision: data.precision,
      style: data.style,
      showRunningDimensions: data.showRunningDimensions
    });
  }
}