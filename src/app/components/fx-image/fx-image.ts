import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  HostListener,
  PLATFORM_ID,
  inject,
  effect,
  signal,
} from '@angular/core';
import { isPlatformBrowser, DecimalPipe } from '@angular/common';
import { Theme as ThemeService } from '../../services/ui/theme';
import { Color as ColorService } from '../../services/ui/color';

@Component({
  selector: 'app-fx-image',
  imports: [DecimalPipe],
  standalone: true,
  template: `
    <div class="fx-container">
      <canvas #fxcanvas class="fx-canvas"></canvas>

      <div class="fx-controls">
        <!-- Image Rendering Modes -->
        <div class="control-group">
          <span class="control-label">Render:</span>
          <button (click)="setImageRendering('pixelated')" [class.active]="imageRenderingMode() === 'pixelated'" class="fx-btn">🟦 Pixelated</button>
          <button (click)="setImageRendering('crisp-edges')" [class.active]="imageRenderingMode() === 'crisp-edges'" class="fx-btn">🔷 Crisp</button>
          <button (click)="setImageRendering('smooth')" [class.active]="imageRenderingMode() === 'smooth'" class="fx-btn">🔲 Smooth</button>
          <button (click)="setImageRendering('auto')" [class.active]="imageRenderingMode() === 'auto'" class="fx-btn">🎯 Auto</button>
        </div>

        <!-- Anaglyph 3D Toggle -->
        <div class="control-group">
          <span class="control-label">anaglyph:</span>
          <button (click)="toggleAnaglyphMode()" [class.active]="anaglyphMode()" class="fx-btn fx-3d-btn">🥽 {{ anaglyphMode() ? '3D ON' : '3D OFF' }}</button>
        </div>

        <!-- Parallax Controls -->
        <div class="control-group">
          <span class="control-label">parallax:</span>
          <button (click)="setParallax(0)" [class.active]="anaglyphParallax() === 0" class="fx-btn">🏠 NONE</button>
          <button (click)="setParallax(0.5)" [class.active]="anaglyphParallax() === 0.5" class="fx-btn">🪶 Low</button>
          <button (click)="setParallax(1)" [class.active]="anaglyphParallax() === 1" class="fx-btn">🎯 Norm</button>
          <button (click)="setParallax(2)" [class.active]="anaglyphParallax() === 2" class="fx-btn">🎨 High</button>
        </div>

        <!-- Base effects -->
        <div class="control-group">
          <span class="control-label">Base:</span>
          <button (click)="toggleInvert()" [class.active]="applyInvert()" class="fx-btn">↔️ {{ applyInvert() ? 'INVERT ON' : 'INVERT OFF' }}</button>
          <button (click)="toggleSolarize()" [class.active]="applySolarize()" class="fx-btn">☀️ {{ applySolarize() ? 'SOLAR ON' : 'SOLAR OFF' }}</button>
        </div>

        <!-- Extra effects -->
        <div class="control-group">
          <span class="control-label">Extra:</span>
          <button (click)="toggleColorMultiplier()" [class.active]="applyColorMultiplier()" class="fx-btn">🎨 {{ applyColorMultiplier() ? 'MULTI ON' : 'MULTI OFF' }}</button>
          <button (click)="toggleNoise()" [class.active]="applyNoise()" class="fx-btn">📺 {{ applyNoise() ? 'NOISE ON' : 'NOISE OFF' }}</button>
        </div>

        <!-- New visual toggles -->
        <div class="control-group">
          <span class="control-label">FX:</span>
          <button (click)="toggleWiggle()" [class.active]="wiggle()" class="fx-btn">🔁 RGB Wiggle</button>
          <button (click)="toggleCRT()" [class.active]="crt()" class="fx-btn">📺 CRT Lines</button>
          <button (click)="toggleVHS()" [class.active]="vhs()" class="fx-btn">📼 VHS Jitter</button>
          <button (click)="toggleChroma()" [class.active]="chroma()" class="fx-btn">🌈 Radial Chroma</button>
        </div>

        <div class="control-group">
          <span class="control-label">Wiggle Speed</span>
          <input type="range" min="0" max="3" step="0.05" [value]="wiggleSpeed()" (input)="setWiggleSpeed($any($event.target).value)">
          <span class="control-value">{{ wiggleSpeed() | number:'1.2-2' }}</span>
        </div>

        <div class="control-group">
          <span class="control-label">Chroma Intensity</span>
          <input type="range" min="0" max="30" step="0.5" [value]="chromaIntensity()" (input)="setChromaIntensity($any($event.target).value)">
          <span class="control-value">{{ chromaIntensity() | number:'1.1-1' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .fx-controls { position:relative; z-index:1000; color:var(--color-text); border:1px solid var(--color-border); background:var(--color-primary); padding:12px; border-radius:4px; pointer-events:auto; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-top:16px; width:fit-content; align-self:center; }
    .fx-btn { background:var(--color-primary); color:var(--color-text); border:1px solid var(--color-border); padding:6px 12px; font-family:var(--font-dev); font-size:12px; cursor:pointer; border-radius:2px; box-shadow:2px 2px 0px var(--color-border); transition:all 0.1s ease; margin: 2px; }
    .fx-btn:hover{ transform:translate(-1px,-1px); box-shadow:3px 3px 0px var(--color-border); }
    .fx-btn:active{ transform:translate(1px,1px); box-shadow:1px 1px 0px var(--color-border); }
    .fx-btn.active{ background:var(--color-secondary); border-color:var(--color-accent); color:var(--color-background); }
    .fx-3d-btn.active{ background:var(--color-accent); border-color:var(--color-secondary); color:var(--color-background); animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.7 } }
    `
  ]
})
export class FxImageComponent implements AfterViewInit {
  @ViewChild('fxcanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private isBrowser = false;
  imageRenderingMode = signal<'auto' | 'smooth' | 'crisp-edges' | 'pixelated'>('pixelated');

  // existing toggles
  anaglyphMode = signal(false);
  anaglyphParallax = signal(1);
  applyInvert = signal(false);
  applySolarize = signal(false);
  applyColorMultiplier = signal(false);
  applyNoise = signal(false);

  // new toggles & params
  wiggle = signal(false);            // animated RGB wiggle
  wiggleSpeed = signal(0.8);         // frequency multiplier
  crt = signal(false);               // per-line offset (CRT)
  vhs = signal(false);               // noise banding / VHS jitter
  chroma = signal(false);            // radial chromatic aberration
  chromaIntensity = signal(8);       // pixels amount for chroma displacement

  private ctx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;
  private img!: HTMLImageElement;

  // Rendering optimization
  private isAnimating = false;
  private animationFrameId: number | null = null;
  private cachedImageData: ImageData | null = null;
  private lastStaticEffectsHash = '';

  // Offscreen canvases reused for performance
  private leftCanvas!: HTMLCanvasElement;
  private leftCtx!: CanvasRenderingContext2D;
  private rightCanvas!: HTMLCanvasElement;
  private rightCtx!: CanvasRenderingContext2D;

  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // re-draw when theme or color changes
    effect(() => {
      this.themeService.currentThemeSignal();
      this.colorService.currentColorSignal();
      // the draw loop reads getColorMultipliers directly when rendering
    });
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.createOffscreenCanvases();

    // responsive sizing
    this.resizeCanvas();

    // load image
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = 'assets/images/test.jpg';
    this.img.onload = () => this.redraw();
  }

