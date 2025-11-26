import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

  private platformId = inject(PLATFORM_ID);

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private isBrowser = false;

  private rows = 8;
  private cols = 16;
  private squareSize = Math.ceil(400 / this.cols);

  private baseColorStart = '#B04CBC';
  private baseColorEnd = '#5F47F5';
  private flashColors = ['#B04CBC', '#5F47F5'];
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
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.initSquares();
    this.animate();
  }

  ngOnDestroy() {
    if (this.isBrowser && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationId);
    }
  }

  private initSquares() {
    this.squares = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const t = (row / (this.rows - 1) + col / (this.cols - 1)) / 2;
        const baseColor = this.lerpColor(this.baseColorStart, this.baseColorEnd, t);
        this.squares.push({
          x: col * this.squareSize,
          y: row * this.squareSize,
          baseColor,
        });
      }
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

    // Set stroke style for borders
    ctx.strokeStyle = '#28283d';
    ctx.lineWidth = 2;

    for (const sq of this.squares) {
      // Decide if we should start a flash
      if (!sq.flashColor && Math.random() < 0.001) {
        // ~0.1% chance per frame
        sq.flashColor = this.flashColors[Math.floor(Math.random() * this.flashColors.length)];
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

      // Draw white border (stroke) around the square
      ctx.strokeRect(sq.x, sq.y, this.squareSize, this.squareSize);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
