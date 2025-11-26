import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

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

  ngAfterViewInit() {
    this.initChart();
    this.startAnimation();
  }

  private initChart() {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    for (let i = 0; i < this.maxPoints; i++) {
      this.labels.push('');
      this.data.push(Math.sin(i * 0.1) * Math.cos(i * 0.05));
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Sinusoid',
            data: this.data,
            borderColor: '#b04cbc',
            backgroundColor: '#5f47f5',
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

  private addBackgroundGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
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
      this.data.push(
        Math.sin((this.maxPoints + this.time) * 0.1) *
          Math.cos((this.maxPoints + this.time) * 0.05) +
          Math.sin(this.time * 2) * 0.5,
      );

      this.chart.update();

      // Redraw background grid
      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      this.addBackgroundGrid(ctx);
      this.chart.render(); // Re-render chart on top
    }, 50);
  }
}
