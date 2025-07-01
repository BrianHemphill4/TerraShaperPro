'use client';

import { useCallback, useState } from 'react';

import styles from './ExportPresetManager.module.css';

export interface ExportPreset {
  id: string;
  name: string;
  formats: ExportFormat[];
  quality: ExportQuality;
  dimensions: { width: number; height: number };
  dpi: number;
  includeElements: {
    grid: boolean;
    measurements: boolean;
    annotations: boolean;
    layers: string[];
  };
  layoutSettings?: {
    pageSize: 'A4' | 'A3' | 'Letter' | 'Tabloid' | 'Custom';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
    titleBlock?: TitleBlockConfig;
  };
}

export interface TitleBlockConfig {
  show: boolean;
  projectName: string;
  projectNumber: string;
  date: string;
  scale: string;
  drawnBy: string;
  checkedBy: string;
}

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';
export type ExportQuality = 'low' | 'medium' | 'high' | 'print';

interface ExportPresetManagerProps {
  presets: ExportPreset[];
  activePresetId: string | null;
  onPresetSelect: (presetId: string) => void;
  onPresetCreate: (preset: Omit<ExportPreset, 'id'>) => void;
  onPresetUpdate: (presetId: string, updates: Partial<ExportPreset>) => void;
  onPresetDelete: (presetId: string) => void;
  onPresetDuplicate: (presetId: string) => void;
}

const DEFAULT_PRESETS: Omit<ExportPreset, 'id'>[] = [
  {
    name: 'Web Preview',
    formats: ['png'],
    quality: 'medium',
    dimensions: { width: 1200, height: 800 },
    dpi: 72,
    includeElements: {
      grid: false,
      measurements: true,
      annotations: true,
      layers: [],
    },
  },
  {
    name: 'Print Ready',
    formats: ['pdf'],
    quality: 'print',
    dimensions: { width: 3300, height: 2550 }, // 11x8.5 at 300 DPI
    dpi: 300,
    includeElements: {
      grid: false,
      measurements: true,
      annotations: true,
      layers: [],
    },
    layoutSettings: {
      pageSize: 'Letter',
      orientation: 'landscape',
      margins: { top: 36, right: 36, bottom: 36, left: 36 }, // 0.5 inch margins
      titleBlock: {
        show: true,
        projectName: 'Landscape Design',
        projectNumber: '',
        date: new Date().toLocaleDateString(),
        scale: '1:100',
        drawnBy: '',
        checkedBy: '',
      },
    },
  },
  {
    name: 'High Resolution',
    formats: ['png', 'jpg'],
    quality: 'print',
    dimensions: { width: 4800, height: 3200 },
    dpi: 300,
    includeElements: {
      grid: false,
      measurements: true,
      annotations: true,
      layers: [],
    },
  },
];

