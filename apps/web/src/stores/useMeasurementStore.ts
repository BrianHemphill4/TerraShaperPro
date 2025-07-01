import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  ScaleConfiguration, 
  DistanceMeasurement, 
  AreaMeasurement, 
  MeasurementSettings,
  MeasurementUnit,
  DimensionStyle,
  SnapSettings
} from '../lib/measurement/types';

interface MeasurementState {
  // Scale configurations
  scaleConfigurations: ScaleConfiguration[];
  activeScaleId: string | null;
  
  // Measurements
  distanceMeasurements: DistanceMeasurement[];
  areaMeasurements: AreaMeasurement[];
  
  // Settings
  settings: MeasurementSettings;
  
  // UI State
  isCalibrating: boolean;
  measurementMode: 'none' | 'distance' | 'area' | 'angle';
  showMeasurements: boolean;
}

interface MeasurementActions {
  // Scale configuration actions
  addScaleConfiguration: (config: ScaleConfiguration) => void;
  updateScaleConfiguration: (id: string, updates: Partial<ScaleConfiguration>) => void;
  removeScaleConfiguration: (id: string) => void;
  setActiveScale: (id: string | null) => void;
  getActiveScale: () => ScaleConfiguration | null;
  
  // Measurement actions
  addDistanceMeasurement: (measurement: DistanceMeasurement) => void;
  addAreaMeasurement: (measurement: AreaMeasurement) => void;
  removeDistanceMeasurement: (id: string) => void;
  removeAreaMeasurement: (id: string) => void;
  clearAllMeasurements: () => void;
  
  // Settings actions
  updateSettings: (updates: Partial<MeasurementSettings>) => void;
  updateSnapSettings: (updates: Partial<SnapSettings>) => void;
  updateDimensionStyle: (updates: Partial<DimensionStyle>) => void;
  
  // UI actions
  setCalibrating: (isCalibrating: boolean) => void;
  setMeasurementMode: (mode: MeasurementState['measurementMode']) => void;
  setShowMeasurements: (show: boolean) => void;
  
  // Utility actions
  exportMeasurements: () => string;
  importMeasurements: (data: string) => void;
  getMeasurementsByScene: (sceneId: string) => {
    distances: DistanceMeasurement[];
    areas: AreaMeasurement[];
  };
}

const defaultSettings: MeasurementSettings = {
  defaultUnit: MeasurementUnit.FEET,
  precision: 2,
  snapSettings: {
    enabled: true,
    threshold: 10,
    snapToGrid: true,
    snapToObjects: true,
    snapToEndpoints: true,
    snapToMidpoints: true,
    snapToIntersections: false
  },
  dimensionStyle: {
    lineColor: '#3b82f6',
    lineWidth: 2,
    arrowSize: 8,
    textSize: 14,
    textColor: '#374151',
    extensionLineLength: 20,
    textOffset: 10
  },
  showRealTimeUpdates: true,
  persistMeasurements: true
};

