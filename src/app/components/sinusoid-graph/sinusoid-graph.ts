import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { Theme as ThemeService } from '../../services/ui/theme';
import { Color as ColorService } from '../../services/ui/color';

Chart.register(...registerables);

@Component({
  selector: 'app-sinusoid-graph',
  imports: [],
  template: '<canvas #canvasGraph class="graph-canvas"></canvas>',
  styleUrl: './sinusoid-graph.scss',
})
export class SinusoidGraph implements AfterViewInit {
  @ViewChild('canvasGraph', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;
  private data: number[] = [];
  private labels: string[] = [];
  private maxPoints = 200;
  private time = 0;

  private isBrowser = false;
  private platformId = inject(PLATFORM_ID);
  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Watch for theme/color changes and potentially update chart colors
    effect(() => {
      this.themeService.currentThemeSignal();
      this.colorService.currentColorSignal();

      // Update chart colors if chart is initialized
      if (this.chart) {
        this.updateChartColors();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.initChart();
    this.startAnimation();
  }

  private getDynamicColors() {
    // Get current colors from CSS custom properties
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      borderColor: computedStyle.getPropertyValue('--color-secondary').trim() || '#ff3366',
      backgroundColor: computedStyle.getPropertyValue('--color-accent').trim() || '#8a2be2',
      gridColor: computedStyle.getPropertyValue('--color-border').trim() || '#4d4d5e',
    };
  }

  private initChart() {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const colors = this.getDynamicColors();

    for (let i = 0; i < this.maxPoints; i++) {
      this.labels.push('');
      // More randomized initial data generation
      const phase1 = i * (0.08 + Math.random() * 0.04); // Random phase shift
      const phase2 = i * (0.03 + Math.random() * 0.04); // Different random phase
      const amplitude1 = 0.7 + Math.random() * 0.6; // Random amplitude
      const amplitude2 = 0.3 + Math.random() * 0.4; // Second wave amplitude
      const noise = (Math.random() - 0.5) * 0.3; // Random noise

      const value =
        Math.sin(phase1) * amplitude1 +
        Math.cos(phase2) * amplitude2 +
        Math.sin(i * (0.15 + Math.random() * 0.1)) * 0.2 + // Extra random wave
        noise;

      this.data.push(value);
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Sinusoid',
            data: this.data,
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor,
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
        animation: {
          duration: 0,
        },
      },
    });

    // Add wireframe grid
    this.addBackgroundGrid(ctx);
  }

  private updateChartColors() {
    const colors = this.getDynamicColors();

    if (this.chart.data.datasets && this.chart.data.datasets[0]) {
      this.chart.data.datasets[0].borderColor = colors.borderColor;
      this.chart.data.datasets[0].backgroundColor = colors.backgroundColor;
      this.chart.update();
    }
  }

  private addBackgroundGrid(ctx: CanvasRenderingContext2D) {
    const colors = this.getDynamicColors();
    // Create a semi-transparent version of the border color for the grid
    ctx.strokeStyle = colors.gridColor.replace('#', '').replace(/^(.{6})$/, '$1') + '33'; // Add 20% alpha
    ctx.lineWidth = 1;
    const canvas = this.canvasRef.nativeElement;

    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal lines (morph them)
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(this.time + y * 0.01) * 10);
      for (let x = 20; x < canvas.width; x += 20) {
        ctx.lineTo(x, y + Math.sin(this.time + y * 0.01 + x * 0.02) * 5);
      }
      ctx.stroke();
    }
  }

  private startAnimation() {
    setInterval(() => {
      this.time += 0.05;

      // Shift data to simulate scrolling
      this.data.shift();

      // More randomized real-time data generation
      const baseIndex = this.maxPoints + this.time;
      const phase1 = baseIndex * (0.08 + Math.random() * 0.04); // Random phase shifts
      const phase2 = baseIndex * (0.03 + Math.random() * 0.04);
      const amplitude1 = 0.7 + Math.random() * 0.6; // Random amplitudes
      const amplitude2 = 0.3 + Math.random() * 0.4;
      const timeNoise =
        Math.sin(this.time * (1.5 + Math.random() * 2)) * (0.3 + Math.random() * 0.4);
      const randomNoise = (Math.random() - 0.5) * 0.4; // Additional noise

      const value =
        Math.sin(phase1) * amplitude1 +
        Math.cos(phase2) * amplitude2 +
        Math.sin(baseIndex * (0.15 + Math.random() * 0.1)) * 0.2 +
        timeNoise +
        randomNoise;

      this.data.push(value);

      this.chart.update();

      // Redraw background grid
      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      this.addBackgroundGrid(ctx);
      this.chart.render(); // Re-render chart on top
    }, 50);
  }
}
