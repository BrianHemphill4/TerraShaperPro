import { fabric } from 'fabric';
import { AreaMeasurement, HoleMeasurement, MeasurementUnit, DimensionStyle } from '../../measurement/types';
import { UnitConverter } from '../../measurement/UnitConverter';
import { GeometryUtils } from '../../measurement/GeometryCalculations';

export interface AreaObjectOptions extends fabric.IGroupOptions {
  outline: { x: number; y: number }[];
  holes: { x: number; y: number }[][];
  area: number;
  perimeter: number;
  netArea: number;
  unit: MeasurementUnit;
  precision: number;
  style: DimensionStyle;
  showPerimeter: boolean;
  showHoleAreas: boolean;
  isMeasurement?: boolean;
}

export class AreaObject extends fabric.Group {
  public outline: { x: number; y: number }[];
  public holes: { x: number; y: number }[][];
  public area: number;
  public perimeter: number;
  public netArea: number;
  public unit: MeasurementUnit;
  public precision: number;
  public style: DimensionStyle;
  public showPerimeter: boolean;
  public showHoleAreas: boolean;

  private mainPolygon: fabric.Polygon | null = null;
  private holePolygons: fabric.Polygon[] = [];
  private perimeterLines: fabric.Line[] = [];
  private texts: fabric.Text[] = [];

  constructor(options: AreaObjectOptions) {
    super([], options);
    
    this.outline = options.outline;
    this.holes = options.holes || [];
    this.area = options.area;
    this.perimeter = options.perimeter;
    this.netArea = options.netArea;
    this.unit = options.unit;
    this.precision = options.precision;
    this.style = options.style;
    this.showPerimeter = options.showPerimeter;
    this.showHoleAreas = options.showHoleAreas;
    
    // Mark as measurement object
    (this as any).isMeasurement = true;
    
    this.createGeometry();
  }

  private createGeometry(): void {
    this.clear();
    this.mainPolygon = null;
    this.holePolygons = [];
    this.perimeterLines = [];
    this.texts = [];

    this.createMainPolygon();
    this.createHolePolygons();
    
    if (this.showPerimeter) {
      this.createPerimeterDimensions();
    }
    
    this.createAreaLabels();
  }

  private createMainPolygon(): void {
    if (this.outline.length < 3) return;

    this.mainPolygon = new fabric.Polygon(this.outline, {
      fill: `${this.style.lineColor}20`, // Semi-transparent fill
      stroke: this.style.lineColor,
      strokeWidth: this.style.lineWidth,
      selectable: false,
      evented: false,
      opacity: 0.6
    });

    this.addWithUpdate(this.mainPolygon);
  }

  private createHolePolygons(): void {
    this.holes.forEach((hole, index) => {
      if (hole.length < 3) return;

      const holePolygon = new fabric.Polygon(hole, {
        fill: 'white', // White fill to create "hole" effect
        stroke: this.style.lineColor,
        strokeWidth: this.style.lineWidth,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        opacity: 0.9
      });

      this.holePolygons.push(holePolygon);
      this.addWithUpdate(holePolygon);

      // Add hole area label if enabled
      if (this.showHoleAreas) {
        const holeArea = GeometryUtils.calculatePolygonArea(hole);
        const holeCentroid = GeometryUtils.calculatePolygonCentroid(hole);
        const areaUnit = this.getAreaUnit();
        
        const holeText = new fabric.Text(
          `Hole ${index + 1}: -${UnitConverter.formatMeasurement(holeArea, areaUnit, this.precision)}`,
          {
            left: holeCentroid.x,
            top: holeCentroid.y,
            fontSize: this.style.textSize * 0.8,
            fill: this.style.textColor,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 3,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            fontStyle: 'italic'
          }
        );

        this.texts.push(holeText);
        this.addWithUpdate(holeText);
      }
    });
  }

