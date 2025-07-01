'use client';

import { useState, useCallback } from 'react';
import { useMeasurementStore, useTotalMeasurements, useActiveScaleConfiguration, useMeasurementSettings } from '../../../stores/useMeasurementStore';
import { ScaleCalibrator } from './ScaleCalibrator';
import { DistanceTool } from './DistanceTool';
import { AreaTool } from './AreaTool';
import { MeasurementUnit } from '../../../lib/measurement/types';
import { UnitConverter } from '../../../lib/measurement/UnitConverter';
import { fabric } from 'fabric';

interface MeasurementPanelProps {
  canvas: fabric.Canvas | null;
  sceneId: string;
}

export const MeasurementPanel = ({ canvas, sceneId }: MeasurementPanelProps) => {
  const {
    measurementMode,
    setMeasurementMode,
    setCalibrating,
    isCalibrating,
    clearAllMeasurements,
    showMeasurements,
    setShowMeasurements,
    updateSettings,
    exportMeasurements,
    importMeasurements
  } = useMeasurementStore();

  const { totalDistance, totalArea } = useTotalMeasurements();
  const activeScale = useActiveScaleConfiguration();
  const settings = useMeasurementSettings();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCalibrationStart = useCallback(() => {
    setMeasurementMode('none');
    setCalibrating(true);
  }, [setMeasurementMode, setCalibrating]);

  const handleCalibrationComplete = useCallback((scaleId: string) => {
    console.log('Scale calibration completed:', scaleId);
  }, []);

  const handleCalibrationCancel = useCallback(() => {
    setCalibrating(false);
  }, [setCalibrating]);

  const handleMeasurementModeChange = useCallback((mode: typeof measurementMode) => {
    setMeasurementMode(mode);
  }, [setMeasurementMode]);

  const handleExportMeasurements = useCallback(() => {
    try {
      const data = exportMeasurements();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `measurements-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export measurements:', error);
    }
  }, [exportMeasurements]);

  const handleImportMeasurements = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        importMeasurements(data);
      } catch (error) {
        console.error('Failed to import measurements:', error);
        alert('Failed to import measurements. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, [importMeasurements]);

  const handleUnitChange = useCallback((unit: MeasurementUnit) => {
    updateSettings({ defaultUnit: unit });
  }, [updateSettings]);

  const handlePrecisionChange = useCallback((precision: number) => {
    updateSettings({ precision });
  }, [updateSettings]);

  return (
    <>
      {/* Main Panel */}
      <div className={`fixed right-4 top-20 bg-white shadow-lg rounded-lg border transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {isExpanded && (
            <>
              <h3 className="text-sm font-medium text-gray-900">Measurements</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="p-3 space-y-4">
            {/* Scale Configuration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Scale</span>
                <button
                  onClick={handleCalibrationStart}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Calibrate
                </button>
              </div>
              
              {activeScale ? (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div>1 {activeScale.units === 'metric' ? 'm' : 'ft'} = {
                    activeScale.units === 'metric' 
                      ? activeScale.pixelsPerMeter.toFixed(1) 
                      : activeScale.pixelsPerFoot.toFixed(1)
                  } px</div>
                  <div>Accuracy: {activeScale.accuracy.toFixed(1)}%</div>
                </div>
              ) : (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  No scale configured
                </div>
              )}
            </div>

            {/* Measurement Tools */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-700">Tools</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMeasurementModeChange(measurementMode === 'distance' ? 'none' : 'distance')}
                  className={`text-xs px-3 py-2 rounded transition-colors ${
                    measurementMode === 'distance'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={!activeScale}
                >
                  <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Distance
                </button>
                
                <button
                  onClick={() => handleMeasurementModeChange(measurementMode === 'area' ? 'none' : 'area')}
                  className={`text-xs px-3 py-2 rounded transition-colors ${
                    measurementMode === 'area'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={!activeScale}
                >
                  <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Area
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-700">Summary</span>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Distances: {totalDistance}</div>
                <div>Areas: {totalArea}</div>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Show Measurements</span>
              <button
                onClick={() => setShowMeasurements(!showMeasurements)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  showMeasurements ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  showMeasurements ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={clearAllMeasurements}
                className="w-full text-xs px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                disabled={totalDistance === 0 && totalArea === 0}
              >
                Clear All
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportMeasurements}
                  className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  disabled={totalDistance === 0 && totalArea === 0}
                >
                  Export
                </button>
                
                <label className="text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors cursor-pointer text-center">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportMeasurements}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="border-t pt-3 space-y-3">
                <span className="text-xs font-medium text-gray-700">Settings</span>
                
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Default Unit</label>
                  <select
                    value={settings.defaultUnit}
                    onChange={(e) => handleUnitChange(e.target.value as MeasurementUnit)}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {UnitConverter.getLengthUnits().map(unit => (
                      <option key={unit} value={unit}>
                        {UnitConverter.getUnitAbbreviation(unit)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Precision</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={settings.precision}
                    onChange={(e) => handlePrecisionChange(parseInt(e.target.value) || 2)}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tool Components */}
      <ScaleCalibrator
        canvas={canvas}
        sceneId={sceneId}
        onCalibrationComplete={handleCalibrationComplete}
        onCancel={handleCalibrationCancel}
      />
      
      <DistanceTool
        canvas={canvas}
        isActive={measurementMode === 'distance'}
      />
      
      <AreaTool
        canvas={canvas}
        isActive={measurementMode === 'area'}
      />
    </>
  );
};