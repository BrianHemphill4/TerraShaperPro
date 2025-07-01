import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { useDiffGeneration } from '@/hooks/useDiffGeneration';
import { Download, Maximize2, X, Image, Layers, Sliders } from 'lucide-react';
import type { HistoryEntry } from '@/stores/canvas/history.store';

interface DiffThumbnailProps {
  beforeState: HistoryEntry | string;
  afterState: HistoryEntry | string;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  onClose?: () => void;
  className?: string;
}

const SIZES = {
  small: { width: 150, height: 100 },
  medium: { width: 300, height: 200 },
  large: { width: 600, height: 400 },
};

export function DiffThumbnail({
  beforeState,
  afterState,
  size = 'medium',
  showControls = true,
  onClose,
  className,
}: DiffThumbnailProps) {
  const [mode, setMode] = useState<'overlay' | 'side-by-side' | 'slider'>('overlay');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [diffUrl, setDiffUrl] = useState<string>('');
  const [changes, setChanges] = useState({ added: 0, removed: 0, modified: 0 });
  
  const { generateDiff, isGenerating } = useDiffGeneration();
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const dimensions = isFullscreen
    ? { width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 }
    : SIZES[size];

  useEffect(() => {
    const generate = async () => {
      const beforeData = typeof beforeState === 'string' 
        ? beforeState 
        : beforeState.thumbnail || beforeState.canvasState;
        
      const afterData = typeof afterState === 'string'
        ? afterState
        : afterState.thumbnail || afterState.canvasState;

      const result = await generateDiff(beforeData, afterData, {
        mode,
        size: dimensions,
        opacity: 0.6,
      });

      setDiffUrl(result.dataUrl);
      setChanges(result.changes);
    };

    generate();
  }, [beforeState, afterState, mode, dimensions, generateDiff]);

  const handleSliderDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = `diff-${Date.now()}.jpg`;
    link.href = diffUrl;
    link.click();
  }, [diffUrl]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const renderDiffViewer = () => {
    if (mode === 'slider') {
      return (
        <div
          ref={sliderRef}
          className="relative overflow-hidden cursor-ew-resize"
          style={{ width: dimensions.width, height: dimensions.height }}
          onMouseDown={(e) => {
            const handleMouseMove = (ev: MouseEvent) => handleSliderDrag(ev as any);
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            handleSliderDrag(e);
          }}
          onTouchStart={(e) => {
            const handleTouchMove = (ev: TouchEvent) => handleSliderDrag(ev as any);
            const handleTouchEnd = () => {
              document.removeEventListener('touchmove', handleTouchMove);
              document.removeEventListener('touchend', handleTouchEnd);
            };
            
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
            handleSliderDrag(e);
          }}
        >
          <div className="absolute inset-0">
            <img
              src={typeof beforeState === 'string' ? beforeState : beforeState.thumbnail || ''}
              alt="Before"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={typeof afterState === 'string' ? afterState : afterState.thumbnail || ''}
              alt="After"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-0.5 h-4 bg-gray-400" />
              <div className="w-0.5 h-4 bg-gray-400 ml-1" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <img
        src={diffUrl}
        alt="Diff preview"
        className="w-full h-full object-contain"
        style={{ maxWidth: dimensions.width, maxHeight: dimensions.height }}
      />
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative bg-gray-100 rounded-lg overflow-hidden ${className || ''}`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center" style={{ ...dimensions }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {renderDiffViewer()}
            
            {showControls && (
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm p-1 flex gap-1">
                  <Button
                    size="sm"
                    variant={mode === 'overlay' ? 'default' : 'ghost'}
                    onClick={() => setMode('overlay')}
                    className="p-1"
                    title="Overlay view"
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={mode === 'side-by-side' ? 'default' : 'ghost'}
                    onClick={() => setMode('side-by-side')}
                    className="p-1"
                    title="Side by side view"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={mode === 'slider' ? 'default' : 'ghost'}
                    onClick={() => setMode('slider')}
                    className="p-1"
                    title="Slider view"
                  >
                    <Sliders className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm p-1 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDownload}
                    className="p-1"
                    title="Download diff"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFullscreen}
                    className="p-1"
                    title="Toggle fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  {onClose && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onClose}
                      className="p-1"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {changes.modified > 0 && (
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded px-2 py-1 text-xs">
                <span className="text-gray-600">
                  {changes.modified} changes detected
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <DiffThumbnail
              beforeState={beforeState}
              afterState={afterState}
              size="large"
              showControls={true}
              onClose={() => setIsFullscreen(false)}
              className="shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

export function DiffThumbnailModal({
  isOpen,
  onClose,
  beforeState,
  afterState,
}: {
  isOpen: boolean;
  onClose: () => void;
  beforeState: HistoryEntry | string;
  afterState: HistoryEntry | string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Visual Comparison</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">
          <DiffThumbnail
            beforeState={beforeState}
            afterState={afterState}
            size="large"
            showControls={true}
          />
        </div>
      </div>
    </div>
  );
}