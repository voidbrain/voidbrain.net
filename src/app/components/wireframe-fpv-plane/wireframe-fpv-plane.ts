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
  selector: 'app-ml-graph',
  template: `<canvas
    #canvasFpv
    width="300"
    height="200"
    style="width:100%; height:200px; background:#111;"
  ></canvas>`,
  styles: [``],
})
export class MlGraphComponent implements OnInit, OnDestroy {
  @ViewChild('canvasFpv', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private isBrowser = false;

  private layers = [2, 4, 2, 1]; // example model
  private nodeRadius = 10;
  private positions: { x: number; y: number }[][] = [];

  private highlightIndex = 0; // which node to highlight
  private speed = 0.2; // steps per frame

  private baseColor = '#9b59b6'; // purple
  private highlightColor = '#2ecc71'; // green
  private lineColor = '#888'; // grey

  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.computeNodePositions(canvas.width, canvas.height);
    this.animate();
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private computeNodePositions(width: number, height: number) {
    this.positions = [];
    const layerCount = this.layers.length;
    const horizontalSpacing = width / (layerCount + 1);

    for (let i = 0; i < layerCount; i++) {
      const nodes = this.layers[i];
      const verticalSpacing = height / (nodes + 1);
      const layerPositions: { x: number; y: number }[] = [];
      for (let j = 0; j < nodes; j++) {
        layerPositions.push({
          x: horizontalSpacing * (i + 1),
          y: verticalSpacing * (j + 1),
        });
      }
      this.positions.push(layerPositions);
    }
  }

  private drawNode(x: number, y: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ctx = this.ctx;
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private animate = () => {
    const ctx = this.ctx;
    const width = this.canvasRef.nativeElement.width;
    const height = this.canvasRef.nativeElement.height;
    ctx.clearRect(0, 0, width, height);

    // draw connections (grey lines)
    for (let i = 0; i < this.positions.length - 1; i++) {
      const layer = this.positions[i];
      const nextLayer = this.positions[i + 1];
      for (const n1 of layer) {
        for (const n2 of nextLayer) {
          this.drawLine(n1.x, n1.y, n2.x, n2.y);
        }
      }
    }

    // draw nodes
    for (let layerIdx = 0; layerIdx < this.positions.length; layerIdx++) {
      const layer = this.positions[layerIdx];
      for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
        const node = layer[nodeIdx];
        let color = this.baseColor;
        if (nodeIdx === this.highlightIndex % layer.length) {
          color = this.highlightColor;
        }
        this.drawNode(node.x, node.y, color);
      }
    }

    // increment highlight
    this.highlightIndex += this.speed;
    if (this.highlightIndex >= Math.max(...this.layers)) {
      this.highlightIndex = 0;
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
