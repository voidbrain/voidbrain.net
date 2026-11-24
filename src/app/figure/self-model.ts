import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import { POSTERS } from '../core/content';
import { POSES, Pose, blendPose, easeStep, lookAt } from '../core/pose';
import { StateId } from '../core/states';

/** The self-model (F-004): a three.js figure with one pose per state. Until the real scan exists it is a
 *  procedural placeholder built here: a faceted head, neck and shoulders, and the state props
 *  (glasses, FPV goggles with antenna, sleep mask). Loaded lazily with @defer from the shell. */
@Component({
  selector: 'vb-self-model',
  host: {
    class: 'self-model',
    role: 'img',
    '[attr.aria-label]': 'label()',
  },
  styles: `
    /* fills the figure box without sizing it: the canvas must never feed back into the layout */
    :host {
      position: absolute;
      inset: 0;
      display: grid;
      overflow: hidden;
    }

    .fallback {
      width: min(60%, 320px);
      aspect-ratio: 3 / 4;
      margin: auto;
      border-radius: 48% 48% 40% 40%;
      background: var(--ink);
    }
  `,
  template: `
    @if (failed()) {
      <div class="fallback"></div>
    }
  `,
})
export class SelfModel {
  readonly state = input.required<StateId>();
  protected readonly failed = signal(false);
  protected readonly label = computed(() => POSTERS[this.state()].figure);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly doc = inject(DOCUMENT);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const stop = this.start();
      destroyRef.onDestroy(stop);
    });
  }

  /** Builds the scene and starts the render loop; returns the cleanup. */
  private start(): () => void {
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      this.failed.set(true);
      return () => undefined;
    }
    const win = this.doc.defaultView!;
    renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 2));
    this.host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    // the canvas is created here, outside the template, so the component's scoped styles never reach it
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block';

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.35, 6.2);
    camera.lookAt(0, 0.2, 0);

    const ink = new MeshBasicMaterial();
    const ground = new MeshBasicMaterial();
    const lineMat = new LineBasicMaterial();
    const owned: (BufferGeometry | Material)[] = [ink, ground, lineMat];
    const solid = (geo: BufferGeometry, mat: Material = ink, edges = true): Object3D => {
      owned.push(geo);
      const mesh = new Mesh(geo, mat);
      if (edges) {
        const e = new EdgesGeometry(geo, 18);
        owned.push(e);
        mesh.add(new LineSegments(e, lineMat));
      }
      return mesh;
    };

    // body
    const figure = new Group();
    const shoulders = solid(new CapsuleGeometry(0.55, 1.5, 4, 10));
    shoulders.rotation.z = Math.PI / 2;
    shoulders.scale.set(1, 1, 0.55);
    shoulders.position.y = -1.55;
    const neck = solid(new CylinderGeometry(0.28, 0.34, 0.6, 8));
    neck.position.y = -0.95;
    figure.add(shoulders, neck);

    // head and its props turn together
    const head = new Group();
    head.position.y = 0.05;
    const skull = solid(new IcosahedronGeometry(0.82, 1));
    skull.scale.set(0.9, 1.08, 0.98);
    head.add(skull);

    const eyes = new Group();
    for (const x of [-0.27, 0.27]) {
      const eye = solid(new SphereGeometry(0.07, 8, 6), ground, false);
      eye.position.set(x, 0.12, 0.78);
      eyes.add(eye);
    }
    head.add(eyes);

    const glasses = new Group();
    for (const x of [-0.29, 0.29]) {
      const rim = solid(new TorusGeometry(0.17, 0.028, 6, 18), ground, false);
      rim.position.set(x, 0.12, 0.84);
      glasses.add(rim);
    }
    const bridge = solid(new BoxGeometry(0.22, 0.03, 0.03), ground, false);
    bridge.position.set(0, 0.14, 0.86);
    glasses.add(bridge);
    head.add(glasses);

    const goggles = new Group();
    const box = solid(new BoxGeometry(1.25, 0.42, 0.42));
    box.position.set(0, 0.13, 0.82);
    const strap = solid(new TorusGeometry(0.84, 0.05, 6, 32), ink, false);
    strap.rotation.x = Math.PI / 2;
    strap.position.y = 0.13;
    strap.scale.set(1, 1.1, 1);
    const lens = solid(new BoxGeometry(1.05, 0.22, 0.02), ground, false);
    lens.position.set(0, 0.13, 1.04);
    const antenna = solid(new CylinderGeometry(0.025, 0.025, 0.55, 6), ink, false);
    antenna.position.set(0.5, 0.55, 0.75);
    antenna.rotation.z = -0.35;
    const tip = solid(new SphereGeometry(0.08, 8, 6));
    tip.position.set(0.6, 0.82, 0.75);
    goggles.add(box, strap, lens, antenna, tip);
    head.add(goggles);

    const mask = new Group();
    const band = solid(new TorusGeometry(0.83, 0.13, 4, 32, Math.PI * 0.9), ground);
    band.rotation.set(Math.PI / 2, 0, Math.PI * 0.05);
    band.position.y = 0.12;
    band.scale.set(1, 1.08, 0.6);
    mask.add(band);
    head.add(mask);

    figure.add(head);
    scene.add(figure);

    // colours follow the poster tokens of the current state
    const applyColours = () => {
      const css = win.getComputedStyle(this.host);
      const inkColour = css.getPropertyValue('--ink').trim() || '#0a0a0a';
      const groundColour = css.getPropertyValue('--ground').trim() || '#a6ff00';
      ink.color.set(inkColour);
      ground.color.set(groundColour);
      lineMat.color.set(groundColour);
    };

    // set before resize() first runs: it marks the frame dirty
    let dirty = true;
    const resize = () => {
      const rect = this.host.getBoundingClientRect();
      const width = Math.min(Math.round(rect.width), 2048);
      const height = Math.min(Math.round(rect.height), 2048);
      if (!width || !height) return;
      dirty = true;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(this.host);
    resize();

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / win.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / win.innerHeight) * 2 - 1;
    };
    win.addEventListener('pointermove', onPointer, { passive: true });

    const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
    let onScreen = true;
    const intersection = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    intersection.observe(this.host);

    let pose: Pose = POSES[this.state()];
    let shownState: StateId | null = null;
    let last = 0;
    let time = 0;
    let frame = 0;

    const setProp = (group: Group, amount: number) => {
      group.visible = amount > 0.02;
      group.scale.setScalar(0.6 + 0.4 * amount);
    };

    const render = (now: number) => {
      frame = win.requestAnimationFrame(render);
      if (this.doc.visibilityState === 'hidden' || !onScreen) {
        last = now;
        return;
      }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const state = this.state();
      const still = reduced.matches;
      // with reduced motion the figure is a still image: draw only when something changed
      if (still && state === shownState && !dirty) return;
      dirty = false;
      if (state !== shownState) {
        shownState = state;
        // tokens change on the root in the same frame; read them after style recalculation
        win.requestAnimationFrame(() => {
          applyColours();
          dirty = true;
        });
      }
      const target = POSES[state];
      pose = still ? target : blendPose(pose, target, easeStep(dt));
      time += still ? 0 : dt;

      const look = still ? lookAt(pose, 0, 0) : lookAt(pose, pointer.x, pointer.y);
      head.rotation.set(look.pitch, look.yaw, pose.roll);
      setProp(glasses, pose.glasses);
      setProp(goggles, pose.goggles);
      setProp(mask, pose.mask);
      setProp(eyes, pose.eyes);
      // idle: breathing, slower when asleep
      const breath = Math.sin(time * (state === 'sleep' ? 0.9 : 1.6));
      figure.position.y = breath * 0.03;
      figure.rotation.y = Math.sin(time * 0.3) * 0.05;
      renderer.render(scene, camera);
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      win.cancelAnimationFrame(frame);
      this.failed.set(true); // the ink silhouette replaces the figure
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    applyColours();
    frame = win.requestAnimationFrame(render);

    return () => {
      win.cancelAnimationFrame(frame);
      win.removeEventListener('pointermove', onPointer);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      resizeObserver.disconnect();
      intersection.disconnect();
      for (const o of owned) o.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }
}
