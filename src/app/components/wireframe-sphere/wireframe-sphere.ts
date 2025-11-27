// app/three-sphere/three-sphere.component.ts
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  inject,
  effect
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme as ThemeService } from '../../services/ui/theme';
import { Color as ColorService } from '../../services/ui/color';

@Component({
  selector: 'app-wireframe-sphere',
  template: `<div #rendererContainer class="three-container"></div>`,
  styles: [`
    .three-container {
      width: 100%;
      height: 200px;
      display: block;
    }
  `]
})
export class WireframeSphere implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true })
  container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);
  private isBrowser = false;

  private THREE!: typeof import('three');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private OrbitControls!: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scene: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private camera: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sphere: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private controls: any;
  private animationId: number = 0;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Watch for theme/color changes and recreate sphere
    effect(() => {
      this.themeService.currentThemeSignal();
      this.colorService.currentColorSignal();

      // Update sphere and scene colors when theme changes
      if (this.scene && this.sphere && this.THREE) {
        this.updateSphereColors();
        this.updateSceneBackground();
      }
    });
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    this.THREE = await import('three');
    this.OrbitControls = (await import('three/examples/jsm/controls/OrbitControls.js')).OrbitControls;

    this.initScene();
    this.createWireframeSphere();
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onWindowResize);
      cancelAnimationFrame(this.animationId);
      if (this.renderer) this.renderer.dispose();
    }
  }

  private initScene() {
    const THREE = this.THREE;

    this.scene = new THREE.Scene();
    this.updateSceneBackground();

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(4, 0, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new this.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 2;
  }

  private updateSceneBackground() {
    if (!this.scene || !this.THREE) return;

    // Get dynamic background color from theme
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--color-background').trim() || '#1e1e2e';
    this.scene.background = new this.THREE.Color(bgColor);
  }

  private createWireframeSphere() {
    const THREE = this.THREE;

    const sphereGeo = new THREE.SphereGeometry(5, 48, 48);
    const wireframe = new THREE.WireframeGeometry(sphereGeo);

    this.updateWireframeColors(wireframe);

    const wireMat = new THREE.LineBasicMaterial({
      vertexColors: true,
    });

    this.sphere = new THREE.LineSegments(wireframe, wireMat);
    this.scene.add(this.sphere);
  }

  private updateSphereColors() {
    if (!this.sphere) return;

    // Remove old sphere
    if (this.sphere.geometry) {
      this.sphere.geometry.dispose();
    }

    // Create new sphere with updated colors
    const THREE = this.THREE;
    const sphereGeo = new THREE.SphereGeometry(5, 48, 48);
    const wireframe = new THREE.WireframeGeometry(sphereGeo);

    this.updateWireframeColors(wireframe);

    this.sphere.geometry = wireframe;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateWireframeColors(wireframe: any) {
    const THREE = this.THREE;

    // Get dynamic colors from CSS custom properties
    const computedStyle = getComputedStyle(document.documentElement);
    const colorA = new THREE.Color(computedStyle.getPropertyValue('--color-secondary').trim() || '#ff3366');
    const colorB = new THREE.Color(computedStyle.getPropertyValue('--color-accent').trim() || '#8a2be2');

    const colors: number[] = [];
    for (let i = 0; i < wireframe.attributes['position'].count; i++) {
      const t = i / wireframe.attributes['position'].count;
      const mixed = colorA.clone().lerp(colorB, t);
      colors.push(mixed.r, mixed.g, mixed.b);
    }

    wireframe.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    this.sphere.rotation.y += 0.005;
    this.sphere.rotation.x += 0.001;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };
}