  private createOffscreenCanvases() {
    this.leftCanvas = document.createElement('canvas');
    this.leftCtx = this.leftCanvas.getContext('2d')!;
    this.rightCanvas = document.createElement('canvas');
    this.rightCtx = this.rightCanvas.getContext('2d')!;
  }

  private getColorMultipliers(): { red: number; green: number; blue: number } {
    const theme = this.themeService.currentThemeValue;
    const color = this.colorService.currentColorValue;

    switch (`${theme}-${color}`) {
      case 'dark-purple':
        return { red: 0.69, green: 0.3, blue: 1.0 };
      case 'dark-orange':
        return { red: 1.0, green: 0.6, blue: 0.3 };
      case 'dark-green':
        return { red: 0.4, green: 1.0, blue: 0.5 };
      case 'light-purple':
        return { red: 0.85, green: 0.75, blue: 0.9 };
      case 'light-orange':
        return { red: 0.95, green: 0.85, blue: 0.75 };
      case 'light-green':
        return { red: 0.8, green: 0.95, blue: 0.85 };
      default:
        return { red: 0.69, green: 0.3, blue: 1.0 };
    }
  }

  @HostListener('window:resize')
  resizeCanvas() {
    if (!this.canvas) return;

    const parent = this.canvas.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const containerWidth = parentRect.width;

    // maintain aspect ratio WITHOUT checking parent height
    const aspectRatio = 16 / 9;
    const w = containerWidth;
    const h = w / aspectRatio;

    const dpr = window.devicePixelRatio || 1;

    // CSS pixel size
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    // Real pixel buffer
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Offscreen canvases
    this.leftCanvas.width = this.canvas.width;
    this.leftCanvas.height = this.canvas.height;

    this.rightCanvas.width = this.canvas.width;
    this.rightCanvas.height = this.canvas.height;

    this.leftCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.rightCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Optimized rendering methods
  private startAnimationLoop() {
    if (this.isAnimating && !this.animationFrameId) {
      const animate = (timestamp: number) => {
        if (this.isAnimating) {
          this.renderAnimatedFrame(timestamp / 1000);
          this.animationFrameId = requestAnimationFrame(animate);
        }
      };
      this.animationFrameId = requestAnimationFrame(animate);
    }
  }

  private stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Method to check if animation is needed
  private shouldAnimate(): boolean {
    return this.wiggle() || this.crt() || this.vhs() || this.anaglyphMode() || this.applyNoise();
  }

  // Generate hash of static effect states
  private getStaticEffectsHash(): string {
    return `${this.applyInvert()}-${this.applySolarize()}-${this.applyColorMultiplier()}-${this.chroma()}-${this.themeService.currentThemeValue}-${this.colorService.currentColorValue}`;
  }

  // Main redraw method - decides whether to render static or start animation
  private redraw() {
    if (!this.canvas || !this.ctx || !this.img) return;

    const needsAnimation = this.shouldAnimate();

    if (needsAnimation) {
      // Start animation loop if not already running
      if (!this.isAnimating) {
        this.isAnimating = true;
        this.startAnimationLoop();
      }
    } else {
      // Stop animation and render static frame
      this.isAnimating = false;
      this.stopAnimationLoop();
      this.renderStaticFrame();
    }
  }

  // Render static frame (when no animation is needed)
  private renderStaticFrame() {
    if (!this.canvas || !this.ctx || !this.img) return;

    // Check if static effects have changed
    const currentHash = this.getStaticEffectsHash();
    if (currentHash === this.lastStaticEffectsHash && this.cachedImageData) {
      // No changes, just draw cached result
      this.ctx.putImageData(this.cachedImageData, 0, 0);
      return;
    }

    // Render static effects
    this.renderImage(0); // time 0 for static rendering
    // Cache the full buffer-sized image data
    this.cachedImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.lastStaticEffectsHash = currentHash;
  }

  // Render animated frame (called in animation loop)
  private renderAnimatedFrame(timeSec: number) {
    if (!this.canvas || !this.ctx || !this.img) return;

    // Always clear and render for animated effects
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderImage(timeSec);
  }

  // Called after animation state changes to update rendering
  private updateAnimationState() {
    setTimeout(() => this.redraw(), 0);
  }

  /**
   * Renders frame. time is seconds (floating)
   */
  private renderImage(timeSec: number) {
    const dpr = window.devicePixelRatio || 1;
    // logical canvas dims in CSS pixels
    const cssW = this.canvas.width / dpr;
    const cssH = this.canvas.height / dpr;
    // Actual canvas buffer dimensions (device pixels)
    const bufferW = this.canvas.width;
    const bufferH = this.canvas.height;
    const multipliers = this.getColorMultipliers();

    // If not anaglyph, do 2D processing with optional CRT/VHS/wiggle overlays
    if (!this.anaglyphMode()) {
      // draw base image scaled to CSS dims (ctx transform already accounts for dpr)
      this.ctx.drawImage(this.img, 0, 0, cssW, cssH);

      // apply per-pixel effects (invert/solarize/color multiplier/noise)
      // getImageData needs to match the actual buffer size, not CSS size
      const imageData = this.ctx.getImageData(0, 0, bufferW, bufferH);
      const processed = this.applyEffectsToImageData(imageData.data, multipliers, timeSec);
      imageData.data.set(processed);
      this.ctx.putImageData(imageData, 0, 0);

      // optionally apply CRT scanlines and wiggle and VHS jitter as overlays (cheaper than per-pixel for some)
      if (this.crt() || this.wiggle() || this.vhs() || this.chroma()) {
        // capture current pixels and recompose with channel-shift techniques
        const src = this.ctx.getImageData(0, 0, bufferW, bufferH);
        const out = this.ctx.createImageData(bufferW, bufferH);

        // compute wiggle offsets (per-channel) if enabled
        const wiggleEnabled = this.wiggle();
        const wiggleSpeedVal = this.wiggleSpeed();
        const time = timeSec * wiggleSpeedVal;
        const rShift = wiggleEnabled ? Math.round(Math.sin(time * 2.1) * 2 + Math.cos(time * 0.7) * 1.5) : 0;
        const gShift = wiggleEnabled ? Math.round(Math.sin(time * 1.7 + 1) * 2) : 0;
        const bShift = wiggleEnabled ? Math.round(Math.sin(time * 1.2 + 2) * 2 + Math.cos(time * 0.5) * 1) : 0;

        // chroma radial strength
        const chromaEnabled = this.chroma();
        const chromaStr = this.chromaIntensity();

        // iterate per-scanline optionally applying CRT and per-pixel channel offset
        // Work directly in buffer pixel space for consistency
        for (let y = 0; y < bufferH; y++) {
          // CRT per-line offset (subtle), more jitter for VHS
          const crtOffset = this.crt() ? Math.round(Math.sin((y / 3 + time * 30) * 0.02) * 3) : 0;
          const vhsBand = this.vhs() ? Math.round((Math.random() - 0.5) * 6) : 0;
          const lineOffset = crtOffset + vhsBand;

          for (let x = 0; x < bufferW; x++) {
            const idx = (y * bufferW + x) * 4;

            // helper: sample from src with channel-specific offsets (with optional radial chroma)
            const sample = (cx: number, cy: number, channelShift: number) => {
              // radial chroma displacement (directional) - compute vector from center
              let sx = cx + channelShift;
              let sy = cy;
              if (chromaEnabled) {
                const cxCenter = bufferW / 2;
                const cyCenter = bufferH / 2;
                const dx = cx - cxCenter;
                const dy = cy - cyCenter;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                // offset outwards proportional to distance and chromaStr
                const factor = (dist / Math.max(bufferW, bufferH)) * chromaStr * dpr * 0.15;
                sx += Math.round(dx / dist * factor);
                sy += Math.round(dy / dist * factor);
              }
              // apply per-line lineOffset
              sx += lineOffset;
              // clamp sampling in buffer space
              if (sx < 0) sx = 0;
              if (sx >= bufferW) sx = bufferW - 1;
              if (sy < 0) sy = 0;
              if (sy >= bufferH) sy = bufferH - 1;
              // Direct buffer pixel indexing
              const sidx = (Math.floor(sy) * bufferW + Math.floor(sx)) * 4;
              return [
                src.data[sidx],     // r
                src.data[sidx + 1], // g
                src.data[sidx + 2], // b
                src.data[sidx + 3]
              ];
            };

            // red channel sampling (apply rShift)
            const rSample = sample(x, y, rShift);
            const gSample = sample(x, y, gShift);
            const bSample = sample(x, y, bShift);

            out.data[idx] = rSample[0];
            out.data[idx + 1] = gSample[1];
            out.data[idx + 2] = bSample[2];
            out.data[idx + 3] = 255;
          }
        }

        // put merged result
        this.ctx.putImageData(out, 0, 0);
      }

      // optional floating noise overlay
      if (this.applyNoise() || this.vhs()) {
        this.addThemeNoiseOverlay(cssW, cssH, timeSec);
      }

      return; // done non-anaglyph path
    }

    // -----------------------------
// ANAGLYPH PATH (cleaned)
// -----------------------------
const baseParallaxOffset = Math.max(2, Math.floor(cssW / 200));
const parallaxOffset = baseParallaxOffset * this.anaglyphParallax();

// Clear offscreen canvases
this.leftCtx.clearRect(0, 0, cssW, cssH);
this.rightCtx.clearRect(0, 0, cssW, cssH);

// Draw left (cyan) and right (red) shifted images
this.leftCtx.drawImage(this.img, -parallaxOffset / 2, 0, cssW, cssH);
this.rightCtx.drawImage(this.img, parallaxOffset / 2, 0, cssW, cssH);

// Get buffer image data
const leftImageData = this.leftCtx.getImageData(0, 0, bufferW, bufferH);
const rightImageData = this.rightCtx.getImageData(0, 0, bufferW, bufferH);

const out = this.ctx.createImageData(bufferW, bufferH);

// Compute per-channel wiggle offsets
const wiggleEnabled = this.wiggle();
const t = timeSec * this.wiggleSpeed();
const rShift = wiggleEnabled ? Math.round(Math.sin(t * 2.2) * 1.5 + Math.cos(t * 0.6) * 1.2) : 0;
const gShift = wiggleEnabled ? Math.round(Math.sin(t * 1.8 + 1) * 1.8) : 0;
const bShift = wiggleEnabled ? Math.round(Math.sin(t * 1.3 + 2) * 1.2) : 0;

const chromaEnabled = this.chroma();
const chromaStrength = this.chromaIntensity();

for (let y = 0; y < bufferH; y++) {
  const crtOffset = this.crt() ? Math.round(Math.sin((y / 2 + t * 40) * 0.03) * 2) : 0;
  const vhsOffset = this.vhs() ? Math.round((Math.random() - 0.5) * 6) : 0;
  const lineOffset = crtOffset + vhsOffset;

  for (let x = 0; x < bufferW; x++) {
    const idx = (y * bufferW + x) * 4;

    const sampleChannel = (imgData: ImageData, px: number, py: number, channelShift: number) => {
      if (chromaEnabled) {
        const cx = bufferW / 2;
        const cy = bufferH / 2;
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const factor = (dist / Math.max(bufferW, bufferH)) * chromaStrength * dpr * 0.12;
        px += Math.round((dx / dist) * factor);
        py += Math.round((dy / dist) * factor);
      }
      px += lineOffset + channelShift;
      px = Math.max(0, Math.min(bufferW - 1, px));
      py = Math.max(0, Math.min(bufferH - 1, py));
      const sidx = (Math.floor(py) * bufferW + Math.floor(px)) * 4;
      return [
        imgData.data[sidx],
        imgData.data[sidx + 1],
        imgData.data[sidx + 2],
        imgData.data[sidx + 3]
      ];
    };

    // Red = right image, Green/Blue = left image
    let r = sampleChannel(rightImageData, x, y, rShift)[0];
    let g = sampleChannel(leftImageData, x, y, gShift)[1];
    let b = sampleChannel(leftImageData, x, y, bShift)[2];

    // Apply invert/solarize/noise
    if (this.applyInvert()) { r = 255 - r; g = 255 - g; b = 255 - b; }
    if (this.applySolarize()) { r = r > 128 ? 255 - r : r; g = g > 128 ? 255 - g : g; b = b > 128 ? 255 - b : b; }
    if (this.applyNoise()) {
      const noiseVal = (Math.random() - 0.5) * 40;
      r = Math.min(255, Math.max(0, r + noiseVal));
      g = Math.min(255, Math.max(0, g + noiseVal));
      b = Math.min(255, Math.max(0, b + noiseVal));
    }

    if (this.applyColorMultiplier()) {
      r = Math.min(255, r * multipliers.red);
      g = Math.min(255, g * multipliers.green);
      b = Math.min(255, b * multipliers.blue);
    }

    out.data[idx] = Math.round(r);
    out.data[idx + 1] = Math.round(g);
    out.data[idx + 2] = Math.round(b);
    out.data[idx + 3] = 255;
  }
}

// Draw final anaglyph
this.ctx.putImageData(out, 0, 0);

// Optional noise/band overlays
if (this.applyNoise() || this.vhs()) {
  this.addThemeNoiseOverlay(cssW, cssH, timeSec);
}

// Add instructions text
    this.addAnaglyphInstructions();
  }

  // Applies base pixel-level effects (invert/solarize/color-mult/noise)
  private applyEffectsToImageData(data: Uint8ClampedArray, multipliers: { red: number; green: number; blue: number }, timeSec: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data.length);
    result.set(data);

    // Slight frame-dependent noise for analog feel (cheap)
    const frameNoise = this.vhs() ? (Math.sin(timeSec * 40) * 6) : 0;

    for (let i = 0; i < result.length; i += 4) {
      let r = result[i];
      let g = result[i + 1];
      let b = result[i + 2];

      if (this.applyInvert()) {
        r = 255 - r; g = 255 - g; b = 255 - b;
      }

      if (this.applySolarize()) {
        r = r > 128 ? 255 - r : r;
        g = g > 128 ? 255 - g : g;
        b = b > 128 ? 255 - b : b;
      }

      if (this.applyNoise()) {
        const noise = (Math.random() - 0.5) * 40 + frameNoise;
        r = Math.min(255, Math.max(0, r + noise));
        g = Math.min(255, Math.max(0, g + noise));
        b = Math.min(255, Math.max(0, b + noise));
      }

      if (this.applyColorMultiplier()) {
        r = Math.min(255, r * multipliers.red);
        g = Math.min(255, g * multipliers.green);
        b = Math.min(255, b * multipliers.blue);
      }

      result[i] = Math.round(r);
      result[i + 1] = Math.round(g);
      result[i + 2] = Math.round(b);
      result[i + 3] = 255;
    }

    return result;
  }

