'use client';

import { fabric } from 'fabric';
import jsPDF from 'jspdf';
import { useCallback } from 'react';

import type { ExportPreset, TitleBlockConfig } from './ExportPresetManager';

interface PDFExporterProps {
  canvas: fabric.Canvas;
  preset: ExportPreset;
  projectName?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

interface Measurement {
  id: string;
  label: string;
  value: number;
  unit: string;
  type: 'distance' | 'area' | 'angle';
}

export class PDFExporter {
  private canvas: fabric.Canvas;
  private preset: ExportPreset;
  private projectName: string;
  private onProgress?: (progress: number) => void;

  constructor(
    canvas: fabric.Canvas,
    preset: ExportPreset,
    projectName: string = 'Landscape Design',
    onProgress?: (progress: number) => void
  ) {
    this.canvas = canvas;
    this.preset = preset;
    this.projectName = projectName;
    this.onProgress = onProgress;
  }

  async generatePDF(): Promise<Blob> {
    try {
      this.onProgress?.(0);

      const { layoutSettings } = this.preset;
      if (!layoutSettings) {
        throw new Error('PDF layout settings are required');
      }

      // Create jsPDF instance
      const pdf = new jsPDF({
        orientation: layoutSettings.orientation,
        unit: 'pt',
        format: layoutSettings.pageSize === 'Custom' ? 'a4' : layoutSettings.pageSize.toLowerCase(),
      });

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margins = layoutSettings.margins;

      this.onProgress?.(10);

      // Generate canvas image
      const canvasImage = await this.generateCanvasImage();
      this.onProgress?.(40);

      // Calculate available space for canvas
      const availableWidth = pageWidth - margins.left - margins.right;
      const availableHeight = pageHeight - margins.top - margins.bottom;
      
      // Reserve space for title block if enabled
      const titleBlockHeight = layoutSettings.titleBlock?.show ? 120 : 0;
      const canvasAreaHeight = availableHeight - titleBlockHeight;

      // Calculate canvas scaling
      const canvasScale = this.calculateCanvasScale(
        this.canvas.getWidth(),
        this.canvas.getHeight(),
        availableWidth,
        canvasAreaHeight
      );

      const scaledWidth = this.canvas.getWidth() * canvasScale;
      const scaledHeight = this.canvas.getHeight() * canvasScale;

      // Center the canvas image
      const canvasX = margins.left + (availableWidth - scaledWidth) / 2;
      const canvasY = margins.top;

      // Add canvas image to PDF
      pdf.addImage(
        canvasImage,
        'PNG',
        canvasX,
        canvasY,
        scaledWidth,
        scaledHeight
      );

      this.onProgress?.(60);

      // Add title block if enabled
      if (layoutSettings.titleBlock?.show) {
        this.addTitleBlock(pdf, layoutSettings.titleBlock, {
          x: margins.left,
          y: canvasY + scaledHeight + 20,
          width: availableWidth,
          height: titleBlockHeight - 20,
        });
      }

      this.onProgress?.(80);

      // Add measurements table if measurements are included
      if (this.preset.includeElements.measurements) {
        const measurements = this.extractMeasurements();
        if (measurements.length > 0) {
          this.addMeasurementsTable(pdf, measurements);
        }
      }

      this.onProgress?.(90);

      // Add additional pages if needed (for layer breakdowns, etc.)
      if (this.preset.includeElements.layers.length > 0) {
        await this.addLayerPages(pdf);
      }

      this.onProgress?.(100);

      // Convert to blob
      const pdfBlob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
      return pdfBlob;

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  private async generateCanvasImage(): Promise<string> {
    // Hide elements based on preset settings
    const objectsToHide: fabric.Object[] = [];

    this.canvas.getObjects().forEach((obj) => {
      if (!this.preset.includeElements.grid && (obj as any).evented === false && obj.type === 'line') {
        objectsToHide.push(obj);
        obj.set('visible', false);
      }
      if (!this.preset.includeElements.measurements && (obj as any).isMeasurement) {
        objectsToHide.push(obj);
        obj.set('visible', false);
      }
      if (!this.preset.includeElements.annotations && (obj as any).isAnnotation) {
        objectsToHide.push(obj);
        obj.set('visible', false);
      }
    });

    this.canvas.renderAll();

    // Generate high-quality image
    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: this.preset.dpi / 72, // Scale for target DPI
    });

    // Restore hidden objects
    objectsToHide.forEach((obj) => {
      obj.set('visible', true);
    });
    this.canvas.renderAll();

    return dataUrl;
  }

