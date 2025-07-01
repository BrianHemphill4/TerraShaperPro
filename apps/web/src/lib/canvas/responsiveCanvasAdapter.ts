import { fabric } from 'fabric';

interface ViewportConstraints {
  minZoom: number;
  maxZoom: number;
  panBounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

interface ResponsiveCanvasConfig {
  canvas: fabric.Canvas;
  container: HTMLElement;
  constraints?: ViewportConstraints;
  maintainAspectRatio?: boolean;
  centerOnResize?: boolean;
  mobileOptimizations?: boolean;
}

export class ResponsiveCanvasAdapter {
  private canvas: fabric.Canvas;
  private container: HTMLElement;
  private constraints: ViewportConstraints;
  private resizeObserver?: ResizeObserver;
  private originalDimensions?: { width: number; height: number };
  private isMobile: boolean = false;
  private lastPinchDistance: number = 0;
  private isPinching: boolean = false;

  constructor(config: ResponsiveCanvasConfig) {
    this.canvas = config.canvas;
    this.container = config.container;
    this.constraints = {
      minZoom: 0.1,
      maxZoom: 5,
      ...config.constraints
    };
    
    this.isMobile = this.checkIfMobile();
    this.setupResponsiveCanvas(config);
  }

  private checkIfMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  }

  private setupResponsiveCanvas(config: ResponsiveCanvasConfig): void {
    // Store original dimensions
    this.originalDimensions = {
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight()
    };

    // Setup resize observer
    this.setupResizeObserver(config);

    // Apply mobile optimizations
    if (config.mobileOptimizations && this.isMobile) {
      this.applyMobileOptimizations();
    }

    // Setup viewport constraints
    this.setupViewportConstraints();

    // Initial resize
    this.handleResize(config);
  }

