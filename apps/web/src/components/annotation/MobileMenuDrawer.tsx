'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Layers,
  Download,
  Upload,
  Share2,
  HelpCircle,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  layers?: Layer[];
  onLayerToggle?: (layerId: string) => void;
  onLayerLock?: (layerId: string) => void;
  onLayerOpacity?: (layerId: string, opacity: number) => void;
  onLayerDelete?: (layerId: string) => void;
  onExport?: () => void;
  onImport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  projectName?: string;
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  layers = [],
  onLayerToggle,
  onLayerLock,
  onLayerOpacity,
  onLayerDelete,
  onExport,
  onImport,
  onShare,
  onSettings,
  onHelp,
  projectName = 'Untitled Project'
}: MobileMenuDrawerProps) {
  const [activeSection, setActiveSection] = React.useState<'menu' | 'layers'>('menu');
  const [editingLayerId, setEditingLayerId] = React.useState<string | null>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw]',
              'bg-white dark:bg-gray-900',
              'shadow-xl',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold">{projectName}</h2>
                <p className="text-sm text-gray-500">
                  {activeSection === 'layers' ? 'Layers' : 'Menu'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeSection === 'menu' ? (
                <div className="p-4 space-y-2">
                  {/* Layer Management */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => setActiveSection('layers')}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Layers
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      {layers.length}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Button>

                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

                  {/* Actions */}
                  {onExport && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onExport();
                        onClose();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}

                  {onImport && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onImport();
                        onClose();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  )}

                  {onShare && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onShare();
                        onClose();
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}

                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

                  {/* Settings */}
                  {onSettings && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onSettings();
                        onClose();
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  )}

                  {onHelp && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onHelp();
                        onClose();
                      }}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Support
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      // Show about dialog
                      onClose();
                    }}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {/* Back button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveSection('menu')}
                    className="mb-4"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                    Back
                  </Button>

                  {/* Layer List */}
                  {layers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No layers yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {layers.map((layer) => (
                        <div
                          key={layer.id}
                          className={cn(
                            'rounded-lg border border-gray-200 dark:border-gray-700 p-3',
                            'space-y-3'
                          )}
                        >
                          {/* Layer Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{layer.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onLayerToggle?.(layer.id)}
                                className="h-8 w-8 p-0"
                              >
                                {layer.visible ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onLayerLock?.(layer.id)}
                                className="h-8 w-8 p-0"
                              >
                                {layer.locked ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete layer "${layer.name}"?`)) {
                                    onLayerDelete?.(layer.id);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Opacity Slider */}
                          {editingLayerId === layer.id ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Opacity</span>
                                <span>{Math.round(layer.opacity * 100)}%</span>
                              </div>
                              <Slider
                                value={[layer.opacity]}
                                onValueChange={([value]) => 
                                  onLayerOpacity?.(layer.id, value)
                                }
                                min={0}
                                max={1}
                                step={0.01}
                                className="w-full"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingLayerId(null)}
                                className="w-full"
                              >
                                Done
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingLayerId(layer.id)}
                              className="w-full"
                            >
                              Adjust Opacity ({Math.round(layer.opacity * 100)}%)
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                TerraShaperPro v1.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}