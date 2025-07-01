'use client';

import { useState, useCallback } from 'react';

import { useMaskStore } from '@/stores/useMaskStore';
import { useMeasurementStore } from '@/stores/useMeasurementStore';
import { useLayerStore } from '@/stores/useLayerStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { useToast } from '@/hooks/use-toast';

import { ExportPresetManager } from '@/components/export/ExportPresetManager';
import { PDFExporter } from '@/components/export/PDFExporter';
import { HighResExporter } from '@/components/export/HighResExporter';
import { BatchExporter } from '@/components/export/BatchExporter';

import type { ExportFormat, ExportOptions } from '@/types/export';

interface AnnotationExportProps {
  canvas: fabric.Canvas | null;
  projectId: string;
  onExportComplete?: (format: ExportFormat, url: string) => void;
}

export const AnnotationExport = ({
  canvas,
  projectId,
  onExportComplete,
}: AnnotationExportProps) => {
  const { toast } = useToast();
  const { masks } = useMaskStore();
  const { measurements } = useMeasurementStore();
  const { layers } = useLayerStore();
  const { getCurrentScene } = useSceneStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');

  const currentScene = getCurrentScene();

  // Generate annotation data for export
  const generateAnnotationData = useCallback(() => {
    if (!currentScene) return null;

    // Convert masks to GeoJSON format
    const maskGeoJSON = {
      type: 'FeatureCollection',
      features: masks
        .filter(mask => mask.sceneId === currentScene.id && !mask.deleted)
        .map(mask => ({
          type: 'Feature',
          geometry: {
            type: mask.type === 'polygon' ? 'Polygon' : 'LineString',
            coordinates: mask.path,
          },
          properties: {
            id: mask.id,
            category: mask.category,
            authorId: mask.authorId,
            createdAt: mask.createdAt,
            updatedAt: mask.updatedAt,
          },
        })),
    };

    // Collect measurement data
    const measurementData = measurements
      .filter(m => m.sceneId === currentScene.id)
      .map(m => ({
        id: m.id,
        type: m.type,
        value: m.value,
        unit: m.unit,
        points: m.points,
        label: m.label,
      }));

    // Collect layer information
    const layerData = layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity,
      objectCount: layer.objects?.length || 0,
    }));

    return {
      sceneId: currentScene.id,
      sceneName: currentScene.filename,
      exportDate: new Date().toISOString(),
      masks: maskGeoJSON,
      measurements: measurementData,
      layers: layerData,
      statistics: {
        totalMasks: maskGeoJSON.features.length,
        totalMeasurements: measurementData.length,
        categories: [...new Set(masks.map(m => m.category))],
      },
    };
  }, [currentScene, masks, measurements, layers]);

  // Handle export with annotation data
  const handleExport = useCallback(async (options: ExportOptions) => {
    if (!canvas || !currentScene) return;

    setIsExporting(true);

    try {
      // Generate annotation data
      const annotationData = generateAnnotationData();

      // Create export based on format
      let exportUrl: string;

      switch (options.format) {
        case 'pdf':
          exportUrl = await exportToPDF(canvas, options, annotationData);
          break;
        case 'svg':
          exportUrl = await exportToSVG(canvas, options, annotationData);
          break;
        case 'json':
          exportUrl = await exportToJSON(annotationData);
          break;
        case 'geojson':
          exportUrl = await exportToGeoJSON(annotationData);
          break;
        default:
          exportUrl = await exportToImage(canvas, options, annotationData);
      }

      // Notify success
      toast({
        title: 'Export complete',
        description: `Your annotation has been exported as ${options.format.toUpperCase()}.`,
        variant: 'default',
      });

      onExportComplete?.(options.format, exportUrl);
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export annotation.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [canvas, currentScene, generateAnnotationData, toast, onExportComplete]);

  // Export to PDF with annotations
  const exportToPDF = async (
    canvas: fabric.Canvas,
    options: ExportOptions,
    annotationData: any
  ): Promise<string> => {
    // Implementation would use PDFExporter component
    // For now, return placeholder
    return '#';
  };

  // Export to SVG with annotations
  const exportToSVG = async (
    canvas: fabric.Canvas,
    options: ExportOptions,
    annotationData: any
  ): Promise<string> => {
    const svg = canvas.toSVG();
    // Add annotation metadata to SVG
    const svgWithMetadata = svg.replace(
      '</svg>',
      `<metadata>${JSON.stringify(annotationData, null, 2)}</metadata></svg>`
    );
    const blob = new Blob([svgWithMetadata], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  };

  // Export annotation data as JSON
  const exportToJSON = async (annotationData: any): Promise<string> => {
    const blob = new Blob([JSON.stringify(annotationData, null, 2)], {
      type: 'application/json',
    });
    return URL.createObjectURL(blob);
  };

  // Export masks as GeoJSON
  const exportToGeoJSON = async (annotationData: any): Promise<string> => {
    const blob = new Blob([JSON.stringify(annotationData.masks, null, 2)], {
      type: 'application/geo+json',
    });
    return URL.createObjectURL(blob);
  };

  // Export to image with embedded metadata
  const exportToImage = async (
    canvas: fabric.Canvas,
    options: ExportOptions,
    annotationData: any
  ): Promise<string> => {
    // Get canvas data URL
    const dataUrl = canvas.toDataURL({
      format: options.format as 'png' | 'jpeg',
      quality: options.quality || 0.9,
      multiplier: options.scale || 1,
    });

    // For PNG, we could embed metadata in chunks
    // For now, return the data URL
    return dataUrl;
  };

  return (
    <>
      {/* Export Button */}
      <button
        type="button"
        onClick={() => setShowExportDialog(true)}
        disabled={!canvas || !currentScene}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Annotation
        </div>
      </button>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Export Annotation</h2>
                <button
                  type="button"
                  onClick={() => setShowExportDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Format Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Export Format</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { format: 'png', label: 'PNG Image', icon: '🖼️' },
                    { format: 'jpeg', label: 'JPEG Image', icon: '📷' },
                    { format: 'svg', label: 'SVG Vector', icon: '📐' },
                    { format: 'pdf', label: 'PDF Document', icon: '📄' },
                    { format: 'json', label: 'JSON Data', icon: '📊' },
                    { format: 'geojson', label: 'GeoJSON', icon: '🗺️' },
                  ].map(({ format, label, icon }) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setSelectedFormat(format as ExportFormat)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFormat === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Export Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Include masks and annotations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Include measurements</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Include layer information</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Include scene metadata</span>
                  </label>
                </div>
              </div>

              {/* Export Presets */}
              <div className="mb-6">
                <ExportPresetManager
                  onPresetSelect={(preset) => {
                    // Apply preset settings
                    console.log('Selected preset:', preset);
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExportDialog(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExport({ format: selectedFormat })}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnotationExport;