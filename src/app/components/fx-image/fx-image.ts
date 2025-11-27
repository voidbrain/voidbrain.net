import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  HostListener,
  PLATFORM_ID,
  inject,
  effect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme as ThemeService } from '../../services/ui/theme';
import { Color as ColorService } from '../../services/ui/color';

@Component({
  selector: 'app-fx-image',
  standalone: true,
  template: `<canvas #fxcanvas></canvas>`,
  styles: [
    `
      canvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: pixelated; /* CRT/analog effect */
        aspect-ratio: 16/9;
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

  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Watch for theme/color changes and potentially trigger redraws
    effect(() => {
      // React to any theme or color changes
      this.themeService.currentThemeSignal();
      this.colorService.currentColorSignal();

      // Effect will re-run draw loop automatically with new multipliers
    });
  }

  private getColorMultipliers(): { red: number; green: number; blue: number } {
    const theme = this.themeService.currentThemeValue;
    const color = this.colorService.currentColorValue;

    switch (`${theme}-${color}`) {
      case 'dark-purple':
        return { red: 0.69, green: 0.3, blue: 1.0 }; // Original purple #b04cbc

      case 'dark-orange':
        return { red: 1.0, green: 0.6, blue: 0.3 }; // Warm orange tones

      case 'dark-green':
        return { red: 0.4, green: 1.0, blue: 0.5 }; // Forest green tones

      case 'light-purple':
        return { red: 0.85, green: 0.75, blue: 0.9 }; // Subtle light purple

      case 'light-orange':
        return { red: 0.95, green: 0.85, blue: 0.75 }; // Soft light orange

      case 'light-green':
        return { red: 0.8, green: 0.95, blue: 0.85 }; // Gentle light green

      default:
        return { red: 0.69, green: 0.3, blue: 1.0 }; // Default to dark purple
    }
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

    // Get dynamic color multipliers based on current theme and color
    const multipliers = this.getColorMultipliers();

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

      // Dynamic color tint based on theme and color settings
      data[i] *= multipliers.red;     // Red multiplier
      data[i + 1] *= multipliers.green; // Green multiplier
      data[i + 2] *= multipliers.blue;  // Blue multiplier

      // Analog static noise
      const noise = (Math.random() - 0.6) * 200; // +/-25
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
