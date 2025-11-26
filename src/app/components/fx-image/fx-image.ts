import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  HostListener,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-fx-image',
  standalone: true,
  template: `<canvas #fxcanvas></canvas>`,
  styles: [
    `
      canvas {
        display: block;
        width: 100%;
        height: 100;
        image-rendering: pixelated; /* CRT/analog effect */
      }
    `,
  ],
})
export class FxImageComponent implements AfterViewInit {
  @ViewChild('fxcanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private isBrowser = false;

  private ctx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;
  private img!: HTMLImageElement;

  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    // Only initialize in browser environment
    if (!this.isBrowser) return;

    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();

    // Load your image (replace with your image path)
    this.img = new Image();
    this.img.src = 'assets/images/test.jpg';
    this.img.onload = () => requestAnimationFrame(() => this.draw());
  }

  @HostListener('window:resize')
  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private draw() {
    const { width, height } = this.canvas;

    // Draw image full-screen
    this.ctx.drawImage(this.img, 0, 0, width, height);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply effects
    for (let i = 0; i < data.length; i += 4) {
      // Invert
      data[i] = 255 - data[i]; // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue

      // Solarize
      for (let j = 0; j < 3; j++) {
        if (data[i + j] > 128) data[i + j] = 255 - data[i + j];
      }

      // Enhanced purple tint (#b04cbc theme)
      data[i] *= 0.69; // Red (more red for #b04cbc)
      data[i + 1] *= 0.3; // Green (moderate green)
      data[i + 2] *= 1.0; // Blue (boost blue for purple)

      // Analog static noise
      const noise = (Math.random() - 0.7) * 200; // +/-25
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }

    // Put image data back
    this.ctx.putImageData(imageData, 0, 0);

    // Loop
    requestAnimationFrame(() => this.draw());
  }
}