const ExportPresetManager = ({
  presets,
  activePresetId,
  onPresetSelect,
  onPresetCreate,
  onPresetUpdate,
  onPresetDelete,
  onPresetDuplicate,
}: ExportPresetManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [presetForm, setPresetForm] = useState<Partial<ExportPreset>>({});

  const startCreatePreset = useCallback(() => {
    setPresetForm({
      name: '',
      formats: ['png'],
      quality: 'high',
      dimensions: { width: 1920, height: 1080 },
      dpi: 150,
      includeElements: {
        grid: false,
        measurements: true,
        annotations: true,
        layers: [],
      },
    });
    setIsCreating(true);
  }, []);

  const startEditPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setPresetForm(preset);
      setEditingPreset(presetId);
    }
  }, [presets]);

  const cancelEdit = useCallback(() => {
    setIsCreating(false);
    setEditingPreset(null);
    setPresetForm({});
  }, []);

  const savePreset = useCallback(() => {
    if (!presetForm.name?.trim()) return;

    if (isCreating) {
      onPresetCreate(presetForm as Omit<ExportPreset, 'id'>);
    } else if (editingPreset) {
      onPresetUpdate(editingPreset, presetForm);
    }

    cancelEdit();
  }, [presetForm, isCreating, editingPreset, onPresetCreate, onPresetUpdate, cancelEdit]);

  const updatePresetForm = useCallback((updates: Partial<ExportPreset>) => {
    setPresetForm(prev => ({ ...prev, ...updates }));
  }, []);

  const createDefaultPresets = useCallback(() => {
    DEFAULT_PRESETS.forEach(preset => onPresetCreate(preset));
  }, [onPresetCreate]);

  const handleFormatToggle = useCallback((format: ExportFormat) => {
    setPresetForm(prev => {
      const formats = prev.formats || [];
      const newFormats = formats.includes(format)
        ? formats.filter(f => f !== format)
        : [...formats, format];
      return { ...prev, formats: newFormats };
    });
  }, []);

  const qualityOptions: { value: ExportQuality; label: string; description: string }[] = [
    { value: 'low', label: 'Low (1x)', description: 'Fast export, smaller file size' },
    { value: 'medium', label: 'Medium (2x)', description: 'Balanced quality and size' },
    { value: 'high', label: 'High (3x)', description: 'High quality for most uses' },
    { value: 'print', label: 'Print (4x)', description: 'Maximum quality for printing' },
  ];

  const pageSizeOptions = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' },
    { value: 'Custom', label: 'Custom Size' },
  ];

  return (
    <div className={styles.presetManager}>
      <div className={styles.header}>
        <h3>Export Presets</h3>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.createButton}
            onClick={startCreatePreset}
            title="Create new preset"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {presets.length === 0 && (
            <button
              type="button"
              className={styles.defaultsButton}
              onClick={createDefaultPresets}
              title="Create default presets"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Defaults
            </button>
          )}
        </div>
      </div>

      <div className={styles.presetList}>
        {presets.map(preset => (
          <div
            key={preset.id}
            className={`${styles.presetItem} ${preset.id === activePresetId ? styles.active : ''}`}
          >
            <div
              className={styles.presetInfo}
              onClick={() => onPresetSelect(preset.id)}
            >
              <div className={styles.presetName}>{preset.name}</div>
              <div className={styles.presetDetails}>
                {preset.formats.join(', ').toUpperCase()} • {preset.quality} • {preset.dpi} DPI
              </div>
            </div>

            <div className={styles.presetActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => startEditPreset(preset.id)}
                title="Edit preset"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => onPresetDuplicate(preset.id)}
                title="Duplicate preset"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => onPresetDelete(preset.id)}
                title="Delete preset"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isCreating || editingPreset) && (
        <div className={styles.presetEditor}>
          <div className={styles.editorHeader}>
            <h4>{isCreating ? 'Create Preset' : 'Edit Preset'}</h4>
            <div className={styles.editorActions}>
              <button type="button" onClick={cancelEdit} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="button" onClick={savePreset} className={styles.saveButton}>
                Save
              </button>
            </div>
          </div>

          <div className={styles.editorContent}>
            <div className={styles.formGroup}>
              <label htmlFor="preset-name">Name</label>
              <input
                id="preset-name"
                type="text"
                value={presetForm.name || ''}
                onChange={(e) => updatePresetForm({ name: e.target.value })}
                placeholder="Enter preset name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Formats</label>
              <div className={styles.formatOptions}>
                {(['png', 'jpg', 'svg', 'pdf'] as const).map(format => (
                  <label key={format} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={presetForm.formats?.includes(format) || false}
                      onChange={() => handleFormatToggle(format)}
                    />
                    {format.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preset-quality">Quality</label>
              <select
                id="preset-quality"
                value={presetForm.quality || 'high'}
                onChange={(e) => updatePresetForm({ quality: e.target.value as ExportQuality })}
              >
                {qualityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preset-dpi">DPI</label>
              <input
                id="preset-dpi"
                type="number"
                min="72"
                max="600"
                value={presetForm.dpi || 150}
                onChange={(e) => updatePresetForm({ dpi: parseInt(e.target.value) })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Dimensions</label>
              <div className={styles.dimensionsInput}>
                <input
                  type="number"
                  placeholder="Width"
                  value={presetForm.dimensions?.width || ''}
                  onChange={(e) => updatePresetForm({
                    dimensions: {
                      ...presetForm.dimensions,
                      width: parseInt(e.target.value) || 0,
                      height: presetForm.dimensions?.height || 0,
                    }
                  })}
                />
                <span>×</span>
                <input
                  type="number"
                  placeholder="Height"
                  value={presetForm.dimensions?.height || ''}
                  onChange={(e) => updatePresetForm({
                    dimensions: {
                      width: presetForm.dimensions?.width || 0,
                      height: parseInt(e.target.value) || 0,
                    }
                  })}
                />
                <span>px</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Include Elements</label>
              <div className={styles.includeOptions}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={presetForm.includeElements?.grid || false}
                    onChange={(e) => updatePresetForm({
                      includeElements: {
                        ...presetForm.includeElements,
                        grid: e.target.checked,
                        measurements: presetForm.includeElements?.measurements || false,
                        annotations: presetForm.includeElements?.annotations || false,
                        layers: presetForm.includeElements?.layers || [],
                      }
                    })}
                  />
                  Grid
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={presetForm.includeElements?.measurements || false}
                    onChange={(e) => updatePresetForm({
                      includeElements: {
                        ...presetForm.includeElements,
                        grid: presetForm.includeElements?.grid || false,
                        measurements: e.target.checked,
                        annotations: presetForm.includeElements?.annotations || false,
                        layers: presetForm.includeElements?.layers || [],
                      }
                    })}
                  />
                  Measurements
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={presetForm.includeElements?.annotations || false}
                    onChange={(e) => updatePresetForm({
                      includeElements: {
                        ...presetForm.includeElements,
                        grid: presetForm.includeElements?.grid || false,
                        measurements: presetForm.includeElements?.measurements || false,
                        annotations: e.target.checked,
                        layers: presetForm.includeElements?.layers || [],
                      }
                    })}
                  />
                  Annotations
                </label>
              </div>
            </div>

            {presetForm.formats?.includes('pdf') && (
              <div className={styles.pdfSettings}>
                <h5>PDF Layout Settings</h5>
                
                <div className={styles.formGroup}>
                  <label htmlFor="page-size">Page Size</label>
                  <select
                    id="page-size"
                    value={presetForm.layoutSettings?.pageSize || 'Letter'}
                    onChange={(e) => updatePresetForm({
                      layoutSettings: {
                        ...presetForm.layoutSettings,
                        pageSize: e.target.value as any,
                        orientation: presetForm.layoutSettings?.orientation || 'landscape',
                        margins: presetForm.layoutSettings?.margins || { top: 36, right: 36, bottom: 36, left: 36 },
                      }
                    })}
                  >
                    {pageSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Orientation</label>
                  <div className={styles.orientationOptions}>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name="orientation"
                        value="portrait"
                        checked={presetForm.layoutSettings?.orientation === 'portrait'}
                        onChange={(e) => updatePresetForm({
                          layoutSettings: {
                            ...presetForm.layoutSettings,
                            orientation: 'portrait',
                            pageSize: presetForm.layoutSettings?.pageSize || 'Letter',
                            margins: presetForm.layoutSettings?.margins || { top: 36, right: 36, bottom: 36, left: 36 },
                          }
                        })}
                      />
                      Portrait
                    </label>
                    <label className={styles.radio}>
                      <input
                        type="radio"
                        name="orientation"
                        value="landscape"
                        checked={presetForm.layoutSettings?.orientation === 'landscape'}
                        onChange={(e) => updatePresetForm({
                          layoutSettings: {
                            ...presetForm.layoutSettings,
                            orientation: 'landscape',
                            pageSize: presetForm.layoutSettings?.pageSize || 'Letter',
                            margins: presetForm.layoutSettings?.margins || { top: 36, right: 36, bottom: 36, left: 36 },
                          }
                        })}
                      />
                      Landscape
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={presetForm.layoutSettings?.titleBlock?.show || false}
                      onChange={(e) => updatePresetForm({
                        layoutSettings: {
                          ...presetForm.layoutSettings,
                          pageSize: presetForm.layoutSettings?.pageSize || 'Letter',
                          orientation: presetForm.layoutSettings?.orientation || 'landscape',
                          margins: presetForm.layoutSettings?.margins || { top: 36, right: 36, bottom: 36, left: 36 },
                          titleBlock: {
                            ...presetForm.layoutSettings?.titleBlock,
                            show: e.target.checked,
                            projectName: presetForm.layoutSettings?.titleBlock?.projectName || '',
                            projectNumber: presetForm.layoutSettings?.titleBlock?.projectNumber || '',
                            date: presetForm.layoutSettings?.titleBlock?.date || '',
                            scale: presetForm.layoutSettings?.titleBlock?.scale || '',
                            drawnBy: presetForm.layoutSettings?.titleBlock?.drawnBy || '',
                            checkedBy: presetForm.layoutSettings?.titleBlock?.checkedBy || '',
                          }
                        }
                      })}
                    />
                    Include Title Block
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPresetManager;