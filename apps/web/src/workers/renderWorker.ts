// Offscreen rendering worker
interface RenderMessage {
  id: string;
  type: 'render' | 'composite' | 'filter' | 'resize' | 'cache';
  canvas?: OffscreenCanvas;
  data: any;
}

interface RenderResponse {
  id: string;
  type: string;
  result?: ImageBitmap | ImageData | Blob | boolean;
  error?: string;
  metrics?: {
    duration: number;
    operations: number;
  };
}

// Canvas cache for reuse
const canvasCache = new Map<string, OffscreenCanvas>();
const contextCache = new Map<string, OffscreenCanvasRenderingContext2D>();

// Get or create canvas context
function getContext(
  id: string,
  width: number,
  height: number
): OffscreenCanvasRenderingContext2D {
  let canvas = canvasCache.get(id);
  let ctx = contextCache.get(id);

  if (!canvas || canvas.width !== width || canvas.height !== height) {
    canvas = new OffscreenCanvas(width, height);
    canvasCache.set(id, canvas);
    
    ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    }) as OffscreenCanvasRenderingContext2D;
    
    if (!ctx) throw new Error('Failed to get 2D context');
    contextCache.set(id, ctx);
  }

  return ctx!;
}

// Render operations
async function renderLayer(
  ctx: OffscreenCanvasRenderingContext2D,
  layer: any
): Promise<void> {
  ctx.save();

  // Apply layer transform
  if (layer.transform) {
    ctx.setTransform(
      layer.transform.a,
      layer.transform.b,
      layer.transform.c,
      layer.transform.d,
      layer.transform.e,
      layer.transform.f
    );
  }

  // Apply layer opacity
  if (layer.opacity !== undefined) {
    ctx.globalAlpha = layer.opacity;
  }

  // Apply blend mode
  if (layer.blendMode) {
    ctx.globalCompositeOperation = layer.blendMode;
  }

  // Render objects
  for (const object of layer.objects || []) {
    await renderObject(ctx, object);
  }

  ctx.restore();
}

async function renderObject(
  ctx: OffscreenCanvasRenderingContext2D,
  obj: any
): Promise<void> {
  switch (obj.type) {
    case 'rect':
      renderRectangle(ctx, obj);
      break;
    case 'circle':
      renderCircle(ctx, obj);
      break;
    case 'polygon':
      renderPolygon(ctx, obj);
      break;
    case 'image':
      await renderImage(ctx, obj);
      break;
    case 'text':
      renderText(ctx, obj);
      break;
    case 'path':
      renderPath(ctx, obj);
      break;
  }
}

function renderRectangle(ctx: OffscreenCanvasRenderingContext2D, rect: any): void {
  const { x, y, width, height, fill, stroke, strokeWidth, radius } = rect;

  ctx.beginPath();

  if (radius) {
    // Rounded rectangle
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1;
    ctx.stroke();
  }
}

function renderCircle(ctx: OffscreenCanvasRenderingContext2D, circle: any): void {
  const { x, y, radius, fill, stroke, strokeWidth } = circle;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1;
    ctx.stroke();
  }
}

function renderPolygon(ctx: OffscreenCanvasRenderingContext2D, polygon: any): void {
  const { points, fill, stroke, strokeWidth } = polygon;

  if (!points || points.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1;
    ctx.stroke();
  }
}

async function renderImage(ctx: OffscreenCanvasRenderingContext2D, img: any): Promise<void> {
  const { data, x, y, width, height, opacity } = img;

  if (!data) return;

  const savedAlpha = ctx.globalAlpha;
  if (opacity !== undefined) {
    ctx.globalAlpha = opacity;
  }

  if (data instanceof ImageBitmap) {
    ctx.drawImage(data, x, y, width, height);
  } else if (data instanceof ImageData) {
    const bitmap = await createImageBitmap(data);
    ctx.drawImage(bitmap, x, y, width, height);
    bitmap.close();
  }

  ctx.globalAlpha = savedAlpha;
}