  // Subtle overlay noise & horizontal bands for VHS look
  private addThemeNoiseOverlay(width: number, height: number, timeSec: number) {
    // draw semi-transparent noise lines and bands
    const alpha = 0.06;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'overlay';

    // horizontal noise bands
    if (this.vhs()) {
      for (let y = 0; y < height; y += Math.round(6 + Math.random() * 12)) {
        const bandHeight = Math.max(1, Math.round(1 + Math.random() * 3));
        this.ctx.fillStyle = `rgba(0,0,0,${alpha * Math.random()})`;
        this.ctx.fillRect(0, y, width, bandHeight);
      }
    }

    // light flicker / scanline overlay for CRT
    if (this.crt()) {
      this.ctx.globalCompositeOperation = 'soft-light';
      this.ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.sin(timeSec * 30) * 0.006})`;
      for (let y = 0; y < height; y += 2) {
        this.ctx.fillRect(0, y, width, 1);
      }
    }

    // grain overlay if noise enabled
    if (this.applyNoise()) {
      const imgData = this.ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const g = (Math.random() - 0.5) * 12;
        imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + g));
        imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + g));
        imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + g));
      }
      this.ctx.putImageData(imgData, 0, 0);
    }

    this.ctx.restore();
  }

  private addAnaglyphInstructions() {
    const theme = this.themeService.currentThemeValue;
    const textColor = theme === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';

    this.ctx.save();
    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'center';

    const centerX = this.canvas.width / (window.devicePixelRatio || 1) / 2;
    const bottomY = this.canvas.height / (window.devicePixelRatio || 1) - 28;

    this.ctx.fillText('👁️ Visible Red-Cyan Dual Image Effect', centerX, bottomY);
    this.ctx.fillText('(Red = Right View, Cyan = Left View)  •  Mix effects to taste', centerX, bottomY + 18);

    this.ctx.restore();
  }

  // Public control methods
  setImageRendering(mode: 'auto' | 'smooth' | 'crisp-edges' | 'pixelated') {
    this.imageRenderingMode.set(mode);
    if (this.canvas) this.canvas.style.imageRendering = mode;
    this.updateAnimationState();
  }

  toggleAnaglyphMode() {
    this.anaglyphMode.set(!this.anaglyphMode());
    this.updateAnimationState();
  }

  setParallax(value: number) {
    this.anaglyphParallax.set(value);
    this.updateAnimationState();
  }

  toggleInvert() {
    this.applyInvert.set(!this.applyInvert());
    this.updateAnimationState();
  }

  toggleSolarize() {
    this.applySolarize.set(!this.applySolarize());
    this.updateAnimationState();
  }

  toggleColorMultiplier() {
    this.applyColorMultiplier.set(!this.applyColorMultiplier());
    this.updateAnimationState();
  }

  toggleNoise() {
    this.applyNoise.set(!this.applyNoise());
    this.updateAnimationState();
  }

  // new toggles & setters
  toggleWiggle() {
    this.wiggle.set(!this.wiggle());
    this.updateAnimationState();
  }

  toggleCRT() {
    this.crt.set(!this.crt());
    this.updateAnimationState();
  }

  toggleVHS() {
    this.vhs.set(!this.vhs());
    this.updateAnimationState();
  }

  toggleChroma() {
    this.chroma.set(!this.chroma());
    this.updateAnimationState();
  }

  setWiggleSpeed(v: number | string) {
    this.wiggleSpeed.set(Number(v));
    this.updateAnimationState();
  }

  setChromaIntensity(v: number | string) {
    this.chromaIntensity.set(Number(v));
    this.updateAnimationState();
  }
}
