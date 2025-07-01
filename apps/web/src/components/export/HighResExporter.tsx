'use client';

import { fabric } from 'fabric';
import { useCallback } from 'react';

import type { ExportFormat, ExportPreset } from './ExportPresetManager';

interface HighResExporterProps {
  canvas: fabric.Canvas;
  preset: ExportPreset;
  onProgress?: (progress: number) => void;
  onComplete?: (results: ExportResult[]) => void;
  onError?: (error: Error) => void;
}

interface ExportResult {
  format: ExportFormat;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  dpi: number;
  fileSize: number;
}

export class HighResExporter {
  private canvas: fabric.Canvas;
  private preset: ExportPreset;
  private onProgress?: (progress: number) => void;

  constructor(
    canvas: fabric.Canvas,
    preset: ExportPreset,
    onProgress?: (progress: number) => void
  ) {
    this.canvas = canvas;
    this.preset = preset;
    this.onProgress = onProgress;
  }

  async exportAll(): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    const totalFormats = this.preset.formats.length;

    for (let i = 0; i < totalFormats; i++) {
      const format = this.preset.formats[i];
      const progressBase = (i / totalFormats) * 100;
      const progressStep = 100 / totalFormats;

      try {
        const result = await this.exportFormat(format, (progress) => {
          this.onProgress?.(progressBase + (progress * progressStep) / 100);
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to export ${format}:`, error);
        throw error;
      }
    }

    return results;
  }

  async exportFormat(
    format: ExportFormat,
    onProgress?: (progress: number) => void
  ): Promise<ExportResult> {
    onProgress?.(0);

    // Prepare canvas for export
    const objectsToHide = this.prepareCanvasForExport();
    onProgress?.(20);

    let blob: Blob;
    let filename: string;

    try {
      switch (format) {
        case 'png':
          blob = await this.exportPNG();
          filename = this.generateFilename('png');
          break;
        case 'jpg':
          blob = await this.exportJPG();
          filename = this.generateFilename('jpg');
          break;
        case 'svg':
          blob = await this.exportSVG();
          filename = this.generateFilename('svg');
          break;
        case 'pdf':
          throw new Error('PDF export should use PDFExporter');
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      onProgress?.(80);
    } finally {
      // Restore hidden objects
      this.restoreHiddenObjects(objectsToHide);
      onProgress?.(100);
    }

    return {
      format,
      blob,
      filename,
      width: this.preset.dimensions.width,
      height: this.preset.dimensions.height,
      dpi: this.preset.dpi,
      fileSize: blob.size,
    };
  }

  private prepareCanvasForExport(): fabric.Object[] {
    const objectsToHide: fabric.Object[] = [];

    this.canvas.getObjects().forEach((obj) => {
      let shouldHide = false;

      // Hide grid if not included
      if (!this.preset.includeElements.grid && 
          (obj as any).evented === false && 
          obj.type === 'line') {
        shouldHide = true;
      }

      // Hide measurements if not included
      if (!this.preset.includeElements.measurements && (obj as any).isMeasurement) {
        shouldHide = true;
      }

      // Hide annotations if not included
      if (!this.preset.includeElements.annotations && (obj as any).isAnnotation) {
        shouldHide = true;
      }

      // Hide specific layers if they're not in the include list
      if (this.preset.includeElements.layers.length > 0) {
        const objLayerId = (obj as any).layerId;
        if (objLayerId && !this.preset.includeElements.layers.includes(objLayerId)) {
          shouldHide = true;
        }
      }

      if (shouldHide) {
        objectsToHide.push(obj);
        obj.set('visible', false);
      }
    });

    this.canvas.renderAll();
    return objectsToHide;
  }

  private restoreHiddenObjects(objectsToHide: fabric.Object[]): void {
    objectsToHide.forEach((obj) => {
      obj.set('visible', true);
    });
    this.canvas.renderAll();
  }

  private async exportPNG(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const multiplier = this.calculateMultiplier();
        
        const dataUrl = this.canvas.toDataURL({
          format: 'png',
          quality: this.getQualityValue(),
          multiplier,
          width: this.preset.dimensions.width,
          height: this.preset.dimensions.height,
        });

        this.dataUrlToBlob(dataUrl)
          .then(resolve)
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async exportJPG(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const multiplier = this.calculateMultiplier();
        
        // For JPG, set a background color if canvas is transparent
        const originalBackground = this.canvas.backgroundColor;
        if (!originalBackground || originalBackground === 'transparent') {
          this.canvas.setBackgroundColor('#ffffff', () => {
            this.canvas.renderAll();
            this.generateJPGDataUrl(multiplier)
              .then(dataUrl => this.dataUrlToBlob(dataUrl))
              .then(resolve)
              .catch(reject)
              .finally(() => {
                // Restore original background
                this.canvas.setBackgroundColor(originalBackground, () => {
                  this.canvas.renderAll();
                });
              });
          });
        } else {
          this.generateJPGDataUrl(multiplier)
            .then(dataUrl => this.dataUrlToBlob(dataUrl))
            .then(resolve)
            .catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private generateJPGDataUrl(multiplier: number): Promise<string> {
    return new Promise((resolve) => {
      const dataUrl = this.canvas.toDataURL({
        format: 'jpeg',
        quality: this.getQualityValue(),
        multiplier,
        width: this.preset.dimensions.width,
        height: this.preset.dimensions.height,
      });
      resolve(dataUrl);
    });
  }

  private async exportSVG(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const svgString = this.canvas.toSVG({
          width: this.preset.dimensions.width,
          height: this.preset.dimensions.height,
          viewBox: {
            x: 0,
            y: 0,
            width: this.preset.dimensions.width,
            height: this.preset.dimensions.height,
          },
        });

        // Optimize SVG for high-resolution output
        const optimizedSVG = this.optimizeSVG(svgString);
        
        const blob = new Blob([optimizedSVG], { type: 'image/svg+xml' });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  private optimizeSVG(svgString: string): string {
    // Add DPI information to SVG
    const dpiComment = `<!-- Generated at ${this.preset.dpi} DPI -->`;
    
    // Set proper dimensions and viewBox for high-resolution
    const width = this.preset.dimensions.width;
    const height = this.preset.dimensions.height;
    
    let optimized = svgString.replace(
      /<svg[^>]*>/,
      `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`
    );

    // Add DPI comment at the beginning
    optimized = optimized.replace('<svg', `${dpiComment}\n<svg`);

    // Add high-resolution rendering hints
    optimized = optimized.replace(
      '<svg',
      '<svg shape-rendering="geometricPrecision" text-rendering="geometricPrecision"'
    );

    return optimized;
  }

  private calculateMultiplier(): number {
    // Calculate multiplier based on target DPI and quality
    const baseDPI = 72; // Default screen DPI
    const dpiMultiplier = this.preset.dpi / baseDPI;
    
    const qualityMultipliers = {
      low: 1,
      medium: 1.5,
      high: 2,
      print: 2.5,
    };

    return dpiMultiplier * qualityMultipliers[this.preset.quality];
  }

  private getQualityValue(): number {
    const qualityValues = {
      low: 0.6,
      medium: 0.8,
      high: 0.9,
      print: 1.0,
    };

    return qualityValues[this.preset.quality];
  }

  private generateFilename(extension: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const dimensions = `${this.preset.dimensions.width}x${this.preset.dimensions.height}`;
    const dpi = `${this.preset.dpi}dpi`;
    
    return `export-${timestamp}-${dimensions}-${dpi}.${extension}`;
  }

  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(arr[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);

        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }

        resolve(new Blob([u8arr], { type: mime }));
      } catch (error) {
        reject(error);
      }
    });
  }
}

const HighResExporterComponent = ({
  canvas,
  preset,
  onProgress,
  onComplete,
  onError,
}: HighResExporterProps) => {
  const exportHighRes = useCallback(async () => {
    try {
      const exporter = new HighResExporter(canvas, preset, onProgress);
      const results = await exporter.exportAll();
      onComplete?.(results);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [canvas, preset, onProgress, onComplete, onError]);

  // This component doesn't render anything, it's just for the export logic
  return null;
};

export default HighResExporterComponent;