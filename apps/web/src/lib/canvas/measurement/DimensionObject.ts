import { fabric } from 'fabric';
import { DimensionStyle, DimensionOptions, MeasurementUnit } from '../../measurement/types';
import { UnitConverter } from '../../measurement/UnitConverter';
import { GeometryUtils } from '../../measurement/GeometryCalculations';

export interface DimensionObjectOptions extends fabric.IGroupOptions {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  distance: number;
  unit: MeasurementUnit;
  precision: number;
  dimensionOptions: DimensionOptions;
  isMeasurement?: boolean;
}

export class DimensionObject extends fabric.Group {
  public startPoint: { x: number; y: number };
  public endPoint: { x: number; y: number };
  public distance: number;
  public unit: MeasurementUnit;
  public precision: number;
  public dimensionOptions: DimensionOptions;

  private dimensionLine: fabric.Line | null = null;
  private extensionLines: fabric.Line[] = [];
  private arrows: fabric.Polygon[] = [];
  private dimensionText: fabric.Text | null = null;

  constructor(options: DimensionObjectOptions) {
    super([], options);
    
    this.startPoint = options.startPoint;
    this.endPoint = options.endPoint;
    this.distance = options.distance;
    this.unit = options.unit;
    this.precision = options.precision;
    this.dimensionOptions = options.dimensionOptions;
    
    // Mark as measurement object
    (this as any).isMeasurement = true;
    
    this.createDimension();
  }

  private createDimension(): void {
    this.clear();
    this.dimensionLine = null;
    this.extensionLines = [];
    this.arrows = [];
    this.dimensionText = null;

    this.createDimensionLine();
    this.createExtensionLines();
    this.createArrows();
    this.createDimensionText();
  }

  private createDimensionLine(): void {
    const { startPoint, endPoint } = this.getDimensionLinePoints();
    
    this.dimensionLine = new fabric.Line([
      startPoint.x, startPoint.y,
      endPoint.x, endPoint.y
    ], {
      stroke: this.dimensionOptions.style.lineColor,
      strokeWidth: this.dimensionOptions.style.lineWidth,
      selectable: false,
      evented: false
    });

    this.addWithUpdate(this.dimensionLine);
  }

  private createExtensionLines(): void {
    if (!this.dimensionOptions.showExtensionLines) return;

    const { startPoint: dimStart, endPoint: dimEnd } = this.getDimensionLinePoints();
    const extensionLength = this.dimensionOptions.style.extensionLineLength;

    // Calculate extension line directions
    const angle = Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
    const perpAngle = angle + Math.PI / 2;

    // Extension line 1 (from start point to dimension line)
    const ext1Start = this.startPoint;
    const ext1End = {
      x: dimStart.x + Math.cos(perpAngle) * (extensionLength * 0.5),
      y: dimStart.y + Math.sin(perpAngle) * (extensionLength * 0.5)
    };

    const extensionLine1 = new fabric.Line([
      ext1Start.x, ext1Start.y,
      ext1End.x, ext1End.y
    ], {
      stroke: this.dimensionOptions.style.lineColor,
      strokeWidth: this.dimensionOptions.style.lineWidth * 0.7,
      selectable: false,
      evented: false
    });

    // Extension line 2 (from end point to dimension line)
    const ext2Start = this.endPoint;
    const ext2End = {
      x: dimEnd.x + Math.cos(perpAngle) * (extensionLength * 0.5),
      y: dimEnd.y + Math.sin(perpAngle) * (extensionLength * 0.5)
    };

    const extensionLine2 = new fabric.Line([
      ext2Start.x, ext2Start.y,
      ext2End.x, ext2End.y
    ], {
      stroke: this.dimensionOptions.style.lineColor,
      strokeWidth: this.dimensionOptions.style.lineWidth * 0.7,
      selectable: false,
      evented: false
    });

    this.extensionLines = [extensionLine1, extensionLine2];
    this.addWithUpdate(extensionLine1);
    this.addWithUpdate(extensionLine2);
  }

