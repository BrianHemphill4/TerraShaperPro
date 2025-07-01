interface DeviceCapabilities {
  touch: boolean;
  pointer: 'coarse' | 'fine' | 'none';
  hover: boolean;
  gpu: {
    vendor: string;
    renderer: string;
    supported: boolean;
  };
  memory: {
    deviceMemory?: number;
    jsHeapSizeLimit?: number;
  };
  network: {
    type?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
    orientation: OrientationType;
  };
  performance: {
    hardwareConcurrency: number;
    reducedMotion: boolean;
    prefersColorScheme: 'light' | 'dark' | 'no-preference';
  };
}

interface PerformanceProfile {
  name: 'high' | 'medium' | 'low';
  settings: {
    enableAnimations: boolean;
    enableShadows: boolean;
    enableBlur: boolean;
    enableParticles: boolean;
    renderScale: number;
    maxCanvasSize: number;
    enableWebGL: boolean;
    enableRetinaScaling: boolean;
    gestureDelay: number;
  };
}

export class DeviceDetector {
  private static instance: DeviceDetector;
  private capabilities: DeviceCapabilities | null = null;
  private performanceProfile: PerformanceProfile | null = null;

  static getInstance(): DeviceDetector {
    if (!this.instance) {
      this.instance = new DeviceDetector();
    }
    return this.instance;
  }

  constructor() {
    this.detectCapabilities();
    this.setupViewportMeta();
  }

  private detectCapabilities(): DeviceCapabilities {
    if (this.capabilities) return this.capabilities;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    this.capabilities = {
      touch: this.detectTouch(),
      pointer: this.detectPointer(),
      hover: this.detectHover(),
      gpu: this.detectGPU(gl as WebGLRenderingContext),
      memory: this.detectMemory(),
      network: this.detectNetwork(),
      screen: this.detectScreen(),
      performance: this.detectPerformance()
    };

    return this.capabilities;
  }