  private createPerimeterDimensions(): void {
    if (this.outline.length < 2) return;

    // Create dimension lines for the perimeter
    for (let i = 0; i < this.outline.length; i++) {
      const start = this.outline[i];
      const end = this.outline[(i + 1) % this.outline.length];
      
      const distance = GeometryUtils.calculateDistance(start, end);
      const linearUnit = UnitConverter.getLinearUnitForArea(this.unit);
      
      // Create dimension line offset from the polygon edge
      const midpoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
      };
      
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const perpAngle = angle + Math.PI / 2;
      const offset = 20; // Offset distance from polygon edge
      
      const dimensionStart = {
        x: start.x + Math.cos(perpAngle) * offset,
        y: start.y + Math.sin(perpAngle) * offset
      };
      
      const dimensionEnd = {
        x: end.x + Math.cos(perpAngle) * offset,
        y: end.y + Math.sin(perpAngle) * offset
      };

      // Main dimension line
      const dimensionLine = new fabric.Line([
        dimensionStart.x, dimensionStart.y,
        dimensionEnd.x, dimensionEnd.y
      ], {
        stroke: this.style.lineColor,
        strokeWidth: this.style.lineWidth * 0.8,
        selectable: false,
        evented: false
      });

      this.perimeterLines.push(dimensionLine);
      this.addWithUpdate(dimensionLine);

      // Extension lines
      const extensionLine1 = new fabric.Line([
        start.x, start.y,
        dimensionStart.x, dimensionStart.y
      ], {
        stroke: this.style.lineColor,
        strokeWidth: this.style.lineWidth * 0.6,
        strokeDashArray: [3, 3],
        selectable: false,
        evented: false
      });

      const extensionLine2 = new fabric.Line([
        end.x, end.y,
        dimensionEnd.x, dimensionEnd.y
      ], {
        stroke: this.style.lineColor,
        strokeWidth: this.style.lineWidth * 0.6,
        strokeDashArray: [3, 3],
        selectable: false,
        evented: false
      });

      this.perimeterLines.push(extensionLine1, extensionLine2);
      this.addWithUpdate(extensionLine1);
      this.addWithUpdate(extensionLine2);

      // Dimension text
      const textPosition = {
        x: (dimensionStart.x + dimensionEnd.x) / 2,
        y: (dimensionStart.y + dimensionEnd.y) / 2
      };

      const dimensionText = new fabric.Text(
        UnitConverter.formatMeasurement(distance, linearUnit, this.precision),
        {
          left: textPosition.x,
          top: textPosition.y,
          fontSize: this.style.textSize * 0.8,
          fill: this.style.textColor,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          angle: this.getTextAngle(angle)
        }
      );

      this.texts.push(dimensionText);
      this.addWithUpdate(dimensionText);
    }
  }

  private createAreaLabels(): void {
    // Main area label
    const centroid = GeometryUtils.calculatePolygonCentroid(this.outline);
    const areaUnit = this.getAreaUnit();
    
    const mainAreaText = new fabric.Text(
      UnitConverter.formatMeasurement(this.area, areaUnit, this.precision),
      {
        left: centroid.x,
        top: centroid.y,
        fontSize: this.style.textSize * 1.2,
        fill: this.style.textColor,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 6,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        fontWeight: 'bold'
      }
    );

    this.texts.push(mainAreaText);
    this.addWithUpdate(mainAreaText);

    // Net area label (if different from main area due to holes)
    if (this.holes.length > 0 && this.netArea !== this.area) {
      const netAreaText = new fabric.Text(
        `Net: ${UnitConverter.formatMeasurement(this.netArea, areaUnit, this.precision)}`,
        {
          left: centroid.x,
          top: centroid.y + 25,
          fontSize: this.style.textSize,
          fill: this.style.textColor,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 4,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          fontWeight: 'bold'
        }
      );

      this.texts.push(netAreaText);
      this.addWithUpdate(netAreaText);
    }

    // Perimeter label
    if (this.showPerimeter) {
      const linearUnit = UnitConverter.getLinearUnitForArea(areaUnit);
      const perimeterText = new fabric.Text(
        `Perimeter: ${UnitConverter.formatMeasurement(this.perimeter, linearUnit, this.precision)}`,
        {
          left: centroid.x,
          top: centroid.y - 25,
          fontSize: this.style.textSize * 0.9,
          fill: this.style.textColor,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: 3,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        }
      );

      this.texts.push(perimeterText);
      this.addWithUpdate(perimeterText);
    }
  }

  private getAreaUnit(): MeasurementUnit {
    // Convert linear unit to area unit
    switch (this.unit) {
      case MeasurementUnit.MILLIMETERS:
        return MeasurementUnit.SQUARE_MILLIMETERS;
      case MeasurementUnit.CENTIMETERS:
        return MeasurementUnit.SQUARE_CENTIMETERS;
      case MeasurementUnit.METERS:
        return MeasurementUnit.SQUARE_METERS;
      case MeasurementUnit.KILOMETERS:
        return MeasurementUnit.SQUARE_KILOMETERS;
      case MeasurementUnit.INCHES:
        return MeasurementUnit.SQUARE_INCHES;
      case MeasurementUnit.FEET:
        return MeasurementUnit.SQUARE_FEET;
      case MeasurementUnit.YARDS:
        return MeasurementUnit.SQUARE_YARDS;
      default:
        return MeasurementUnit.SQUARE_FEET;
    }
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
   * Add a hole to the area measurement
   */
  addHole(holePoints: { x: number; y: number }[]): void {
    if (holePoints.length < 3) return;

    this.holes.push(holePoints);
    this.recalculateArea();
    this.createGeometry();
  }

  /**
   * Remove a hole by index
   */
  removeHole(index: number): void {
    if (index >= 0 && index < this.holes.length) {
      this.holes.splice(index, 1);
      this.recalculateArea();
      this.createGeometry();
    }
  }

  /**
   * Recalculate area and perimeter
   */
  private recalculateArea(): void {
    this.area = GeometryUtils.calculatePolygonArea(this.outline);
    this.perimeter = GeometryUtils.calculatePolygonPerimeter(this.outline);
    
    let holesArea = 0;
    this.holes.forEach(hole => {
      holesArea += GeometryUtils.calculatePolygonArea(hole);
    });
    
    this.netArea = Math.max(0, this.area - holesArea);
  }

  /**
   * Update the area measurement with new outline
   */
  updateOutline(outline: { x: number; y: number }[]): void {
    this.outline = outline;
    this.recalculateArea();
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
    const oldAreaUnit = this.getAreaUnit();
    this.unit = unit;
    this.precision = precision;
    const newAreaUnit = this.getAreaUnit();
    
    // Convert area values
    this.area = UnitConverter.convert(this.area, oldAreaUnit, newAreaUnit);
    this.netArea = UnitConverter.convert(this.netArea, oldAreaUnit, newAreaUnit);
    
    // Convert perimeter
    const oldLinearUnit = UnitConverter.getLinearUnitForArea(oldAreaUnit);
    const newLinearUnit = UnitConverter.getLinearUnitForArea(newAreaUnit);
    this.perimeter = UnitConverter.convert(this.perimeter, oldLinearUnit, newLinearUnit);
    
    this.createGeometry();
  }

  /**
   * Toggle perimeter display
   */
  togglePerimeter(show: boolean): void {
    this.showPerimeter = show;
    this.createGeometry();
  }

  /**
   * Toggle hole area labels
   */
  toggleHoleAreas(show: boolean): void {
    this.showHoleAreas = show;
    this.createGeometry();
  }

  /**
   * Get measurement data
   */
  getMeasurementData(): AreaMeasurement {
    const holesMeasurements: HoleMeasurement[] = this.holes.map(hole => ({
      points: hole,
      area: GeometryUtils.calculatePolygonArea(hole),
      perimeter: GeometryUtils.calculatePolygonPerimeter(hole)
    }));

    return {
      id: crypto.randomUUID(),
      area: this.area,
      perimeter: this.perimeter,
      holes: holesMeasurements,
      netArea: this.netArea,
      unit: this.getAreaUnit(),
      precision: this.precision,
      createdAt: new Date()
    };
  }

  /**
   * Export measurement as JSON
   */
  exportData(): string {
    return JSON.stringify({
      type: 'area',
      outline: this.outline,
      holes: this.holes,
      ...this.getMeasurementData(),
      style: this.style,
      showPerimeter: this.showPerimeter,
      showHoleAreas: this.showHoleAreas,
      createdAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Create an area object from JSON data
   */
  static fromJSON(data: any): AreaObject {
    return new AreaObject({
      outline: data.outline,
      holes: data.holes || [],
      area: data.area,
      perimeter: data.perimeter,
      netArea: data.netArea,
      unit: data.unit,
      precision: data.precision,
      style: data.style,
      showPerimeter: data.showPerimeter,
      showHoleAreas: data.showHoleAreas
    });
  }
}