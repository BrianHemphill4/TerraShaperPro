import { useState, useCallback, useRef } from 'react';
import { fabric } from 'fabric';

interface DiffOptions {
  mode: 'overlay' | 'side-by-side' | 'slider';
  highlightColor?: string;
  opacity?: number;
  size?: { width: number; height: number };
}

interface DiffResult {
  dataUrl: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
}

export function useDiffGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const generateDiff = useCallback(
    async (
      beforeCanvas: fabric.Canvas | string,
      afterCanvas: fabric.Canvas | string,
      options: DiffOptions = { mode: 'overlay' }
    ): Promise<DiffResult> => {
      setIsGenerating(true);

      try {
        const beforeData = typeof beforeCanvas === 'string' 
          ? beforeCanvas 
          : beforeCanvas.toDataURL();
        
        const afterData = typeof afterCanvas === 'string'
          ? afterCanvas
          : afterCanvas.toDataURL();

        const { width = 300, height = 200 } = options.size || {};
        const { highlightColor = '#ff0000', opacity = 0.5 } = options;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = options.mode === 'side-by-side' ? width * 2 : width;
        offscreenCanvas.height = height;
        const ctx = offscreenCanvas.getContext('2d');

        if (!ctx) throw new Error('Failed to get canvas context');

        const beforeImg = new Image();
        const afterImg = new Image();

        await Promise.all([
          new Promise<void>((resolve) => {
            beforeImg.onload = () => resolve();
            beforeImg.src = beforeData;
          }),
          new Promise<void>((resolve) => {
            afterImg.onload = () => resolve();
            afterImg.src = afterData;
          }),
        ]);

        let changes = { added: 0, removed: 0, modified: 0 };

        switch (options.mode) {
          case 'side-by-side':
            ctx.drawImage(beforeImg, 0, 0, width, height);
            ctx.drawImage(afterImg, width, 0, width, height);
            
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, width, height);
            ctx.strokeRect(width, 0, width, height);
            
            ctx.fillStyle = '#000';
            ctx.font = '12px sans-serif';
            ctx.fillText('Before', 5, 15);
            ctx.fillText('After', width + 5, 15);
            break;

          case 'overlay':
            ctx.drawImage(beforeImg, 0, 0, width, height);
            ctx.globalAlpha = opacity;
            ctx.drawImage(afterImg, 0, 0, width, height);
            
            const beforeData = ctx.getImageData(0, 0, width, height);
            ctx.globalAlpha = 1;
            ctx.drawImage(afterImg, 0, 0, width, height);
            const afterData = ctx.getImageData(0, 0, width, height);
            
            const diffData = ctx.createImageData(width, height);
            
            for (let i = 0; i < beforeData.data.length; i += 4) {
              const rDiff = Math.abs(beforeData.data[i] - afterData.data[i]);
              const gDiff = Math.abs(beforeData.data[i + 1] - afterData.data[i + 1]);
              const bDiff = Math.abs(beforeData.data[i + 2] - afterData.data[i + 2]);
              
              const totalDiff = rDiff + gDiff + bDiff;
              
              if (totalDiff > 30) {
                changes.modified++;
                diffData.data[i] = 255;
                diffData.data[i + 1] = 0;
                diffData.data[i + 2] = 0;
                diffData.data[i + 3] = 128;
              } else {
                diffData.data[i] = afterData.data[i];
                diffData.data[i + 1] = afterData.data[i + 1];
                diffData.data[i + 2] = afterData.data[i + 2];
                diffData.data[i + 3] = afterData.data[i + 3];
              }
            }
            
            ctx.putImageData(diffData, 0, 0);
            break;

          case 'slider':
            const sliderPos = width / 2;
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, sliderPos, height);
            ctx.clip();
            ctx.drawImage(beforeImg, 0, 0, width, height);
            ctx.restore();
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(sliderPos, 0, width - sliderPos, height);
            ctx.clip();
            ctx.drawImage(afterImg, 0, 0, width, height);
            ctx.restore();
            
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sliderPos, 0);
            ctx.lineTo(sliderPos, height);
            ctx.stroke();
            
            const handleSize = 20;
            ctx.fillStyle = '#fff';
            ctx.fillRect(sliderPos - handleSize / 2, height / 2 - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(sliderPos - handleSize / 2, height / 2 - handleSize / 2, handleSize, handleSize);
            break;
        }

        const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.8);

        return {
          dataUrl,
          changes,
        };
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const generateBatchDiffs = useCallback(
    async (
      diffs: Array<{
        before: fabric.Canvas | string;
        after: fabric.Canvas | string;
        options?: DiffOptions;
      }>
    ): Promise<DiffResult[]> => {
      const results: DiffResult[] = [];
      
      for (const diff of diffs) {
        const result = await generateDiff(diff.before, diff.after, diff.options);
        results.push(result);
      }
      
      return results;
    },
    [generateDiff]
  );

  const generateAnimatedDiff = useCallback(
    async (
      states: Array<fabric.Canvas | string>,
      options: { fps?: number; duration?: number } = {}
    ): Promise<string> => {
      const { fps = 10, duration = 2000 } = options;
      const frameCount = Math.floor((duration / 1000) * fps);
      const frames: string[] = [];

      for (let i = 0; i < frameCount; i++) {
        const stateIndex = Math.floor((i / frameCount) * (states.length - 1));
        const nextIndex = Math.min(stateIndex + 1, states.length - 1);
        
        const progress = (i / frameCount) * (states.length - 1) - stateIndex;
        
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;

        const currentImg = new Image();
        const nextImg = new Image();
        
        const currentData = typeof states[stateIndex] === 'string'
          ? states[stateIndex]
          : (states[stateIndex] as fabric.Canvas).toDataURL();
          
        const nextData = typeof states[nextIndex] === 'string'
          ? states[nextIndex]
          : (states[nextIndex] as fabric.Canvas).toDataURL();

        await Promise.all([
          new Promise<void>((resolve) => {
            currentImg.onload = () => resolve();
            currentImg.src = currentData;
          }),
          new Promise<void>((resolve) => {
            nextImg.onload = () => resolve();
            nextImg.src = nextData;
          }),
        ]);

        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(currentImg, 0, 0, 300, 200);
        ctx.globalAlpha = progress;
        ctx.drawImage(nextImg, 0, 0, 300, 200);
        
        frames.push(canvas.toDataURL());
      }

      return frames.join(',');
    },
    []
  );

  return {
    generateDiff,
    generateBatchDiffs,
    generateAnimatedDiff,
    isGenerating,
  };
}