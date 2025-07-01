'use client';

import { fabric } from 'fabric';
import { useCallback, useState } from 'react';

import { HighResExporter } from './HighResExporter';
import { PDFExporter } from './PDFExporter';
import type { ExportPreset } from './ExportPresetManager';

import styles from './BatchExporter.module.css';

interface BatchExportJob {
  id: string;
  presetId: string;
  preset: ExportPreset;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  error?: string;
  results?: ExportResult[];
  startTime?: Date;
  endTime?: Date;
}

interface ExportResult {
  format: string;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  dpi: number;
  fileSize: number;
}

interface BatchExporterProps {
  canvas: fabric.Canvas;
  presets: ExportPreset[];
  selectedPresetIds: string[];
  projectName?: string;
  onJobUpdate?: (jobs: BatchExportJob[]) => void;
  onComplete?: (results: ExportResult[]) => void;
}

const BatchExporter = ({
  canvas,
  presets,
  selectedPresetIds,
  projectName = 'landscape-design',
  onJobUpdate,
  onComplete,
}: BatchExporterProps) => {
  const [jobs, setJobs] = useState<BatchExportJob[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const createJobs = useCallback(() => {
    const newJobs: BatchExportJob[] = selectedPresetIds.map(presetId => {
      const preset = presets.find(p => p.id === presetId);
      if (!preset) {
        throw new Error(`Preset not found: ${presetId}`);
      }

      return {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        presetId,
        preset,
        status: 'pending',
        progress: 0,
      };
    });

    setJobs(newJobs);
    onJobUpdate?.(newJobs);
    return newJobs;
  }, [selectedPresetIds, presets, onJobUpdate]);

  const updateJob = useCallback((jobId: string, updates: Partial<BatchExportJob>) => {
    setJobs(prevJobs => {
      const newJobs = prevJobs.map(job =>
        job.id === jobId ? { ...job, ...updates } : job
      );
      onJobUpdate?.(newJobs);
      return newJobs;
    });
  }, [onJobUpdate]);

  const calculateOverallProgress = useCallback((currentJobs: BatchExportJob[]) => {
    if (currentJobs.length === 0) return 0;
    
    const totalProgress = currentJobs.reduce((sum, job) => sum + job.progress, 0);
    return totalProgress / currentJobs.length;
  }, []);

  const downloadAllResults = useCallback((allResults: ExportResult[]) => {
    // Create a zip file or download individual files
    if (allResults.length === 1) {
      // Single file download
      const result = allResults[0];
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Multiple files - download as zip
      createZipDownload(allResults);
    }
  }, []);

  const createZipDownload = useCallback(async (results: ExportResult[]) => {
    try {
      // This would require a zip library like JSZip
      // For now, we'll download files individually with a delay
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        
        // Add a small delay between downloads to avoid browser blocking
        setTimeout(() => {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, i * 500);
      }
    } catch (error) {
      console.error('Failed to create zip download:', error);
    }
  }, []);

  const runBatchExport = useCallback(async () => {
    if (isRunning || selectedPresetIds.length === 0) return;

    setIsRunning(true);
    setOverallProgress(0);

    const exportJobs = createJobs();
    const allResults: ExportResult[] = [];

    try {
      for (let i = 0; i < exportJobs.length; i++) {
        const job = exportJobs[i];
        
        updateJob(job.id, {
          status: 'running',
          startTime: new Date(),
        });

        try {
          let results: ExportResult[] = [];

          // Handle PDF exports separately
          if (job.preset.formats.includes('pdf')) {
            const pdfExporter = new PDFExporter(
              canvas,
              job.preset,
              projectName,
              (progress) => updateJob(job.id, { progress })
            );
            
            const pdfBlob = await pdfExporter.generatePDF();
            results.push({
              format: 'pdf',
              blob: pdfBlob,
              filename: `${projectName}-${job.preset.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
              width: job.preset.dimensions.width,
              height: job.preset.dimensions.height,
              dpi: job.preset.dpi,
              fileSize: pdfBlob.size,
            });
          }

          // Handle other formats
          const nonPDFFormats = job.preset.formats.filter(f => f !== 'pdf');
          if (nonPDFFormats.length > 0) {
            const modifiedPreset = { ...job.preset, formats: nonPDFFormats };
            const highResExporter = new HighResExporter(
              canvas,
              modifiedPreset,
              (progress) => updateJob(job.id, { progress })
            );
            
            const highResResults = await highResExporter.exportAll();
            results.push(...highResResults);
          }

          updateJob(job.id, {
            status: 'completed',
            progress: 100,
            results,
            endTime: new Date(),
          });

          allResults.push(...results);

        } catch (error) {
          console.error(`Job ${job.id} failed:`, error);
          updateJob(job.id, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            endTime: new Date(),
          });
        }

        // Update overall progress
        const currentProgress = ((i + 1) / exportJobs.length) * 100;
        setOverallProgress(currentProgress);
      }

      // Download all results
      if (allResults.length > 0) {
        downloadAllResults(allResults);
        onComplete?.(allResults);
      }

    } finally {
      setIsRunning(false);
    }
  }, [
    isRunning,
    selectedPresetIds,
    canvas,
    projectName,
    createJobs,
    updateJob,
    downloadAllResults,
    onComplete,
  ]);

  const cancelBatchExport = useCallback(() => {
    setIsRunning(false);
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.status === 'running' ? { ...job, status: 'failed', error: 'Cancelled' } : job
      )
    );
  }, []);

  const clearJobs = useCallback(() => {
    setJobs([]);
    setOverallProgress(0);
    onJobUpdate?.([]);
  }, [onJobUpdate]);

  const getStatusIcon = (status: BatchExportJob['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '⚡';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (startTime?: Date, endTime?: Date): string => {
    if (!startTime || !endTime) return '-';
    const duration = endTime.getTime() - startTime.getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className={styles.batchExporter}>
      <div className={styles.header}>
        <h3>Batch Export</h3>
        <div className={styles.headerActions}>
          {jobs.length > 0 && (
            <button
              type="button"
              onClick={clearJobs}
              className={styles.clearButton}
              disabled={isRunning}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={isRunning ? cancelBatchExport : runBatchExport}
            className={isRunning ? styles.cancelButton : styles.startButton}
            disabled={selectedPresetIds.length === 0}
          >
            {isRunning ? 'Cancel' : 'Start Export'}
          </button>
        </div>
      </div>

      {selectedPresetIds.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Select presets to export</p>
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Presets:</span>
              <span className={styles.summaryValue}>{selectedPresetIds.length}</span>
            </div>
            {isRunning && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Progress:</span>
                <span className={styles.summaryValue}>{Math.round(overallProgress)}%</span>
              </div>
            )}
          </div>

          {isRunning && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          )}

          {jobs.length > 0 && (
            <div className={styles.jobList}>
              {jobs.map(job => (
                <div key={job.id} className={`${styles.jobItem} ${styles[job.status]}`}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobInfo}>
                      <span className={styles.jobIcon}>{getStatusIcon(job.status)}</span>
                      <span className={styles.jobName}>{job.preset.name}</span>
                      <span className={styles.jobDetails}>
                        {job.preset.formats.join(', ').toUpperCase()} • {job.preset.dpi} DPI
                      </span>
                    </div>
                    <div className={styles.jobProgress}>
                      {job.status === 'running' && (
                        <span className={styles.progressText}>{Math.round(job.progress)}%</span>
                      )}
                      {job.status === 'completed' && job.startTime && job.endTime && (
                        <span className={styles.duration}>
                          {formatDuration(job.startTime, job.endTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <div className={styles.jobProgressBar}>
                      <div 
                        className={styles.jobProgressFill}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}

                  {job.status === 'failed' && job.error && (
                    <div className={styles.jobError}>
                      Error: {job.error}
                    </div>
                  )}

                  {job.status === 'completed' && job.results && (
                    <div className={styles.jobResults}>
                      {job.results.map((result, index) => (
                        <div key={index} className={styles.resultItem}>
                          <span className={styles.resultFormat}>{result.format.toUpperCase()}</span>
                          <span className={styles.resultSize}>{formatFileSize(result.fileSize)}</span>
                          <span className={styles.resultDimensions}>
                            {result.width} × {result.height}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BatchExporter;