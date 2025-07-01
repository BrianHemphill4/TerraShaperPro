import { performanceMonitor } from '../performance/performanceMonitor';
import { matrixPool, withPooledObject } from '../performance/objectPool';

interface WebGLProgram {
  program: WebGLProgram;
  attributes: Record<string, number>;
  uniforms: Record<string, WebGLUniformLocation>;
}

interface TextureInfo {
  texture: WebGLTexture;
  width: number;
  height: number;
  lastUsed: number;
}

interface ShaderSource {
  vertex: string;
  fragment: string;
}

export class WebGLRenderer {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private programs = new Map<string, WebGLProgram>();
  private textures = new Map<string, TextureInfo>();
  private vertexBuffers = new Map<string, WebGLBuffer>();
  private frameBuffer?: WebGLFramebuffer;
  private renderTexture?: WebGLTexture;
  private maxTextureSize: number;
  private maxTextureUnits: number;
  private isWebGL2: boolean;
  private currentProgram?: string;
  private stats = {
    drawCalls: 0,
    textureBinds: 0,
    programSwitches: 0,
    vertexCount: 0
  };

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    }) || canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;
    this.isWebGL2 = gl instanceof WebGL2RenderingContext;
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    this.initializeDefaults();
    this.createDefaultShaders();
  }

  private initializeDefaults(): void {
    const gl = this.gl;

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Disable depth testing (2D rendering)
    gl.disable(gl.DEPTH_TEST);

    // Set viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear color
    gl.clearColor(0, 0, 0, 0);
  }

  private createDefaultShaders(): void {
    // Basic 2D shader
    this.createProgram('basic2d', {
      vertex: `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        
        uniform mat3 u_matrix;
        
        varying vec2 v_texCoord;
        
        void main() {
          vec3 position = u_matrix * vec3(a_position, 1.0);
          gl_Position = vec4(position.xy, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `,
      fragment: `
        precision mediump float;
        
        uniform sampler2D u_texture;
        uniform vec4 u_color;
        uniform float u_useTexture;
        
        varying vec2 v_texCoord;
        
        void main() {
          if (u_useTexture > 0.5) {
            gl_FragColor = texture2D(u_texture, v_texCoord) * u_color;
          } else {
            gl_FragColor = u_color;
          }
        }
      `
    });

    // Blur shader
    this.createProgram('blur', {
      vertex: `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        
        uniform mat3 u_matrix;
        
        varying vec2 v_texCoord;
        
        void main() {
          vec3 position = u_matrix * vec3(a_position, 1.0);
          gl_Position = vec4(position.xy, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `,
      fragment: `
        precision mediump float;
        
        uniform sampler2D u_texture;
        uniform vec2 u_textureSize;
        uniform vec2 u_direction;
        uniform float u_radius;
        
        varying vec2 v_texCoord;
        
        void main() {
          vec4 color = vec4(0.0);
          vec2 texelSize = 1.0 / u_textureSize;
          float total = 0.0;
          
          for (float i = -u_radius; i <= u_radius; i++) {
            float weight = 1.0 - abs(i) / u_radius;
            vec2 offset = i * texelSize * u_direction;
            color += texture2D(u_texture, v_texCoord + offset) * weight;
            total += weight;
          }
          
          gl_FragColor = color / total;
        }
      `
    });

    // Shadow shader
    this.createProgram('shadow', {
      vertex: `
        attribute vec2 a_position;
        
        uniform mat3 u_matrix;
        uniform vec2 u_offset;
        
        void main() {
          vec3 position = u_matrix * vec3(a_position + u_offset, 1.0);
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragment: `
        precision mediump float;
        
        uniform vec4 u_color;
        uniform float u_blur;
        
        void main() {
          gl_FragColor = u_color;
        }
      `
    });
  }

  private createProgram(name: string, shaders: ShaderSource): void {
    const gl = this.gl;

    const vertexShader = this.compileShader(gl.VERTEX_SHADER, shaders.vertex);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, shaders.fragment);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`Failed to link program: ${info}`);
    }

    // Get attribute locations
    const attributes: Record<string, number> = {};
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    
    for (let i = 0; i < numAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (info) {
        attributes[info.name] = gl.getAttribLocation(program, info.name);
      }
    }

    // Get uniform locations
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        const location = gl.getUniformLocation(program, info.name);
        if (location) {
          uniforms[info.name] = location;
        }
      }
    }

    this.programs.set(name, { program, attributes, uniforms });

    // Clean up shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    
    if (!shader) throw new Error('Failed to create shader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${info}`);
    }

    return shader;
  }

  useProgram(name: string): void {
    if (this.currentProgram === name) return;

    const program = this.programs.get(name);
    if (!program) throw new Error(`Program not found: ${name}`);

    this.gl.useProgram(program.program);
    this.currentProgram = name;
    this.stats.programSwitches++;
  }

  createTexture(id: string, source: HTMLImageElement | HTMLCanvasElement | ImageData): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture();
    
    if (!texture) throw new Error('Failed to create texture');

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload texture data
    if (source instanceof ImageData) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, source.width, source.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source.data);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }

    const width = source.width;
    const height = source.height;

    this.textures.set(id, {
      texture,
      width,
      height,
      lastUsed: performance.now()
    });

    // Clean up old textures if needed
    this.cleanupTextures();

    return texture;
  }

  bindTexture(id: string, unit = 0): boolean {
    const textureInfo = this.textures.get(id);
    if (!textureInfo) return false;

    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    
    textureInfo.lastUsed = performance.now();
    this.stats.textureBinds++;
    
    return true;
  }

  private cleanupTextures(): void {
    if (this.textures.size < 100) return;

    const now = performance.now();
    const maxAge = 60000; // 1 minute

    for (const [id, info] of this.textures.entries()) {
      if (now - info.lastUsed > maxAge) {
        this.gl.deleteTexture(info.texture);
        this.textures.delete(id);
      }
    }
  }

  createVertexBuffer(vertices: Float32Array): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    
    if (!buffer) throw new Error('Failed to create buffer');

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    return buffer;
  }

  drawRect(x: number, y: number, width: number, height: number, color: [number, number, number, number]): void {
    const gl = this.gl;
    
    this.useProgram('basic2d');
    const program = this.programs.get('basic2d')!;

    // Create vertices for rectangle
    const vertices = new Float32Array([
      x, y,
      x + width, y,
      x, y + height,
      x + width, y + height
    ]);

    const buffer = this.createVertexBuffer(vertices);

    // Set up attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.attributes.a_position);
    gl.vertexAttribPointer(program.attributes.a_position, 2, gl.FLOAT, false, 0, 0);

    // Set uniforms
    const matrix = this.getProjectionMatrix();
    gl.uniformMatrix3fv(program.uniforms.u_matrix, false, matrix);
    gl.uniform4fv(program.uniforms.u_color, color);
    gl.uniform1f(program.uniforms.u_useTexture, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    this.stats.drawCalls++;
    this.stats.vertexCount += 4;
    performanceMonitor.incrementDrawCalls();

    // Clean up
    gl.deleteBuffer(buffer);
  }

  drawImage(textureId: string, x: number, y: number, width: number, height: number, opacity = 1): void {
    if (!this.bindTexture(textureId)) return;

    const gl = this.gl;
    
    this.useProgram('basic2d');
    const program = this.programs.get('basic2d')!;

    // Create vertices and texture coordinates
    const vertices = new Float32Array([
      x, y, 0, 0,
      x + width, y, 1, 0,
      x, y + height, 0, 1,
      x + width, y + height, 1, 1
    ]);

    const buffer = this.createVertexBuffer(vertices);

    // Set up attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.attributes.a_position);
    gl.vertexAttribPointer(program.attributes.a_position, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(program.attributes.a_texCoord);
    gl.vertexAttribPointer(program.attributes.a_texCoord, 2, gl.FLOAT, false, 16, 8);

    // Set uniforms
    const matrix = this.getProjectionMatrix();
    gl.uniformMatrix3fv(program.uniforms.u_matrix, false, matrix);
    gl.uniform4f(program.uniforms.u_color, 1, 1, 1, opacity);
    gl.uniform1f(program.uniforms.u_useTexture, 1);
    gl.uniform1i(program.uniforms.u_texture, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    this.stats.drawCalls++;
    this.stats.vertexCount += 4;
    performanceMonitor.incrementDrawCalls();

    // Clean up
    gl.deleteBuffer(buffer);
  }

  private getProjectionMatrix(): Float32Array {
    return withPooledObject(matrixPool, matrix => {
      const width = this.gl.canvas.width;
      const height = this.gl.canvas.height;

      // Convert from pixel coordinates to clip space
      matrix.set(
        2 / width, 0, 0,
        0, -2 / height, 0,
        -1, 1, 1
      );

      return new Float32Array([
        matrix.a, matrix.b, 0,
        matrix.c, matrix.d, 0,
        matrix.e, matrix.f, 1
      ]);
    });
  }

  beginBatch(): void {
    // Reset stats for this batch
    this.stats.drawCalls = 0;
    this.stats.textureBinds = 0;
    this.stats.programSwitches = 0;
    this.stats.vertexCount = 0;
  }

  endBatch(): void {
    // Flush any pending operations
    this.gl.flush();
  }

  clear(color?: [number, number, number, number]): void {
    const gl = this.gl;
    
    if (color) {
      gl.clearColor(...color);
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  resize(width: number, height: number): void {
    const gl = this.gl;
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  getStats() {
    return { ...this.stats };
  }

  isSupported(): boolean {
    return true;
  }

  destroy(): void {
    const gl = this.gl;

    // Delete all programs
    for (const [, program] of this.programs) {
      gl.deleteProgram(program.program);
    }
    this.programs.clear();

    // Delete all textures
    for (const [, info] of this.textures) {
      gl.deleteTexture(info.texture);
    }
    this.textures.clear();

    // Delete all buffers
    for (const [, buffer] of this.vertexBuffers) {
      gl.deleteBuffer(buffer);
    }
    this.vertexBuffers.clear();

    // Delete framebuffer
    if (this.frameBuffer) {
      gl.deleteFramebuffer(this.frameBuffer);
    }
    if (this.renderTexture) {
      gl.deleteTexture(this.renderTexture);
    }
  }
}

// WebGL-accelerated canvas wrapper
export class WebGLCanvas {
  private renderer: WebGLRenderer;
  private fallbackCanvas?: HTMLCanvasElement;
  private fallbackCtx?: CanvasRenderingContext2D;
  private useWebGL = true;

  constructor(canvas: HTMLCanvasElement) {
    try {
      this.renderer = new WebGLRenderer(canvas);
    } catch (error) {
      console.warn('WebGL initialization failed, falling back to 2D context', error);
      this.useWebGL = false;
      this.setupFallback(canvas);
    }
  }

  private setupFallback(canvas: HTMLCanvasElement): void {
    this.fallbackCanvas = canvas;
    this.fallbackCtx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    }) || undefined;

    if (!this.fallbackCtx) {
      throw new Error('Failed to initialize 2D context');
    }
  }

  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    if (this.useWebGL) {
      const rgba = this.parseColor(color);
      this.renderer.drawRect(x, y, width, height, rgba);
    } else if (this.fallbackCtx) {
      this.fallbackCtx.fillStyle = color;
      this.fallbackCtx.fillRect(x, y, width, height);
    }
  }

  drawImage(image: HTMLImageElement | HTMLCanvasElement, x: number, y: number, width?: number, height?: number): void {
    if (this.useWebGL) {
      const id = `img_${image.src || 'canvas'}`;
      if (!this.renderer.bindTexture(id)) {
        this.renderer.createTexture(id, image);
      }
      this.renderer.drawImage(id, x, y, width || image.width, height || image.height);
    } else if (this.fallbackCtx) {
      if (width !== undefined && height !== undefined) {
        this.fallbackCtx.drawImage(image, x, y, width, height);
      } else {
        this.fallbackCtx.drawImage(image, x, y);
      }
    }
  }

  clear(color?: string): void {
    if (this.useWebGL) {
      const rgba = color ? this.parseColor(color) : undefined;
      this.renderer.clear(rgba);
    } else if (this.fallbackCtx && this.fallbackCanvas) {
      if (color) {
        this.fallbackCtx.fillStyle = color;
        this.fallbackCtx.fillRect(0, 0, this.fallbackCanvas.width, this.fallbackCanvas.height);
      } else {
        this.fallbackCtx.clearRect(0, 0, this.fallbackCanvas.width, this.fallbackCanvas.height);
      }
    }
  }

  private parseColor(color: string): [number, number, number, number] {
    // Simple color parser (extend as needed)
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return [r, g, b, a];
    }
    
    // Default to black
    return [0, 0, 0, 1];
  }

  resize(width: number, height: number): void {
    if (this.useWebGL) {
      this.renderer.resize(width, height);
    } else if (this.fallbackCanvas) {
      this.fallbackCanvas.width = width;
      this.fallbackCanvas.height = height;
    }
  }

  isWebGLEnabled(): boolean {
    return this.useWebGL;
  }

  getStats() {
    if (this.useWebGL) {
      return this.renderer.getStats();
    }
    return {
      drawCalls: 0,
      textureBinds: 0,
      programSwitches: 0,
      vertexCount: 0
    };
  }

  destroy(): void {
    if (this.useWebGL) {
      this.renderer.destroy();
    }
  }
}