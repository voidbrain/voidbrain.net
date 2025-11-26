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
  selector: 'app-wireframe-cube',
  template: `<div #rendererContainer class="three-container"></div>`,
  styles: [
    `
      .three-container {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class WireframeCube implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true })
  container!: ElementRef;

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
  private controls: any;

  private animationId = 0;

  // ⬅️ EDITABLE DIMENSIONS
  private W = 60; // width  (left-right)
  private H = 40; // height (floor-ceiling)
  private D = 80; // depth  (front-back)

  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    this.THREE = await import('three');
    this.OrbitControls = (
      await import('three/examples/jsm/controls/OrbitControls.js')
    ).OrbitControls;

    this.initScene();
    this.createRoom();
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }

  private initScene() {
    const THREE = this.THREE;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0d0d);

    const w = this.container.nativeElement.clientWidth;
    const h = this.container.nativeElement.clientHeight;

    this.camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 500);
    this.camera.position.set(0, 0, 0); // inside the room

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new this.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.9;
  }

  // ---------------------------------------------------------
  // REAL GRID WALL (no diagonals)
  // ---------------------------------------------------------
  private makeGrid(
    width: number,
    height: number,
    step: number,
    axis: 'xy' | 'xz' | 'yz',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pos: any,
  ) {
    const THREE = this.THREE;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];

    // vertical lines
    for (let x = -width / 2; x <= width / 2; x += step) {
      vertices.push(x, -height / 2, 0, x, height / 2, 0);
    }

    // horizontal lines
    for (let y = -height / 2; y <= height / 2; y += step) {
      vertices.push(-width / 2, y, 0, width / 2, y, 0);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // gradient colors
    const colorA = new THREE.Color('#2ee7ff');
    const colorB = new THREE.Color('#ff33b8');

    const colors: number[] = [];
    for (let i = 0; i < vertices.length / 3; i++) {
      const t = i / (vertices.length / 3);
      const c = colorA.clone().lerp(colorB, t);
      colors.push(c.r, c.g, c.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({ vertexColors: true });

    const grid = new THREE.LineSegments(geometry, material);

    if (axis === 'xz') grid.rotation.x = -Math.PI / 2;
    if (axis === 'yz') grid.rotation.y = Math.PI / 2;

    grid.position.set(pos.x, pos.y, pos.z);

    return grid;
  }

  // ---------------------------------------------------------
  // BUILD ROOM
  // ---------------------------------------------------------
  private createRoom() {
    const W = this.W;
    const H = this.H;
    const D = this.D;
    const step = 2;

    // FRONT (xy)
    this.scene.add(this.makeGrid(W, H, step, 'xy', { x: 0, y: 0, z: -D / 2 }));

    // BACK (xy)
    this.scene.add(this.makeGrid(W, H, step, 'xy', { x: 0, y: 0, z: +D / 2 }));

    // LEFT (yz)
    this.scene.add(this.makeGrid(D, H, step, 'yz', { x: -W / 2, y: 0, z: 0 }));

    // RIGHT (yz)
    this.scene.add(this.makeGrid(D, H, step, 'yz', { x: +W / 2, y: 0, z: 0 }));

    // FLOOR (xz)
    this.scene.add(this.makeGrid(W, D, step, 'xz', { x: 0, y: -H / 2, z: 0 }));

    // CEILING (xz)
    this.scene.add(this.makeGrid(W, D, step, 'xz', { x: 0, y: +H / 2, z: 0 }));
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    const w = this.container.nativeElement.clientWidth;
    const h = this.container.nativeElement.clientHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };
}