  private createArrows(): void {
    const { startPoint, endPoint } = this.getDimensionLinePoints();
    const arrowSize = this.dimensionOptions.style.arrowSize;
    
    // Calculate arrow angle
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

    // Start arrow
    const startArrow = this.createArrowHead(startPoint, angle, arrowSize);
    this.arrows.push(startArrow);
    this.addWithUpdate(startArrow);

    // End arrow
    const endArrow = this.createArrowHead(endPoint, angle + Math.PI, arrowSize);
    this.arrows.push(endArrow);
    this.addWithUpdate(endArrow);
  }

  private createArrowHead(
    point: { x: number; y: number }, 
    angle: number, 
    size: number
  ): fabric.Polygon {
    const arrowAngle = Math.PI / 6; // 30 degrees
    
    const points = [
      point,
      {
        x: point.x + size * Math.cos(angle + arrowAngle),
        y: point.y + size * Math.sin(angle + arrowAngle)
      },
      {
        x: point.x + size * Math.cos(angle - arrowAngle),
        y: point.y + size * Math.sin(angle - arrowAngle)
      }
    ];

    return new fabric.Polygon(points, {
      fill: this.dimensionOptions.style.lineColor,
      stroke: this.dimensionOptions.style.lineColor,
      strokeWidth: 1,
      selectable: false,
      evented: false
    });
  }

  private createDimensionText(): void {
    const text = UnitConverter.formatMeasurement(this.distance, this.unit, this.precision);
    const textPosition = this.calculateTextPosition();
    const textAngle = this.calculateTextAngle();

    this.dimensionText = new fabric.Text(text, {
      left: textPosition.x,
      top: textPosition.y,
      fontSize: this.dimensionOptions.style.textSize,
      fill: this.dimensionOptions.style.textColor,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: 4,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      angle: textAngle
    });

    this.addWithUpdate(this.dimensionText);
  }

  private getDimensionLinePoints(): { startPoint: { x: number; y: number }; endPoint: { x: number; y: number } } {
    // Calculate dimension line offset from the measured line
    const angle = Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
    const perpAngle = angle + Math.PI / 2;
    const offset = this.dimensionOptions.style.extensionLineLength;

    const startPoint = {
      x: this.startPoint.x + Math.cos(perpAngle) * offset,
      y: this.startPoint.y + Math.sin(perpAngle) * offset
    };

    const endPoint = {
      x: this.endPoint.x + Math.cos(perpAngle) * offset,
      y: this.endPoint.y + Math.sin(perpAngle) * offset
    };

    return { startPoint, endPoint };
  }

  private calculateTextPosition(): { x: number; y: number } {
    const { startPoint, endPoint } = this.getDimensionLinePoints();
    const midpoint = {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2
    };

    // Adjust position based on text position preference
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const perpAngle = angle + Math.PI / 2;
    
    let textOffset = 0;
    switch (this.dimensionOptions.textPosition) {
      case 'above':
        textOffset = -this.dimensionOptions.style.textOffset;
        break;
      case 'below':
        textOffset = this.dimensionOptions.style.textOffset;
        break;
      case 'center':
      default:
        textOffset = 0;
        break;
    }

    return {
      x: midpoint.x + Math.cos(perpAngle) * textOffset,
      y: midpoint.y + Math.sin(perpAngle) * textOffset
    };
  }

  private calculateTextAngle(): number {
    const { startPoint, endPoint } = this.getDimensionLinePoints();
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    
    // Convert to degrees
    let degrees = angle * (180 / Math.PI);
    
    // Normalize angle to -180 to 180
    while (degrees > 180) degrees -= 360;
    while (degrees < -180) degrees += 360;
    
    // Keep text readable by flipping if it would be upside down
    if (degrees > 90 || degrees < -90) {
      degrees += 180;
    }
    
    return degrees;
  }

