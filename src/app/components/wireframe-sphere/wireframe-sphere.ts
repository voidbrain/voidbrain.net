// app/three-sphere/three-sphere.component.ts
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-wireframe-sphere',
  template: `<div #rendererContainer class="three-container"></div>`,
  styles: [
    `
      .three-container {
        width: 100%;
        height: 200px;
        display: block;
      }
    `,
  ],
})
export class WireframeSphere implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true })
  container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = false;

  // Three.js items
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
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    // Load THREE & OrbitControls dynamically (SSR safe)
    this.THREE = await import('three');
    this.OrbitControls = (
      await import('three/examples/jsm/controls/OrbitControls.js')
    ).OrbitControls;

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

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x128283d);

    // Camera
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(4, 0, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new this.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 2;
  }

  private createWireframeSphere() {
    const THREE = this.THREE;

    const colorA = new THREE.Color('#B04CBC');
    const colorB = new THREE.Color('#5F47F5');

    const sphereGeo = new THREE.SphereGeometry(5, 48, 48);
    const wireframe = new THREE.WireframeGeometry(sphereGeo);

    const colors: number[] = [];
    for (let i = 0; i < wireframe.attributes['position'].count; i++) {
      const t = i / wireframe.attributes['position'].count;
      const mixed = colorA.clone().lerp(colorB, t);
      colors.push(mixed.r, mixed.g, mixed.b);
    }

    wireframe.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const wireMat = new THREE.LineBasicMaterial({
      vertexColors: true,
    });

    this.sphere = new THREE.LineSegments(wireframe, wireMat);
    this.scene.add(this.sphere);
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
