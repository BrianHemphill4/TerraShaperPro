'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useState } from 'react';
import { useMeasurementStore } from '../../../stores/useMeasurementStore';
import { ScaleCalibrationWizard, MeasurementUnit } from '../../../lib/measurement/types';
import { CoordinateSystem } from '../../../lib/measurement/CoordinateSystem';
import { UnitConverter } from '../../../lib/measurement/UnitConverter';
import { GeometryUtils } from '../../../lib/measurement/GeometryCalculations';

interface ScaleCalibratorProps {
  canvas: fabric.Canvas | null;
  sceneId: string;
  onCalibrationComplete?: (scaleId: string) => void;
  onCancel?: () => void;
}

export const ScaleCalibrator = ({ 
  canvas, 
  sceneId, 
  onCalibrationComplete, 
  onCancel 
}: ScaleCalibratorProps) => {
  const { addScaleConfiguration, setCalibrating, isCalibrating } = useMeasurementStore();
  
  const [wizard, setWizard] = useState<ScaleCalibrationWizard>({
    step: 'select-points',
    knownDistance: 1,
    selectedUnit: MeasurementUnit.FEET,
    calculatedScale: 0,
    accuracy: 0
  });
  
  const [calibrationLine, setCalibrationLine] = useState<fabric.Line | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Handle canvas interactions for point selection
  useEffect(() => {
    if (!canvas || !isCalibrating || wizard.step !== 'select-points') return;

    const handleMouseDown = (e: fabric.IEvent) => {
      const pointer = canvas.getPointer(e.e);
      
      if (!wizard.point1) {
        // First point
        setWizard(prev => ({
          ...prev,
          point1: pointer
        }));
        setIsDrawing(true);
        
        // Create initial line
        const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#ef4444',
          strokeWidth: 3,
          strokeDashArray: [8, 4],
          selectable: false,
          evented: false,
          opacity: 0.8
        });
        
        canvas.add(line);
        setCalibrationLine(line);
      } else if (isDrawing) {
        // Second point - complete the line
        setWizard(prev => ({
          ...prev,
          point2: pointer
        }));
        setIsDrawing(false);
        
        // Calculate initial scale
        if (wizard.point1) {
          const canvasDistance = GeometryUtils.calculateDistance(wizard.point1, pointer);
          const calculatedScale = canvasDistance / wizard.knownDistance;
          const accuracy = Math.min(100, Math.max(0, (canvasDistance / 10) * 10)); // Basic accuracy calculation
          
          setWizard(prev => ({
            ...prev,
            calculatedScale,
            accuracy,
            step: 'enter-distance'
          }));
        }
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isDrawing || !calibrationLine) return;
      
      const pointer = canvas.getPointer(e.e);
      calibrationLine.set({ x2: pointer.x, y2: pointer.y });
      canvas.renderAll();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, isCalibrating, wizard.step, wizard.point1, isDrawing, calibrationLine, wizard.knownDistance]);

  const handleDistanceChange = useCallback((distance: number) => {
    if (distance <= 0) {
      setErrors(['Distance must be greater than 0']);
      return;
    }
    
    setErrors([]);
    setWizard(prev => {
      if (prev.point1 && prev.point2) {
        const canvasDistance = GeometryUtils.calculateDistance(prev.point1, prev.point2);
        const calculatedScale = canvasDistance / distance;
        const accuracy = Math.min(100, Math.max(0, (canvasDistance / 1) * 2)); // Improved accuracy calculation
        
        return {
          ...prev,
          knownDistance: distance,
          calculatedScale,
          accuracy
        };
      }
      return { ...prev, knownDistance: distance };
    });
  }, []);

  const handleUnitChange = useCallback((unit: MeasurementUnit) => {
    setWizard(prev => ({ ...prev, selectedUnit: unit }));
  }, []);

  const handleValidate = useCallback(() => {
    const validationErrors: string[] = [];
    
    if (!wizard.point1 || !wizard.point2) {
      validationErrors.push('Two calibration points are required');
    }
    
    if (wizard.knownDistance <= 0) {
      validationErrors.push('Known distance must be greater than 0');
    }
    
    if (wizard.accuracy < 50) {
      validationErrors.push('Calibration accuracy is too low. Try using a longer reference distance.');
    }
    
    if (wizard.point1 && wizard.point2) {
      const canvasDistance = GeometryUtils.calculateDistance(wizard.point1, wizard.point2);
      if (canvasDistance < 10) {
        validationErrors.push('Calibration points are too close together. Select points further apart for better accuracy.');
      }
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    setWizard(prev => ({ ...prev, step: 'save' }));
  }, [wizard]);

  const handleSave = useCallback(async () => {
    if (!wizard.point1 || !wizard.point2) return;
    
    try {
      const scaleConfig = CoordinateSystem.createCalibrationFromPoints(
        wizard.point1,
        wizard.point2,
        wizard.knownDistance,
        wizard.selectedUnit,
        {
          name: `Scale ${new Date().toLocaleString()}`,
          sceneId,
          isDefault: true
        }
      );
      
      addScaleConfiguration(scaleConfig);
      
      // Clean up canvas
      if (calibrationLine && canvas) {
        canvas.remove(calibrationLine);
        canvas.renderAll();
      }
      
      setCalibrating(false);
      onCalibrationComplete?.(scaleConfig.id);
      
      // Reset wizard
      setWizard({
        step: 'select-points',
        knownDistance: 1,
        selectedUnit: MeasurementUnit.FEET,
        calculatedScale: 0,
        accuracy: 0
      });
      
    } catch (error) {
      setErrors([`Failed to create scale configuration: ${error}`]);
    }
  }, [wizard, canvas, calibrationLine, addScaleConfiguration, setCalibrating, onCalibrationComplete, sceneId]);

  const handleCancel = useCallback(() => {
    // Clean up canvas
    if (calibrationLine && canvas) {
      canvas.remove(calibrationLine);
      canvas.renderAll();
    }
    
    setCalibrating(false);
    setIsDrawing(false);
    setCalibrationLine(null);
    setErrors([]);
    
    // Reset wizard
    setWizard({
      step: 'select-points',
      knownDistance: 1,
      selectedUnit: MeasurementUnit.FEET,
      calculatedScale: 0,
      accuracy: 0
    });
    
    onCancel?.();
  }, [canvas, calibrationLine, setCalibrating, onCancel]);

  const handleRestart = useCallback(() => {
    // Clean up current calibration
    if (calibrationLine && canvas) {
      canvas.remove(calibrationLine);
      canvas.renderAll();
    }
    
    setCalibrationLine(null);
    setIsDrawing(false);
    setErrors([]);
    
    // Reset to first step
    setWizard(prev => ({
      ...prev,
      step: 'select-points',
      point1: undefined,
      point2: undefined,
      calculatedScale: 0,
      accuracy: 0
    }));
  }, [canvas, calibrationLine]);

  if (!isCalibrating) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Scale Calibration</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            {['select-points', 'enter-distance', 'validate', 'save'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  wizard.step === step
                    ? 'bg-blue-600 text-white'
                    : index < ['select-points', 'enter-distance', 'validate', 'save'].indexOf(wizard.step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${
                    index < ['select-points', 'enter-distance', 'validate', 'save'].indexOf(wizard.step)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error display */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-800">{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step content */}
        {wizard.step === 'select-points' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Calibration Points</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click two points on the canvas that represent a known distance.
                For best accuracy, select points that are far apart.
              </p>
              <div className="text-xs text-gray-500">
                Status: {wizard.point1 ? (wizard.point2 ? 'Complete' : 'Select second point') : 'Select first point'}
              </div>
            </div>
          </div>
        )}

        {wizard.step === 'enter-distance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Known Distance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={wizard.knownDistance}
                  onChange={(e) => handleDistanceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter distance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={wizard.selectedUnit}
                  onChange={(e) => handleUnitChange(e.target.value as MeasurementUnit)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {UnitConverter.getLengthUnits().map(unit => (
                    <option key={unit} value={unit}>
                      {UnitConverter.getUnitAbbreviation(unit)}
                    </option>
                  ))}
                </select>
              </div>
              
              {wizard.calculatedScale > 0 && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="text-sm text-blue-800">
                    <div>Calculated Scale: {wizard.calculatedScale.toFixed(2)} pixels per {wizard.selectedUnit}</div>
                    <div>Estimated Accuracy: {wizard.accuracy.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestart}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Restart
              </button>
              <button
                onClick={handleValidate}
                disabled={wizard.knownDistance <= 0}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate
              </button>
            </div>
          </div>
        )}

        {wizard.step === 'validate' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Results</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Scale Factor</span>
                <span className="text-sm text-gray-900">{wizard.calculatedScale.toFixed(2)} px/{wizard.selectedUnit}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Accuracy</span>
                <span className={`text-sm font-medium ${
                  wizard.accuracy >= 80 ? 'text-green-600' : 
                  wizard.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {wizard.accuracy.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Reference Distance</span>
                <span className="text-sm text-gray-900">
                  {wizard.knownDistance} {UnitConverter.getUnitAbbreviation(wizard.selectedUnit)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestart}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Restart
              </button>
              <button
                onClick={() => setWizard(prev => ({ ...prev, step: 'save' }))}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {wizard.step === 'save' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calibration Complete</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your scale configuration is ready to be saved. This will become the active scale for all measurements.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save Scale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};