function renderText(ctx: OffscreenCanvasRenderingContext2D, text: any): void {
  const { content, x, y, font, fill, stroke, strokeWidth, align, baseline } = text;

  if (!content) return;

  if (font) ctx.font = font;
  if (align) ctx.textAlign = align;
  if (baseline) ctx.textBaseline = baseline;

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillText(content, x, y);
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1;
    ctx.strokeText(content, x, y);
  }
}

function renderPath(ctx: OffscreenCanvasRenderingContext2D, path: any): void {
  const { commands, fill, stroke, strokeWidth } = path;

  if (!commands || commands.length === 0) return;

  ctx.beginPath();

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'moveTo':
        ctx.moveTo(cmd.x, cmd.y);
        break;
      case 'lineTo':
        ctx.lineTo(cmd.x, cmd.y);
        break;
      case 'quadraticCurveTo':
        ctx.quadraticCurveTo(cmd.cp1x, cmd.cp1y, cmd.x, cmd.y);
        break;
      case 'bezierCurveTo':
        ctx.bezierCurveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y);
        break;
      case 'arcTo':
        ctx.arcTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.radius);
        break;
      case 'arc':
        ctx.arc(cmd.x, cmd.y, cmd.radius, cmd.startAngle, cmd.endAngle, cmd.counterclockwise);
        break;
      case 'closePath':
        ctx.closePath();
        break;
    }
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1;
    ctx.stroke();
  }
}

// Composite multiple layers
async function compositeLayers(layers: any[]): Promise<ImageBitmap> {
  if (layers.length === 0) throw new Error('No layers to composite');

  // Find canvas size
  let width = 0;
  let height = 0;
  
  for (const layer of layers) {
    width = Math.max(width, layer.width || 0);
    height = Math.max(height, layer.height || 0);
  }

  const ctx = getContext('composite', width, height);
  ctx.clearRect(0, 0, width, height);

  // Render each layer
  for (const layer of layers) {
    if (layer.visible !== false) {
      await renderLayer(ctx, layer);
    }
  }

  // Create bitmap
  const canvas = canvasCache.get('composite')!;
  return createImageBitmap(canvas);
}

// Apply filters
async function applyFilter(
  imageData: ImageData,
  filter: string,
  params: any = {}
): Promise<ImageData> {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);

  switch (filter) {
    case 'blur':
      applyGaussianBlur(data, output.data, width, height, params.radius || 5);
      break;
      
    case 'sharpen':
      applyConvolution(data, output.data, width, height, [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]);
      break;
      
    case 'brightness':
      applyBrightness(data, output.data, params.value || 0);
      break;
      
    case 'contrast':
      applyContrast(data, output.data, params.value || 0);
      break;
      
    case 'grayscale':
      applyGrayscale(data, output.data);
      break;
      
    default:
      output.data.set(data);
  }

  return output;
}

function applyGaussianBlur(
  input: Uint8ClampedArray,
  output: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): void {
  // Simple box blur approximation
  const size = radius * 2 + 1;
  const weight = 1 / (size * size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(Math.max(x + dx, 0), width - 1);
          const ny = Math.min(Math.max(y + dy, 0), height - 1);
          const idx = (ny * width + nx) * 4;
          
          r += input[idx] * weight;
          g += input[idx + 1] * weight;
          b += input[idx + 2] * weight;
          a += input[idx + 3] * weight;
        }
      }
      
      const outputIdx = (y * width + x) * 4;
      output[outputIdx] = r;
      output[outputIdx + 1] = g;
      output[outputIdx + 2] = b;
      output[outputIdx + 3] = a;
    }
  }
}