  private detectTouch(): boolean {
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0 ||
           (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;
  }

  private detectPointer(): 'coarse' | 'fine' | 'none' {
    if (window.matchMedia('(pointer: coarse)').matches) return 'coarse';
    if (window.matchMedia('(pointer: fine)').matches) return 'fine';
    return 'none';
  }

  private detectHover(): boolean {
    return window.matchMedia('(hover: hover)').matches;
  }

  private detectGPU(gl: WebGLRenderingContext | null): DeviceCapabilities['gpu'] {
    if (!gl) {
      return {
        vendor: 'unknown',
        renderer: 'unknown',
        supported: false
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
      supported: true
    };
  }

  private detectMemory(): DeviceCapabilities['memory'] {
    const nav = navigator as any;
    
    return {
      deviceMemory: nav.deviceMemory,
      jsHeapSizeLimit: performance.memory ? (performance as any).memory.jsHeapSizeLimit : undefined
    };
  }

  private detectNetwork(): DeviceCapabilities['network'] {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) {
      return {};
    }

    return {
      type: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  private detectScreen(): DeviceCapabilities['screen'] {
    return {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'portrait-primary'
    };
  }

  private detectPerformance(): DeviceCapabilities['performance'] {
    return {
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' :
                         window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 
                         'no-preference'
    };
  }

  private setupViewportMeta(): void {
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }

    // Optimal viewport settings for touch devices
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover'
    );

    // Add touch-action CSS for better gesture control
    const style = document.createElement('style');
    style.textContent = `
      .touch-manipulation { touch-action: manipulation; }
      .touch-none { touch-action: none; }
      .touch-pan-x { touch-action: pan-x; }
      .touch-pan-y { touch-action: pan-y; }
      .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
      .safe-area-top { padding-top: env(safe-area-inset-top); }
    `;
    document.head.appendChild(style);
  }

  getCapabilities(): DeviceCapabilities {
    if (!this.capabilities) {
      this.capabilities = this.detectCapabilities();
    }
    return this.capabilities;
  }

  getPerformanceProfile(): PerformanceProfile {
    if (this.performanceProfile) return this.performanceProfile;

    const caps = this.getCapabilities();
    let profile: PerformanceProfile['name'] = 'high';

    // Determine performance tier based on various factors
    const score = this.calculatePerformanceScore(caps);
    
    if (score < 30) {
      profile = 'low';
    } else if (score < 60) {
      profile = 'medium';
    }

    // Define settings for each profile
    const profiles: Record<PerformanceProfile['name'], PerformanceProfile['settings']> = {
      high: {
        enableAnimations: true,
        enableShadows: true,
        enableBlur: true,
        enableParticles: true,
        renderScale: 1,
        maxCanvasSize: 4096,
        enableWebGL: true,
        enableRetinaScaling: true,
        gestureDelay: 0
      },
      medium: {
        enableAnimations: true,
        enableShadows: false,
        enableBlur: false,
        enableParticles: false,
        renderScale: 1,
        maxCanvasSize: 2048,
        enableWebGL: true,
        enableRetinaScaling: false,
        gestureDelay: 16
      },
      low: {
        enableAnimations: false,
        enableShadows: false,
        enableBlur: false,
        enableParticles: false,
        renderScale: 0.75,
        maxCanvasSize: 1024,
        enableWebGL: false,
        enableRetinaScaling: false,
        gestureDelay: 32
      }
    };

    this.performanceProfile = {
      name: profile,
      settings: profiles[profile]
    };

    return this.performanceProfile;
  }

  private calculatePerformanceScore(caps: DeviceCapabilities): number {
    let score = 0;

    // GPU (0-30 points)
    if (caps.gpu.supported) {
      score += 20;
      // Bonus for known good GPUs
      const renderer = caps.gpu.renderer.toLowerCase();
      if (renderer.includes('nvidia') || renderer.includes('radeon') || renderer.includes('m1') || renderer.includes('m2')) {
        score += 10;
      }
    }

    // Memory (0-20 points)
    const memory = caps.memory.deviceMemory;
    if (memory) {
      if (memory >= 8) score += 20;
      else if (memory >= 4) score += 15;
      else if (memory >= 2) score += 10;
      else score += 5;
    }

    // CPU cores (0-20 points)
    const cores = caps.performance.hardwareConcurrency;
    if (cores >= 8) score += 20;
    else if (cores >= 4) score += 15;
    else if (cores >= 2) score += 10;
    else score += 5;

    // Network (0-15 points)
    const network = caps.network;
    if (network.type === '4g' && !network.saveData) score += 15;
    else if (network.type === '3g') score += 10;
    else if (network.type === '2g' || network.saveData) score += 5;
    else score += 15; // Unknown, assume good

    // Screen (0-15 points)
    const pixelCount = caps.screen.width * caps.screen.height;
    if (pixelCount >= 2073600) score += 15; // 1920x1080 or higher
    else if (pixelCount >= 921600) score += 10; // 1280x720 or higher
    else score += 5;

    return score;
  }

  // Check specific capabilities
  isTouch(): boolean {
    return this.getCapabilities().touch;
  }

  isMobile(): boolean {
    const caps = this.getCapabilities();
    return caps.touch && caps.pointer === 'coarse' && caps.screen.width < 768;
  }

  isTablet(): boolean {
    const caps = this.getCapabilities();
    return caps.touch && caps.screen.width >= 768 && caps.screen.width < 1024;
  }

  isDesktop(): boolean {
    const caps = this.getCapabilities();
    return !caps.touch && caps.pointer === 'fine' && caps.hover;
  }

  supportsWebGL(): boolean {
    return this.getCapabilities().gpu.supported;
  }

  isLowEndDevice(): boolean {
    return this.getPerformanceProfile().name === 'low';
  }

  isHighEndDevice(): boolean {
    return this.getPerformanceProfile().name === 'high';
  }

  // Get optimized canvas settings
  getCanvasSettings() {
    const profile = this.getPerformanceProfile();
    const caps = this.getCapabilities();

    return {
      enableRetinaScaling: profile.settings.enableRetinaScaling && caps.screen.pixelRatio <= 2,
      renderOnAddRemove: !this.isLowEndDevice(),
      enablePointerEvents: !this.isTouch(),
      targetFindTolerance: this.isTouch() ? 8 : 2,
      perPixelTargetFind: !this.isLowEndDevice(),
      stopContextMenu: this.isTouch(),
      fireRightClick: !this.isTouch(),
      fireMiddleClick: !this.isTouch(),
      enablePointerEvents: true,
      // Touch-specific settings
      allowTouchScrolling: this.isTouch(),
      selection: !this.isTouch(), // Disable selection on touch devices by default
      // Performance settings
      renderingMode: profile.settings.enableWebGL ? 'webgl' : '2d',
      maxZoom: this.isLowEndDevice() ? 3 : 5,
      minZoom: 0.1
    };
  }
}

// Singleton instance
export const deviceDetector = DeviceDetector.getInstance();

// Convenience exports
export const isMobile = () => deviceDetector.isMobile();
export const isTablet = () => deviceDetector.isTablet();
export const isDesktop = () => deviceDetector.isDesktop();
export const isTouch = () => deviceDetector.isTouch();
export const getDeviceCapabilities = () => deviceDetector.getCapabilities();
export const getPerformanceProfile = () => deviceDetector.getPerformanceProfile();
export const getCanvasSettings = () => deviceDetector.getCanvasSettings();