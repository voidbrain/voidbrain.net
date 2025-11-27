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
        <!-- Rendering Mode -->
        <div class="control-group">
          <span class="control-label">Render:</span>
          <button (click)="setImageRendering('pixelated')" [class.active]="imageRenderingMode() === 'pixelated'" class="fx-btn">🟦 Pixelated</button>
          <button (click)="setImageRendering('crisp-edges')" [class.active]="imageRenderingMode() === 'crisp-edges'" class="fx-btn">🔷 Crisp</button>
          <button (click)="setImageRendering('smooth')" [class.active]="imageRenderingMode() === 'smooth'" class="fx-btn">🔲 Smooth</button>
          <button (click)="setImageRendering('auto')" [class.active]="imageRenderingMode() === 'auto'" class="fx-btn">🎯 Auto</button>
        </div>

        <!-- Anaglyph Toggle -->
        <div class="control-group">
          <span class="control-label">3D:</span>
          <button (click)="toggleAnaglyphMode()" [class.active]="anaglyphMode()" class="fx-btn fx-3d-btn">🥽 {{ anaglyphMode() ? 'ON' : 'OFF' }}</button>
        </div>

        <!-- Anaglyph Color Pair -->
        <div class="control-group">
          <span class="control-label">3D Colors:</span>
          <button (click)="setAnaglyphColorPair(0)" [class.active]="anaglyphColorPair() === 0" class="fx-btn">🔴🟦 Red-Cyan</button>
          <button (click)="setAnaglyphColorPair(1)" [class.active]="anaglyphColorPair() === 1" class="fx-btn">🔵🟡 Blue-Yellow</button>
          <button (click)="setAnaglyphColorPair(2)" [class.active]="anaglyphColorPair() === 2" class="fx-btn">🟢🟣 Green-Magenta</button>
          <button (click)="setAnaglyphColorPair(3)" [class.active]="anaglyphColorPair() === 3" class="fx-btn">🟦🔴 Cyan-Red</button>
          <button (click)="setAnaglyphColorPair(4)" [class.active]="anaglyphColorPair() === 4" class="fx-btn">🟢🔴 Green-Red</button>
          <button (click)="setAnaglyphColorPair(5)" [class.active]="anaglyphColorPair() === 5" class="fx-btn">🔵🟣 Blue-Magenta</button>
        </div>

        <!-- Parallax -->
        <div class="control-group">
          <span class="control-label">Parallax:</span>
          <button (click)="setParallax(0)" [class.active]="anaglyphParallax() === 0" class="fx-btn">🏠 NONE</button>
          <button (click)="setParallax(0.5)" [class.active]="anaglyphParallax() === 0.5" class="fx-btn">🪶 Low</button>
          <button (click)="setParallax(1)" [class.active]="anaglyphParallax() === 1" class="fx-btn">🎯 Norm</button>
          <button (click)="setParallax(2)" [class.active]="anaglyphParallax() === 2" class="fx-btn">🎨 High</button>
        </div>

        <!-- Base Effects -->
        <div class="control-group">
          <span class="control-label">Base:</span>
          <button (click)="toggleInvert()" [class.active]="applyInvert()" class="fx-btn">↔️ {{ applyInvert() ? 'INVERT ON' : 'INVERT OFF' }}</button>
          <button (click)="toggleSolarize()" [class.active]="applySolarize()" class="fx-btn">☀️ {{ applySolarize() ? 'SOLAR ON' : 'SOLAR OFF' }}</button>
        </div>

        <!-- Extra Effects -->
        <div class="control-group">
          <span class="control-label">Extra:</span>
          <button (click)="toggleColorMultiplier()" [class.active]="applyColorMultiplier()" class="fx-btn">🎨 {{ applyColorMultiplier() ? 'MULTI ON' : 'MULTI OFF' }}</button>
          <button (click)="toggleNoise()" [class.active]="applyNoise()" class="fx-btn">📺 {{ applyNoise() ? 'NOISE ON' : 'NOISE OFF' }}</button>
        </div>

        <!-- Visual FX -->
        <div class="control-group">
          <span class="control-label">FX:</span>
          <button (click)="toggleWiggle()" [class.active]="wiggle()" class="fx-btn">🔁 Wiggle</button>
          <button (click)="toggleCRT()" [class.active]="crt()" class="fx-btn">📺 CRT</button>
          <button (click)="toggleVHS()" [class.active]="vhs()" class="fx-btn">📼 VHS</button>
          <button (click)="toggleChroma()" [class.active]="chroma()" class="fx-btn">🌈 Chroma</button>
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
  styles: [`
    .fx-controls { position:relative; z-index:1000; color:var(--color-text); border:1px solid var(--color-border); background:var(--color-primary); padding:12px; border-radius:4px; pointer-events:auto; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-top:16px; width:fit-content; align-self:center; }
    .fx-btn { background:var(--color-primary); color:var(--color-text); border:1px solid var(--color-border); padding:6px 12px; font-family:var(--font-dev); font-size:12px; cursor:pointer; border-radius:2px; box-shadow:2px 2px 0px var(--color-border); transition:all 0.1s ease; margin: 2px; }
    .fx-btn:hover{ transform:translate(-1px,-1px); box-shadow:3px 3px 0px var(--color-border); }
    .fx-btn:active{ transform:translate(1px,1px); box-shadow:1px 1px 0px var(--color-border); }
    .fx-btn.active{ background:var(--color-secondary); border-color:var(--color-accent); color:var(--color-background); }
    .fx-3d-btn.active{ background:var(--color-accent); border-color:var(--color-secondary); color:var(--color-background); animation:pulse 2s infinite; }
    .fx-color-picker { margin: 2px 4px; width: 50px; height: 30px; border: none; border-radius: 4px; cursor: pointer; }
    @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.7 } }
  `]
})
export class FxImageComponent implements AfterViewInit {
  @ViewChild('fxcanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private isBrowser = false;
  imageRenderingMode = signal<'auto' | 'smooth' | 'crisp-edges' | 'pixelated'>('pixelated');

  // toggles
  anaglyphMode = signal(false);
  anaglyphParallax = signal(1);
  anaglyphColorPair = signal(0); // Index into colorPairs array
  applyInvert = signal(false);
  applySolarize = signal(false);
  applyColorMultiplier = signal(false);
  applyNoise = signal(false);

  // visual fx
  wiggle = signal(false);
  wiggleSpeed = signal(0.8);
  crt = signal(false);
  vhs = signal(false);
  chroma = signal(false);
  chromaIntensity = signal(8);

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private img!: HTMLImageElement;

  private leftCanvas!: HTMLCanvasElement;
  private leftCtx!: CanvasRenderingContext2D;
  private rightCanvas!: HTMLCanvasElement;
  private rightCtx!: CanvasRenderingContext2D;

  private isAnimating = false;
  private animationFrameId: number | null = null;

  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(() => {
      this.themeService.currentThemeSignal();
      this.colorService.currentColorSignal();
    });
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    await this.createOffscreenCanvases();
    this.resizeCanvas();

    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = `assets/images/test.jpg?v=${Date.now()}`;
    this.img.onload = () => {
      this.redraw();
    };
    this.img.onerror = () => {
      console.error('Failed to load image');
      // Draw a placeholder if image fails to load
      this.ctx.fillStyle = 'rgba(255,0,255,0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Image failed to load', this.canvas.width / 2, this.canvas.height / 2);
    };
  }

  private createOffscreenCanvases() {
    this.leftCanvas = document.createElement('canvas');
    this.leftCtx = this.leftCanvas.getContext('2d')!;
    this.rightCanvas = document.createElement('canvas');
    this.rightCtx = this.rightCanvas.getContext('2d')!;
  }

  @HostListener('window:resize')
  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientWidth / (16/9);
    const dpr = window.devicePixelRatio || 1;

    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w*dpr);
    this.canvas.height = Math.round(h*dpr);

    this.ctx.setTransform(dpr,0,0,dpr,0,0);

    this.leftCanvas.width = this.rightCanvas.width = this.canvas.width;
    this.leftCanvas.height = this.rightCanvas.height = this.canvas.height;
    this.leftCtx.setTransform(dpr,0,0,dpr,0,0);
    this.rightCtx.setTransform(dpr,0,0,dpr,0,0);
  }

  private getColorMultipliers(): {red:number,green:number,blue:number} {
    const theme = this.themeService.currentThemeValue;
    const color = this.colorService.currentColorValue;
    switch(`${theme}-${color}`){
      case 'dark-purple': return {red:0.69, green:0.3, blue:1};
      case 'dark-orange': return {red:1, green:0.6, blue:0.3};
      case 'dark-green': return {red:0.4, green:1, blue:0.5};
      case 'light-purple': return {red:0.85, green:0.75, blue:0.9};
      case 'light-orange': return {red:0.95, green:0.85, blue:0.75};
      case 'light-green': return {red:0.8, green:0.95, blue:0.85};
      default: return {red:0.69, green:0.3, blue:1};
    }
  }

  private getAnaglyphColorPair() {
    const colorPairs = [
      { // 0: Red / Cyan (default)
        left:  { name: 'cyan',  rgb: [0, 255, 255] },
        right: { name: 'red',   rgb: [255, 0, 0] }
      },
      { // 1: Blue / Yellow
        left:  { name: 'blue',  rgb: [0, 0, 255] },
        right: { name: 'yellow',rgb: [255, 255, 0] }
      },
      { // 2: Green / Magenta
        left:  { name: 'green', rgb: [0, 255, 0] },
        right: { name: 'magenta',rgb: [255, 0, 255] }
      },
      { // 3: Cyan / Red
        left:  { name: 'cyan',  rgb: [0, 255, 255] },
        right: { name: 'red',   rgb: [255, 0, 0] }
      },
      { // 4: Green / Red
        left:  { name: 'green', rgb: [0, 255, 0] },
        right: { name: 'red',   rgb: [255, 0, 0] }
      },
      { // 5: Blue / Magenta
        left:  { name: 'blue',  rgb: [0, 0, 255] },
        right: { name: 'magenta',rgb: [255, 0, 255] }
      }
    ];
    return colorPairs[this.anaglyphColorPair()] || colorPairs[0]; // Default to red/cyan
  }

  private redraw() {
    if (!this.canvas || !this.ctx || !this.img) return;
    const needsAnimation = this.wiggle() || this.crt() || this.vhs() || this.anaglyphMode() || this.applyNoise();
    if(needsAnimation){
      if(!this.isAnimating){
        this.isAnimating = true;
        this.startAnimationLoop();
      }
    } else {
      this.isAnimating = false;
      this.stopAnimationLoop();
      this.renderImage(0);
    }
  }

  private startAnimationLoop() {
    const loop = (t:number) => {
      if(this.isAnimating){
        this.renderImage(t/1000);
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    if(!this.animationFrameId) this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopAnimationLoop() {
    if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  private renderImage(timeSec:number){
    const dpr = window.devicePixelRatio || 1;
    const cssW = this.canvas.width / dpr;
    const cssH = this.canvas.height / dpr;
    const bufferW = this.canvas.width;
    const bufferH = this.canvas.height;
    const multipliers = this.getColorMultipliers();

    if(!this.anaglyphMode()){
      // Draw image centered with proper aspect ratio
      const imgAspect = this.img.width/this.img.height;
      const canvasAspect = cssW/cssH;
      let drawW=cssW, drawH=cssH;
      if(imgAspect>canvasAspect){ drawH=cssH; drawW=cssH*imgAspect; }
      else { drawW=cssW; drawH=cssW/imgAspect; }
      const offsetX = (cssW-drawW)/2;
      const offsetY = (cssH-drawH)/2;
      this.ctx.drawImage(this.img, offsetX, offsetY, drawW, drawH);
      const data = this.ctx.getImageData(0,0,bufferW,bufferH);
      data.data.set(this.applyEffectsToImageData(data.data,multipliers,timeSec));
      this.ctx.putImageData(data,0,0);
      if(this.crt()||this.vhs()||this.wiggle()||this.chroma()){
        const out = this.ctx.createImageData(bufferW,bufferH);
        const src = this.ctx.getImageData(0,0,bufferW,bufferH);
        const wiggleEnabled = this.wiggle();
        const t = timeSec*this.wiggleSpeed();
        const rShift = wiggleEnabled?Math.round(Math.sin(t*2.1)*2+Math.cos(t*0.7)*1.5):0;
        const gShift = wiggleEnabled?Math.round(Math.sin(t*1.7+1)*2):0;
        const bShift = wiggleEnabled?Math.round(Math.sin(t*1.2+2)*2+Math.cos(t*0.5)*1):0;
        const chromaEnabled = this.chroma();
        const chromaStr = this.chromaIntensity();
        for(let y=0;y<bufferH;y++){
          const crtOffset = this.crt()?Math.round(Math.sin((y/3+t*30)*0.02)*3):0;
          const vhsBand = this.vhs()?Math.round((Math.random()-0.5)*6):0;
          const lineOffset = crtOffset+vhsBand;
          for(let x=0;x<bufferW;x++){
            const idx = (y*bufferW+x)*4;
            const sample = (cx:number,cy:number,shift:number)=>{
              let sx=cx+shift,sy=cy;
              if(chromaEnabled){
                const dx=cx-bufferW/2,dy=cy-bufferH/2,dist=Math.sqrt(dx*dx+dy*dy)||1;
                sx+=Math.round((dx/dist)*chromaStr*dpr*0.15);
                sy+=Math.round((dy/dist)*chromaStr*dpr*0.15);
              }
              sx+=lineOffset;
              sx=Math.max(0,Math.min(bufferW-1,sx));
              sy=Math.max(0,Math.min(bufferH-1,sy));
              const sidx=(Math.floor(sy)*bufferW+Math.floor(sx))*4;
              return [src.data[sidx],src.data[sidx+1],src.data[sidx+2],src.data[sidx+3]];
            };
            const rS=sample(x,y,rShift);
            const gS=sample(x,y,gShift);
            const bS=sample(x,y,bShift);
            out.data[idx]=rS[0];
            out.data[idx+1]=gS[1];
            out.data[idx+2]=bS[2];
            out.data[idx+3]=255;
          }
        }
        this.ctx.putImageData(out,0,0);
      }
      if(this.applyNoise()||this.vhs()) this.addThemeNoiseOverlay(cssW,cssH,timeSec);
      return;
    }

    // ------------------- ANAGLYPH -------------------
    const baseParallax = Math.max(2,Math.floor(cssW/200));
    const parallaxOffset = baseParallax*this.anaglyphParallax()*2;

    this.leftCtx.clearRect(0,0,cssW,cssH);
    this.rightCtx.clearRect(0,0,cssW,cssH);

    // Draw full image centered with parallax in CSS pixel space
    const imgAspect = this.img.width/this.img.height;
    const canvasAspect = cssW/cssH;
    let drawW=cssW, drawH=cssH;
    if(imgAspect>canvasAspect){ drawH=cssH; drawW=cssH*imgAspect; }
    else { drawW=cssW; drawH=cssW/imgAspect; }
    const offsetX = (cssW-drawW)/2;
    const offsetY = (cssH-drawH)/2;

    this.leftCtx.drawImage(this.img, offsetX-parallaxOffset/2, offsetY, drawW, drawH);
    this.rightCtx.drawImage(this.img, offsetX+parallaxOffset/2, offsetY, drawW, drawH);

    const leftData = this.leftCtx.getImageData(0,0,bufferW,bufferH);
    const rightData = this.rightCtx.getImageData(0,0,bufferW,bufferH);

    // Convert to black & white before anaglyph processing
    for(let i=0;i<leftData.data.length;i+=4){
      const gray = Math.round(0.299*leftData.data[i] + 0.587*leftData.data[i+1] + 0.114*leftData.data[i+2]);
      leftData.data[i]=gray; leftData.data[i+1]=gray; leftData.data[i+2]=gray;
    }
    for(let i=0;i<rightData.data.length;i+=4){
      const gray = Math.round(0.299*rightData.data[i] + 0.587*rightData.data[i+1] + 0.114*rightData.data[i+2]);
      rightData.data[i]=gray; rightData.data[i+1]=gray; rightData.data[i+2]=gray;
    }

    // Get current anaglyph color pair
    const currentPair = this.getAnaglyphColorPair();

    // Apply traditional channel filtering based on selected pair
    // Left eye channel filtering
    if (currentPair.left.name === 'cyan') {
      // Cyan filter blocks red, keeps green/blue
      for(let i=0;i<leftData.data.length;i+=4){
        leftData.data[i]=0; // Block red channel
      }
    } else if (currentPair.left.name === 'blue') {
      // Blue filter - block green and red?
      for(let i=0;i<leftData.data.length;i+=4){
        leftData.data[i]=0; leftData.data[i+1]=0; // Block red and green
      }
    } else {
      // For other colors, use simple approach
      for(let i=0;i<leftData.data.length;i+=4){
        leftData.data[i]=0; // Block red (default cyan-like)
      }
    }

    // Right eye channel filtering
    if (currentPair.right.name === 'red') {
      // Red filter blocks green/blue, keeps red
      for(let i=0;i<rightData.data.length;i+=4){
        rightData.data[i+1]=0; rightData.data[i+2]=0; // Block green/blue channels
      }
    } else if (currentPair.right.name === 'yellow') {
      // Yellow filter - keeps red/green, blocks blue?
      for(let i=0;i<rightData.data.length;i+=4){
        rightData.data[i+2]=0; // Block blue
      }
    } else if (currentPair.right.name === 'magenta') {
      // Magenta filter - keeps red/blue, blocks green?
      for(let i=0;i<rightData.data.length;i+=4){
        rightData.data[i+1]=0; // Block green
      }
    } else {
      // Default red filter
      for(let i=0;i<rightData.data.length;i+=4){
        rightData.data[i+1]=0; rightData.data[i+2]=0; // Block green/blue
      }
    }

    const out = this.ctx.createImageData(bufferW,bufferH);
    const wiggleEnabled=this.wiggle();
    const t=timeSec*this.wiggleSpeed();
    const rShift=wiggleEnabled?Math.round(Math.sin(t*2.2)*1.5+Math.cos(t*0.6)*1.2):0;
    const gShift=wiggleEnabled?Math.round(Math.sin(t*1.8+1)*1.8):0;
    const bShift=wiggleEnabled?Math.round(Math.sin(t*1.3+2)*1.2):0;
    const chromaEnabled=this.chroma();
    const chromaStrength=this.chromaIntensity();

    for(let y=0;y<bufferH;y++){
      const crtOffset=this.crt()?Math.round(Math.sin((y/2+t*40)*0.03)*2):0;
      const vhsOffset=this.vhs()?Math.round((Math.random()-0.5)*6):0;
      const lineOffset=crtOffset+vhsOffset;

      for(let x=0;x<bufferW;x++){
        const idx=(y*bufferW+x)*4;
        const sample=(imgData:ImageData,px:number,py:number,shift:number)=>{
          if(chromaEnabled){
            const dx=px-bufferW/2,dy=py-bufferH/2,dist=Math.sqrt(dx*dx+dy*dy)||1;
            px+=Math.round((dx/dist)*chromaStrength*dpr*0.12);
            py+=Math.round((dy/dist)*chromaStrength*dpr*0.12);
          }
          px+=lineOffset+shift;
          px=Math.max(0,Math.min(bufferW-1,px));
          py=Math.max(0,Math.min(bufferH-1,py));
          const sidx=(Math.floor(py)*bufferW+Math.floor(px))*4;
          return [imgData.data[sidx],imgData.data[sidx+1],imgData.data[sidx+2],imgData.data[sidx+3]];
        };
        let r=sample(rightData,x,y,rShift)[0];
        let g=sample(leftData,x,y,gShift)[1];
        let b=sample(leftData,x,y,bShift)[2];

        if(this.applyInvert()){ r=255-r; g=255-g; b=255-b; }
        if(this.applySolarize()){ r=r>128?255-r:r; g=g>128?255-g:g; b=b>128?255-b:b; }
        if(this.applyNoise()){ const n=(Math.random()-0.5)*40; r=Math.min(255,Math.max(0,r+n)); g=Math.min(255,Math.max(0,g+n)); b*Math.min(255,b*multipliers.blue); }
        if(this.applyColorMultiplier()){ r=Math.min(255,r*multipliers.red); g*Math.min(255,g*multipliers.green); b=Math.min(255,b*multipliers.blue); }

        out.data[idx]=Math.round(r);
        out.data[idx+1]=Math.round(g);
        out.data[idx+2]=Math.round(b);
        out.data[idx+3]=255;
      }
    }
    this.ctx.putImageData(out,0,0);
    if(this.applyNoise()||this.vhs()) this.addThemeNoiseOverlay(cssW,cssH,timeSec);
  }

  private applyEffectsToImageData(data:Uint8ClampedArray,multipliers:{red:number,green:number,blue:number},timeSec:number){
    const out = new Uint8ClampedArray(data);
    const frameNoise = this.vhs()?Math.sin(timeSec*40)*6:0;
    for(let i=0;i<out.length;i+=4){
      let r=out[i],g=out[i+1],b=out[i+2];
      if(this.applyInvert()){ r=255-r; g=255-g; b=255-b; }
      if(this.applySolarize()){ r=r>128?255-r:r; g=g>128?255-g:g; b=b>128?255-b:b; }
      if(this.applyNoise()){ const n=(Math.random()-0.5)*40+frameNoise; r=Math.min(255,Math.max(0,r+n)); g=Math.min(255,Math.max(0,g+n)); b=Math.min(255,Math.max(0,b+n)); }
      if(this.applyColorMultiplier()){ r=Math.min(255,r*multipliers.red); g=Math.min(255,g*multipliers.green); b=Math.min(255,b*multipliers.blue); }
      out[i]=Math.round(r); out[i+1]=Math.round(g); out[i+2]=Math.round(b); out[i+3]=255;
    }
    return out;
  }

  private addThemeNoiseOverlay(width:number,height:number,timeSec:number){
    this.ctx.save();
    this.ctx.globalCompositeOperation='overlay';
    if(this.vhs()){
      for(let y=0;y<height;y+=Math.round(6+Math.random()*12)){
        const h=Math.max(1,Math.round(1+Math.random()*3));
        this.ctx.fillStyle=`rgba(0,0,0,${0.06*Math.random()})`;
        this.ctx.fillRect(0,y,width,h);
      }
    }
    if(this.crt()){
      this.ctx.globalCompositeOperation='soft-light';
      this.ctx.fillStyle=`rgba(255,255,255,${0.015+Math.sin(timeSec*30)*0.006})`;
      for(let y=0;y<height;y+=2) this.ctx.fillRect(0,y,width,1);
    }
    if(this.applyNoise()){
      const imgData=this.ctx.getImageData(0,0,width,height);
      for(let i=0;i<imgData.data.length;i+=4){
        const g=(Math.random()-0.5)*12;
        imgData.data[i]=Math.min(255,Math.max(0,imgData.data[i]+g));
        imgData.data[i+1]=Math.min(255,Math.max(0,imgData.data[i+1]+g));
        imgData.data[i+2]=Math.min(255,Math.max(0,imgData.data[i+2]+g));
      }
      this.ctx.putImageData(imgData,0,0);
    }
    this.ctx.restore();
  }

  // --- Controls ---
  setImageRendering(mode:'auto'|'smooth'|'crisp-edges'|'pixelated'){ this.imageRenderingMode.set(mode); if(this.canvas) this.canvas.style.imageRendering=mode; this.redraw(); }
  toggleAnaglyphMode(){ this.anaglyphMode.set(!this.anaglyphMode()); this.redraw(); }
  setParallax(val:number){ this.anaglyphParallax.set(val); this.redraw(); }
  setAnaglyphColorPair(pairIndex:number){ this.anaglyphColorPair.set(pairIndex); this.redraw(); }
  toggleInvert(){ this.applyInvert.set(!this.applyInvert()); this.redraw(); }
  toggleSolarize(){ this.applySolarize.set(!this.applySolarize()); this.redraw(); }
  toggleColorMultiplier(){ this.applyColorMultiplier.set(!this.applyColorMultiplier()); this.redraw(); }
  toggleNoise(){ this.applyNoise.set(!this.applyNoise()); this.redraw(); }
  toggleWiggle(){ this.wiggle.set(!this.wiggle()); this.redraw(); }
  toggleCRT(){ this.crt.set(!this.crt()); this.redraw(); }
  toggleVHS(){ this.vhs.set(!this.vhs()); this.redraw(); }
  toggleChroma(){ this.chroma.set(!this.chroma()); this.redraw(); }
  setWiggleSpeed(v:number|string){ this.wiggleSpeed.set(Number(v)); this.redraw(); }
  setChromaIntensity(v:number|string){ this.chromaIntensity.set(Number(v)); this.redraw(); }
}