function applyConvolution(
  input: Uint8ClampedArray,
  output: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[]
): void {
  const kSize = Math.sqrt(kernel.length);
  const kHalf = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const nx = Math.min(Math.max(x + kx - kHalf, 0), width - 1);
          const ny = Math.min(Math.max(y + ky - kHalf, 0), height - 1);
          const idx = (ny * width + nx) * 4;
          const kIdx = ky * kSize + kx;
          
          r += input[idx] * kernel[kIdx];
          g += input[idx + 1] * kernel[kIdx];
          b += input[idx + 2] * kernel[kIdx];
        }
      }
      
      const outputIdx = (y * width + x) * 4;
      output[outputIdx] = Math.min(Math.max(r, 0), 255);
      output[outputIdx + 1] = Math.min(Math.max(g, 0), 255);
      output[outputIdx + 2] = Math.min(Math.max(b, 0), 255);
      output[outputIdx + 3] = input[outputIdx + 3]; // Keep alpha
    }
  }
}

function applyBrightness(
  input: Uint8ClampedArray,
  output: Uint8ClampedArray,
  value: number
): void {
  const factor = 1 + value / 100;
  
  for (let i = 0; i < input.length; i += 4) {
    output[i] = Math.min(Math.max(input[i] * factor, 0), 255);
    output[i + 1] = Math.min(Math.max(input[i + 1] * factor, 0), 255);
    output[i + 2] = Math.min(Math.max(input[i + 2] * factor, 0), 255);
    output[i + 3] = input[i + 3]; // Keep alpha
  }
}

function applyContrast(
  input: Uint8ClampedArray,
  output: Uint8ClampedArray,
  value: number
): void {
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  
  for (let i = 0; i < input.length; i += 4) {
    output[i] = Math.min(Math.max(factor * (input[i] - 128) + 128, 0), 255);
    output[i + 1] = Math.min(Math.max(factor * (input[i + 1] - 128) + 128, 0), 255);
    output[i + 2] = Math.min(Math.max(factor * (input[i + 2] - 128) + 128, 0), 255);
    output[i + 3] = input[i + 3]; // Keep alpha
  }
}

function applyGrayscale(
  input: Uint8ClampedArray,
  output: Uint8ClampedArray
): void {
  for (let i = 0; i < input.length; i += 4) {
    const gray = 0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2];
    output[i] = gray;
    output[i + 1] = gray;
    output[i + 2] = gray;
    output[i + 3] = input[i + 3]; // Keep alpha
  }
}

// Message handler
self.addEventListener('message', async (event: MessageEvent<RenderMessage>) => {
  const { id, type, canvas, data } = event.data;
  const startTime = performance.now();
  
  try {
    let result: any;
    let operations = 0;

    switch (type) {
      case 'render':
        if (canvas) {
          const ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true
          }) as OffscreenCanvasRenderingContext2D;
          
          if (!ctx) throw new Error('Failed to get 2D context');
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          for (const layer of data.layers || []) {
            await renderLayer(ctx, layer);
            operations++;
          }
          
          result = await createImageBitmap(canvas);
        }
        break;

      case 'composite':
        result = await compositeLayers(data.layers || []);
        operations = data.layers?.length || 0;
        break;

      case 'filter':
        result = await applyFilter(data.imageData, data.filter, data.params);
        operations = 1;
        break;

      case 'resize':
        if (data.image instanceof ImageBitmap || data.image instanceof ImageData) {
          result = await createImageBitmap(data.image, {
            resizeWidth: data.width,
            resizeHeight: data.height,
            resizeQuality: data.quality || 'high'
          });
          operations = 1;
        }
        break;

      case 'cache':
        // Cache management
        if (data.action === 'clear') {
          canvasCache.clear();
          contextCache.clear();
          result = true;
        } else if (data.action === 'size') {
          result = canvasCache.size;
        }
        break;

      default:
        throw new Error(`Unknown operation: ${type}`);
    }

    const response: RenderResponse = {
      id,
      type,
      result,
      metrics: {
        duration: performance.now() - startTime,
        operations
      }
    };

    self.postMessage(response, result instanceof ImageBitmap ? [result] : []);
  } catch (error) {
    const response: RenderResponse = {
      id,
      type,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(response);
  }
});

// Export for TypeScript
export type { RenderMessage, RenderResponse };