export const useMeasurementStore = create<MeasurementState & MeasurementActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    scaleConfigurations: [],
    activeScaleId: null,
    distanceMeasurements: [],
    areaMeasurements: [],
    settings: defaultSettings,
    isCalibrating: false,
    measurementMode: 'none',
    showMeasurements: true,

    // Scale configuration actions
    addScaleConfiguration: (config: ScaleConfiguration) => {
      set((state) => ({
        scaleConfigurations: [...state.scaleConfigurations, config],
        // Set as active if it's the first one or marked as default
        activeScaleId: state.scaleConfigurations.length === 0 || config.isDefault 
          ? config.id 
          : state.activeScaleId
      }));
    },

    updateScaleConfiguration: (id: string, updates: Partial<ScaleConfiguration>) => {
      set((state) => ({
        scaleConfigurations: state.scaleConfigurations.map(config =>
          config.id === id ? { ...config, ...updates } : config
        )
      }));
    },

    removeScaleConfiguration: (id: string) => {
      set((state) => ({
        scaleConfigurations: state.scaleConfigurations.filter(config => config.id !== id),
        activeScaleId: state.activeScaleId === id ? null : state.activeScaleId
      }));
    },

    setActiveScale: (id: string | null) => {
      set({ activeScaleId: id });
    },

    getActiveScale: (): ScaleConfiguration | null => {
      const state = get();
      return state.scaleConfigurations.find(config => config.id === state.activeScaleId) || null;
    },

    // Measurement actions
    addDistanceMeasurement: (measurement: DistanceMeasurement) => {
      set((state) => ({
        distanceMeasurements: [...state.distanceMeasurements, measurement]
      }));
    },

    addAreaMeasurement: (measurement: AreaMeasurement) => {
      set((state) => ({
        areaMeasurements: [...state.areaMeasurements, measurement]
      }));
    },

    removeDistanceMeasurement: (id: string) => {
      set((state) => ({
        distanceMeasurements: state.distanceMeasurements.filter(m => m.id !== id)
      }));
    },

    removeAreaMeasurement: (id: string) => {
      set((state) => ({
        areaMeasurements: state.areaMeasurements.filter(m => m.id !== id)
      }));
    },

    clearAllMeasurements: () => {
      set({
        distanceMeasurements: [],
        areaMeasurements: []
      });
    },

    // Settings actions
    updateSettings: (updates: Partial<MeasurementSettings>) => {
      set((state) => ({
        settings: { ...state.settings, ...updates }
      }));
    },

    updateSnapSettings: (updates: Partial<SnapSettings>) => {
      set((state) => ({
        settings: {
          ...state.settings,
          snapSettings: { ...state.settings.snapSettings, ...updates }
        }
      }));
    },

    updateDimensionStyle: (updates: Partial<DimensionStyle>) => {
      set((state) => ({
        settings: {
          ...state.settings,
          dimensionStyle: { ...state.settings.dimensionStyle, ...updates }
        }
      }));
    },

    // UI actions
    setCalibrating: (isCalibrating: boolean) => {
      set({ isCalibrating });
    },

    setMeasurementMode: (mode: MeasurementState['measurementMode']) => {
      set({ measurementMode: mode });
    },

    setShowMeasurements: (show: boolean) => {
      set({ showMeasurements: show });
    },

    // Utility actions
    exportMeasurements: (): string => {
      const state = get();
      const exportData = {
        scaleConfigurations: state.scaleConfigurations,
        distanceMeasurements: state.distanceMeasurements,
        areaMeasurements: state.areaMeasurements,
        settings: state.settings,
        exportedAt: new Date().toISOString()
      };
      return JSON.stringify(exportData, null, 2);
    },

    importMeasurements: (data: string) => {
      try {
        const importData = JSON.parse(data);
        set({
          scaleConfigurations: importData.scaleConfigurations || [],
          distanceMeasurements: importData.distanceMeasurements || [],
          areaMeasurements: importData.areaMeasurements || [],
          settings: { ...defaultSettings, ...importData.settings }
        });
      } catch (error) {
        console.error('Failed to import measurements:', error);
        throw new Error('Invalid measurement data format');
      }
    },

    getMeasurementsByScene: (sceneId: string) => {
      const state = get();
      
      // Filter measurements that belong to this scene
      // This assumes measurements have a sceneId property or are associated via scale configuration
      const sceneScales = state.scaleConfigurations
        .filter(config => config.sceneId === sceneId)
        .map(config => config.id);
      
      return {
        distances: state.distanceMeasurements.filter(measurement => 
          // For now, we'll return all measurements. In a full implementation,
          // measurements would have a sceneId or scale reference
          true
        ),
        areas: state.areaMeasurements.filter(measurement => 
          // For now, we'll return all measurements. In a full implementation,
          // measurements would have a sceneId or scale reference
          true
        )
      };
    }
  }))
);

// Selectors for better performance
export const useTotalMeasurements = () => {
  return useMeasurementStore((state) => ({
    totalDistance: state.distanceMeasurements.length,
    totalArea: state.areaMeasurements.length
  }));
};

export const useActiveScaleConfiguration = () => {
  return useMeasurementStore((state) => {
    return state.scaleConfigurations.find(config => config.id === state.activeScaleId) || null;
  });
};

export const useMeasurementSettings = () => {
  return useMeasurementStore((state) => state.settings);
};

export const useSnapSettings = () => {
  return useMeasurementStore((state) => state.settings.snapSettings);
};

export const useDimensionStyle = () => {
  return useMeasurementStore((state) => state.settings.dimensionStyle);
};