  /**
   * Update dimension endpoints
   */
  updateEndpoints(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }): void {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.distance = GeometryUtils.calculateDistance(startPoint, endPoint);
    this.createDimension();
  }

  /**
   * Update dimension style
   */
  updateStyle(style: Partial<DimensionStyle>): void {
    this.dimensionOptions.style = { ...this.dimensionOptions.style, ...style };
    this.createDimension();
  }

  /**
   * Update dimension options
   */
  updateOptions(options: Partial<DimensionOptions>): void {
    this.dimensionOptions = { ...this.dimensionOptions, ...options };
    this.createDimension();
  }

  /**
   * Update measurement unit and precision
   */
  updateUnit(unit: MeasurementUnit, precision: number): void {
    this.unit = unit;
    this.precision = precision;
    this.createDimension();
  }

  /**
   * Set text position
   */
  setTextPosition(position: 'above' | 'below' | 'center'): void {
    this.dimensionOptions.textPosition = position;
    this.createDimension();
  }

  /**
   * Toggle extension lines
   */
  toggleExtensionLines(show: boolean): void {
    this.dimensionOptions.showExtensionLines = show;
    this.createDimension();
  }

  /**
   * Get dimension data
   */
  getDimensionData(): {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    distance: number;
    unit: MeasurementUnit;
    precision: number;
    options: DimensionOptions;
  } {
    return {
      startPoint: this.startPoint,
      endPoint: this.endPoint,
      distance: this.distance,
      unit: this.unit,
      precision: this.precision,
      options: this.dimensionOptions
    };
  }

  /**
   * Check if a point is near the dimension line for selection
   */
  isPointNearDimension(point: { x: number; y: number }, threshold: number = 10): boolean {
    const { startPoint, endPoint } = this.getDimensionLinePoints();
    const closestPoint = GeometryUtils.closestPointOnLine(point, startPoint, endPoint);
    return GeometryUtils.calculateDistance(point, closestPoint) <= threshold;
  }

  /**
   * Get the measurement value as formatted text
   */
  getFormattedValue(): string {
    return UnitConverter.formatMeasurement(this.distance, this.unit, this.precision);
  }

  /**
   * Export dimension as JSON
   */
  exportData(): string {
    return JSON.stringify({
      type: 'dimension',
      ...this.getDimensionData(),
      createdAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Create a dimension object from JSON data
   */
  static fromJSON(data: any): DimensionObject {
    return new DimensionObject({
      startPoint: data.startPoint,
      endPoint: data.endPoint,
      distance: data.distance,
      unit: data.unit,
      precision: data.precision,
      dimensionOptions: data.options
    });
  }

  /**
   * Create dimension from two fabric objects
   */
  static fromObjects(
    obj1: fabric.Object, 
    obj2: fabric.Object, 
    options: Partial<DimensionObjectOptions> = {}
  ): DimensionObject {
    const bounds1 = obj1.getBoundingRect();
    const bounds2 = obj2.getBoundingRect();
    
    const center1 = {
      x: bounds1.left + bounds1.width / 2,
      y: bounds1.top + bounds1.height / 2
    };
    
    const center2 = {
      x: bounds2.left + bounds2.width / 2,
      y: bounds2.top + bounds2.height / 2
    };
    
    const distance = GeometryUtils.calculateDistance(center1, center2);
    
    return new DimensionObject({
      startPoint: center1,
      endPoint: center2,
      distance,
      unit: options.unit || MeasurementUnit.FEET,
      precision: options.precision || 2,
      dimensionOptions: options.dimensionOptions || {
        textPosition: 'above',
        style: {
          lineColor: '#3b82f6',
          lineWidth: 2,
          arrowSize: 8,
          textSize: 14,
          textColor: '#374151',
          extensionLineLength: 20,
          textOffset: 10
        },
        showExtensionLines: true,
        precision: 2
      },
      ...options
    });
  }
}