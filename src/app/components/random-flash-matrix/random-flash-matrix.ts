import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  PLATFORM_ID,
  inject,
  effect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme as ThemeService } from '../../services/ui/theme';
import { Color as ColorService } from '../../services/ui/color';

@Component({
  selector: 'app-random-flash-matrix',
  template: `<canvas
    #canvasMatrix
    width="400"
    height="200"
    style="width:100%; height:200px; display:block;  border: 1px solid var(--color-border);"
  ></canvas>`,
  styles: [``],
})
export class RandomFlashMatrix implements OnInit, OnDestroy {
  @ViewChild('canvasMatrix', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);
  private platformId = inject(PLATFORM_ID);

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private isBrowser = false;

  private rows = 8;
  private cols = 16;
  private squareSize = Math.ceil(400 / this.cols);

  private flashDuration = 1000; // ms

  private squares: {
    x: number;
    y: number;
    baseColor: string;
    flashColor?: string;
    flashEndTime?: number;
  }[] = [];

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Watch for theme/color changes and reinitialize squares
    effect(() => {
      this.themeService.currentThemeSignal();
      this.colorService.currentColorSignal();

      // Reinitialize squares with new colors
      if (this.isBrowser && this.ctx) {
        this.initSquares();
      }
    });
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.initSquares();
    this.animate();
  }

  private initSquares() {
    // Get current colors from CSS custom properties
    const computedStyle = getComputedStyle(document.documentElement);
    const colorSecondary = computedStyle.getPropertyValue('--color-secondary').trim() || '#ff3366';
    const colorAccent = computedStyle.getPropertyValue('--color-accent').trim() || '#8a2be2';

    this.squares = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const t = (row / (this.rows - 1) + col / (this.cols - 1)) / 2;
        const baseColor = this.lerpColor(colorSecondary, colorAccent, t);
        this.squares.push({
          x: col * this.squareSize,
          y: row * this.squareSize,
          baseColor,
        });
      }
    }
  }

  ngOnDestroy() {
    if (this.isBrowser && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationId);
    }
  }

  private lerpColor(a: string, b: string, t: number) {
    const parseHex = (hex: string) => parseInt(hex.replace('#', ''), 16);
    const r1 = (parseHex(a) >> 16) & 0xff;
    const g1 = (parseHex(a) >> 8) & 0xff;
    const b1 = parseHex(a) & 0xff;

    const r2 = (parseHex(b) >> 16) & 0xff;
    const g2 = (parseHex(b) >> 8) & 0xff;
    const b2 = parseHex(b) & 0xff;

    const rf = Math.round(r1 + (r2 - r1) * t);
    const gf = Math.round(g1 + (g2 - g1) * t);
    const bf = Math.round(b1 + (b2 - b1) * t);

    return `rgb(${rf},${gf},${bf})`;
  }

  private animate = () => {
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();

    // Get current theme colors for flashes
    const computedStyle = getComputedStyle(document.documentElement);
    const colorSecondary = computedStyle.getPropertyValue('--color-secondary').trim() || '#ff3366';
    const colorPulseStart = computedStyle.getPropertyValue('--color-pulse-start').trim() || '#71bc4c';

    // Set stroke style for borders using theme border color
    ctx.strokeStyle = computedStyle.getPropertyValue('--color-tertiary').trim() || '#5f2b8f';
    ctx.lineWidth = 2;

    for (const sq of this.squares) {
      // Decide if we should start a flash
      if (!sq.flashColor && Math.random() < 0.001) {
        // ~0.1% chance per frame - normal flash with secondary color
        sq.flashColor = colorSecondary;
        sq.flashEndTime = now + this.flashDuration;
      }
      if (!sq.flashColor && Math.random() < 0.0001) {
        // ~0.01% chance per frame - special flash with pulse color (green)
        sq.flashColor = colorPulseStart;
        sq.flashEndTime = now + this.flashDuration;
      }

      // Check if flash ended
      if (sq.flashColor && now >= (sq.flashEndTime || 0)) {
        sq.flashColor = undefined;
        sq.flashEndTime = undefined;
      }

      // Draw filled square
      ctx.fillStyle = sq.flashColor || sq.baseColor;
      ctx.fillRect(sq.x, sq.y, this.squareSize, this.squareSize);

      // Draw border around the square
      ctx.strokeRect(sq.x, sq.y, this.squareSize, this.squareSize);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