  private calculateCanvasScale(
    canvasWidth: number,
    canvasHeight: number,
    availableWidth: number,
    availableHeight: number
  ): number {
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    return Math.min(scaleX, scaleY, 1); // Don't scale up
  }

  private addTitleBlock(
    pdf: jsPDF,
    titleBlock: TitleBlockConfig,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    const { x, y, width, height } = bounds;
    
    // Draw title block border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(1);
    pdf.rect(x, y, width, height);

    // Title block content
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(titleBlock.projectName || this.projectName, x + 10, y + 20);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const leftColumn = x + 10;
    const rightColumn = x + width / 2 + 10;
    let currentY = y + 40;

    // Left column
    if (titleBlock.projectNumber) {
      pdf.text(`Project No: ${titleBlock.projectNumber}`, leftColumn, currentY);
      currentY += 15;
    }

    if (titleBlock.scale) {
      pdf.text(`Scale: ${titleBlock.scale}`, leftColumn, currentY);
      currentY += 15;
    }

    pdf.text(`Date: ${titleBlock.date || new Date().toLocaleDateString()}`, leftColumn, currentY);

    // Right column
    currentY = y + 40;
    if (titleBlock.drawnBy) {
      pdf.text(`Drawn by: ${titleBlock.drawnBy}`, rightColumn, currentY);
      currentY += 15;
    }

    if (titleBlock.checkedBy) {
      pdf.text(`Checked by: ${titleBlock.checkedBy}`, rightColumn, currentY);
    }
  }

  private extractMeasurements(): Measurement[] {
    const measurements: Measurement[] = [];
    
    this.canvas.getObjects().forEach((obj, index) => {
      if ((obj as any).isMeasurement) {
        const measurementData = (obj as any).measurementData;
        if (measurementData) {
          measurements.push({
            id: `M${index + 1}`,
            label: measurementData.label || `Measurement ${index + 1}`,
            value: measurementData.value || 0,
            unit: measurementData.unit || 'm',
            type: measurementData.type || 'distance',
          });
        }
      }
    });

    return measurements;
  }

  private addMeasurementsTable(pdf: jsPDF, measurements: Measurement[]): void {
    if (measurements.length === 0) return;

    // Add new page for measurements
    pdf.addPage();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margins = this.preset.layoutSettings?.margins || { top: 36, right: 36, bottom: 36, left: 36 };

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Measurements', margins.left, margins.top + 20);

    // Table setup
    const tableX = margins.left;
    const tableY = margins.top + 40;
    const tableWidth = pageWidth - margins.left - margins.right;
    const rowHeight = 20;
    const colWidths = [60, 200, 80, 60, 80]; // ID, Label, Value, Unit, Type

    // Table headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    const headers = ['ID', 'Description', 'Value', 'Unit', 'Type'];
    let currentX = tableX;
    
    headers.forEach((header, index) => {
      pdf.rect(currentX, tableY, colWidths[index], rowHeight);
      pdf.text(header, currentX + 5, tableY + 12);
      currentX += colWidths[index];
    });

    // Table rows
    pdf.setFont('helvetica', 'normal');
    measurements.forEach((measurement, rowIndex) => {
      const rowY = tableY + (rowIndex + 1) * rowHeight;
      currentX = tableX;

      const values = [
        measurement.id,
        measurement.label,
        measurement.value.toFixed(2),
        measurement.unit,
        measurement.type,
      ];

      values.forEach((value, colIndex) => {
        pdf.rect(currentX, rowY, colWidths[colIndex], rowHeight);
        pdf.text(value, currentX + 5, rowY + 12);
        currentX += colWidths[colIndex];
      });
    });
  }

  private async addLayerPages(pdf: jsPDF): Promise<void> {
    // Implementation for layer-specific pages would go here
    // This could include individual layer exports, layer legends, etc.
    console.log('Layer pages not yet implemented');
  }
}

const PDFExporterComponent = ({
  canvas,
  preset,
  projectName,
  onProgress,
  onComplete,
  onError,
}: PDFExporterProps) => {
  const exportPDF = useCallback(async () => {
    try {
      const exporter = new PDFExporter(canvas, preset, projectName, onProgress);
      const blob = await exporter.generatePDF();
      onComplete?.(blob);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [canvas, preset, projectName, onProgress, onComplete, onError]);

  // This component doesn't render anything, it's just for the export logic
  return null;
};

export default PDFExporterComponent;