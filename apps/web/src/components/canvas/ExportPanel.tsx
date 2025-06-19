'use client';

import type { fabric } from 'fabric';
import { useCallback, useState } from 'react';

import styles from './ExportPanel.module.css';

type ExportPanelProps = {
  canvas: fabric.Canvas | null;
  projectName?: string;
};

type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';
type ExportQuality = 'low' | 'medium' | 'high' | 'print';

const qualitySettings = {
  low: { multiplier: 1, quality: 0.6 },
  medium: { multiplier: 2, quality: 0.8 },
  high: { multiplier: 3, quality: 0.9 },
  print: { multiplier: 4, quality: 1 },
};

const ExportPanel = ({ canvas, projectName = 'landscape-design' }: ExportPanelProps) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState<ExportQuality>('high');
  const [includeGrid, setIncludeGrid] = useState(false);
  const [includeMeasurements, setIncludeMeasurements] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportImage = useCallback(async (format: 'png' | 'jpg') => {
    if (!canvas) return;
    
    setIsExporting(true);
    
    try {
      const settings = qualitySettings[exportQuality];
      
      // Hide elements based on settings
      const objectsToHide: fabric.Object[] = [];
      
      canvas.getObjects().forEach((obj) => {
        if (!includeGrid && (obj as any).evented === false && obj.type === 'line') {
          objectsToHide.push(obj);
          obj.set('visible', false);
        }
        if (!includeMeasurements && (obj as any).isMeasurement) {
          objectsToHide.push(obj);
          obj.set('visible', false);
        }
      });
      
      canvas.renderAll();
      
      // Export with quality settings
      const dataUrl = canvas.toDataURL({
        format,
        quality: settings.quality,
        multiplier: settings.multiplier,
      });
      
      // Restore hidden objects
      objectsToHide.forEach((obj) => {
        obj.set('visible', true);
      });
      canvas.renderAll();
      
      // Download the file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${projectName}-${timestamp}.${format}`;
      downloadFile(dataUrl, filename);
    } finally {
      setIsExporting(false);
    }
  }, [canvas, exportQuality, includeGrid, includeMeasurements, projectName, downloadFile]);

  const exportSVG = useCallback(() => {
    if (!canvas) return;
    
    setIsExporting(true);
    
    try {
      // Hide elements based on settings
      const objectsToHide: fabric.Object[] = [];
      
      canvas.getObjects().forEach((obj) => {
        if (!includeGrid && (obj as any).evented === false && obj.type === 'line') {
          objectsToHide.push(obj);
          obj.set('visible', false);
        }
        if (!includeMeasurements && (obj as any).isMeasurement) {
          objectsToHide.push(obj);
          obj.set('visible', false);
        }
      });
      
      canvas.renderAll();
      
      // Export SVG
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Restore hidden objects
      objectsToHide.forEach((obj) => {
        obj.set('visible', true);
      });
      canvas.renderAll();
      
      // Download the file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${projectName}-${timestamp}.svg`;
      downloadFile(url, filename);
      
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [canvas, includeGrid, includeMeasurements, projectName, downloadFile]);

  const exportPDF = useCallback(() => {
    if (!canvas) return;
    
    setIsExporting(true);
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // eslint-disable-next-line no-alert
        window.alert('Please allow popups to export as PDF');
        return;
      }
      
      // Get high-quality image data
      const settings = qualitySettings.print;
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: settings.quality,
        multiplier: settings.multiplier,
      });
      
      // Create print-friendly HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${projectName}</title>
          <style>
            @page {
              size: landscape;
              margin: 0.5in;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
            @media print {
              body {
                min-height: auto;
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="${projectName}" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
    } finally {
      setIsExporting(false);
    }
  }, [canvas, projectName]);

  const handleExport = useCallback(() => {
    switch (exportFormat) {
      case 'png':
        exportImage('png');
        break;
      case 'jpg':
        exportImage('jpg');
        break;
      case 'svg':
        exportSVG();
        break;
      case 'pdf':
        exportPDF();
        break;
    }
  }, [exportFormat, exportImage, exportSVG, exportPDF]);

  const shareProject = useCallback(() => {
    if (!canvas) return;
    
    // Generate a shareable link (this would typically involve saving to a server)
    const projectData = canvas.toJSON(['id', 'layerId', 'material', 'plantId', 'plantName']);
    const encodedData = btoa(JSON.stringify(projectData));
    
    // Create a shareable URL (in production, this would be a proper URL)
    const shareUrl = `${window.location.origin}/shared/${encodedData.slice(0, 20)}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      // TODO: Replace with proper notification system
      // For now, we'll silently succeed
    });
  }, [canvas]);

  return (
    <div className={styles.exportPanel}>
      <h3>Export Options</h3>
      
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Format</div>
        <div className={styles.formatOptions}>
          <button
            type="button"
            className={`${styles.formatButton} ${exportFormat === 'png' ? styles.active : ''}`}
            onClick={() => setExportFormat('png')}
          >
            PNG
          </button>
          <button
            type="button"
            className={`${styles.formatButton} ${exportFormat === 'jpg' ? styles.active : ''}`}
            onClick={() => setExportFormat('jpg')}
          >
            JPG
          </button>
          <button
            type="button"
            className={`${styles.formatButton} ${exportFormat === 'svg' ? styles.active : ''}`}
            onClick={() => setExportFormat('svg')}
          >
            SVG
          </button>
          <button
            type="button"
            className={`${styles.formatButton} ${exportFormat === 'pdf' ? styles.active : ''}`}
            onClick={() => setExportFormat('pdf')}
          >
            PDF
          </button>
        </div>
      </div>
      
      {(exportFormat === 'png' || exportFormat === 'jpg') && (
        <div className={styles.section}>
          <label htmlFor="export-quality">Quality</label>
          <select
            id="export-quality"
            className={styles.qualitySelect}
            value={exportQuality}
            onChange={(e) => setExportQuality(e.target.value as ExportQuality)}
          >
            <option value="low">Low (1x)</option>
            <option value="medium">Medium (2x)</option>
            <option value="high">High (3x)</option>
            <option value="print">Print (4x)</option>
          </select>
        </div>
      )}
      
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Include</div>
        <div className={styles.checkboxes}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
            />
            Grid lines
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={includeMeasurements}
              onChange={(e) => setIncludeMeasurements(e.target.checked)}
            />
            Measurements
          </label>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.exportButton}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        <button
          type="button"
          className={styles.shareButton}
          onClick={shareProject}
          title="Share project"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 6 12 2 8 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="2" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;