  private setupResizeObserver(config: ResponsiveCanvasConfig): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize(config);
    });

    this.resizeObserver.observe(this.container);
  }

  private handleResize(config: ResponsiveCanvasConfig): void {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    if (!this.originalDimensions) return;

    let newWidth = containerWidth;
    let newHeight = containerHeight;

    if (config.maintainAspectRatio) {
      const aspectRatio = this.originalDimensions.width / this.originalDimensions.height;
      
      if (containerWidth / containerHeight > aspectRatio) {
        newWidth = containerHeight * aspectRatio;
      } else {
        newHeight = containerWidth / aspectRatio;
      }
    }

    // Update canvas dimensions
    this.canvas.setWidth(newWidth);
    this.canvas.setHeight(newHeight);

    // Scale content to fit
    const scaleX = newWidth / this.originalDimensions.width;
    const scaleY = newHeight / this.originalDimensions.height;
    const scale = Math.min(scaleX, scaleY);

    if (config.centerOnResize) {
      this.centerContent(scale);
    }

    // Render canvas
    this.canvas.renderAll();
  }

  private centerContent(scale: number): void {
    const center = this.canvas.getCenter();
    const vpt = this.canvas.viewportTransform;
    
    if (vpt) {
      vpt[0] = scale;
      vpt[3] = scale;
      vpt[4] = center.left - (center.left * scale);
      vpt[5] = center.top - (center.top * scale);
      
      this.canvas.setViewportTransform(vpt);
    }
  }

  private setupViewportConstraints(): void {
    // Override canvas zoom methods to enforce constraints
    const originalSetZoom = this.canvas.setZoom.bind(this.canvas);
    
    this.canvas.setZoom = (value: number) => {
      const constrainedZoom = Math.max(
        this.constraints.minZoom,
        Math.min(this.constraints.maxZoom, value)
      );
      originalSetZoom(constrainedZoom);
    };

    // Constrain panning
    this.canvas.on('mouse:move', (e) => {
      if (this.canvas.isDrawingMode || !this.canvas.viewportTransform) return;
      
      const vpt = this.canvas.viewportTransform;
      
      if (this.constraints.panBounds) {
        const bounds = this.constraints.panBounds;
        vpt[4] = Math.max(bounds.left, Math.min(bounds.right, vpt[4]));
        vpt[5] = Math.max(bounds.top, Math.min(bounds.bottom, vpt[5]));
        this.canvas.setViewportTransform(vpt);
      }
    });
  }

  private applyMobileOptimizations(): void {
    // Disable selection on mobile by default
    this.canvas.selection = false;
    
    // Increase selection tolerance for touch
    this.canvas.targetFindTolerance = 8;
    
    // Disable multi-selection on mobile
    this.canvas.allowTouchScrolling = true;
    
    // Optimize rendering for mobile
    this.canvas.enableRetinaScaling = false;
    this.canvas.renderOnAddRemove = false;
    
    // Batch rendering
    let renderTimeout: NodeJS.Timeout;
    const originalRenderAll = this.canvas.renderAll.bind(this.canvas);
    
    this.canvas.renderAll = () => {
      clearTimeout(renderTimeout);
      renderTimeout = setTimeout(() => {
        originalRenderAll();
      }, 16); // ~60fps
    };
  }

  // Mobile-specific zoom methods
  public enablePinchZoom(): void {
    let lastDistance = 0;
    let startZoom = 1;

    this.canvas.wrapperEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        this.isPinching = true;
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        lastDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        startZoom = this.canvas.getZoom();
      }
    }, { passive: false });

    this.canvas.wrapperEl.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && this.isPinching) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scale = currentDistance / lastDistance;
        const newZoom = startZoom * (currentDistance / this.lastPinchDistance);
        
        // Get center point between touches
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Convert to canvas coordinates
        const point = new fabric.Point(centerX, centerY);
        const canvasPoint = fabric.util.transformPoint(
          point,
          fabric.util.invertTransform(this.canvas.viewportTransform!)
        );
        
        this.canvas.zoomToPoint(canvasPoint, newZoom);
      }
    }, { passive: false });

    this.canvas.wrapperEl.addEventListener('touchend', () => {
      this.isPinching = false;
    });
  }

  // Pan constraints for mobile
  public enableMobilePan(): void {
    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    this.canvas.wrapperEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && !this.canvas.getActiveObject()) {
        isPanning = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    });

    this.canvas.wrapperEl.addEventListener('touchmove', (e) => {
      if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - lastX;
        const deltaY = e.touches[0].clientY - lastY;
        
        const vpt = this.canvas.viewportTransform!;
        vpt[4] += deltaX;
        vpt[5] += deltaY;
        
        // Apply pan constraints
        if (this.constraints.panBounds) {
          const bounds = this.constraints.panBounds;
          vpt[4] = Math.max(bounds.left, Math.min(bounds.right, vpt[4]));
          vpt[5] = Math.max(bounds.top, Math.min(bounds.bottom, vpt[5]));
        }
        
        this.canvas.setViewportTransform(vpt);
        this.canvas.renderAll();
        
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    }, { passive: false });

    this.canvas.wrapperEl.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

  // Get current viewport info
  public getViewportInfo() {
    const zoom = this.canvas.getZoom();
    const vpt = this.canvas.viewportTransform;
    
    return {
      zoom,
      pan: vpt ? { x: vpt[4], y: vpt[5] } : { x: 0, y: 0 },
      canvasWidth: this.canvas.getWidth(),
      canvasHeight: this.canvas.getHeight(),
      containerWidth: this.container.clientWidth,
      containerHeight: this.container.clientHeight,
      isMobile: this.isMobile
    };
  }

  // Update constraints dynamically
  public updateConstraints(constraints: Partial<ViewportConstraints>): void {
    this.constraints = { ...this.constraints, ...constraints };
    this.setupViewportConstraints();
  }

  // Fit content to viewport
  public fitToViewport(padding: number = 20): void {
    const objects = this.canvas.getObjects();
    if (objects.length === 0) return;

    const bounds = this.canvas.getObjects().reduce((acc, obj) => {
      const objBounds = obj.getBoundingRect();
      return {
        left: Math.min(acc.left, objBounds.left),
        top: Math.min(acc.top, objBounds.top),
        right: Math.max(acc.right, objBounds.left + objBounds.width),
        bottom: Math.max(acc.bottom, objBounds.top + objBounds.height)
      };
    }, {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity
    });

    const contentWidth = bounds.right - bounds.left;
    const contentHeight = bounds.bottom - bounds.top;
    
    const canvasWidth = this.canvas.getWidth() - (padding * 2);
    const canvasHeight = this.canvas.getHeight() - (padding * 2);
    
    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.canvas.setZoom(scale);
    
    const vpt = this.canvas.viewportTransform!;
    vpt[4] = (this.canvas.getWidth() / 2) - (centerX * scale);
    vpt[5] = (this.canvas.getHeight() / 2) - (centerY * scale);
    
    this.canvas.setViewportTransform(vpt);
    this.canvas.renderAll();
  }

  // Cleanup
  public destroy(): void {
    this.resizeObserver?.disconnect();
    this.canvas.off('mouse:move');
  }
}