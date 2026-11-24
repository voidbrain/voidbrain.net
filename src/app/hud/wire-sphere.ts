import { Component, computed, inject, input, signal } from '@angular/core';
import { sphereLines } from '../core/hud';
import { HudClock } from './clock';

/** A slowly turning wireframe sphere (decorative). Drag or arrow keys turn it. */
@Component({
  selector: 'vb-wire-sphere',
  host: {
    class: 'hud',
    role: 'img',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': rotating wireframe sphere, decorative. Arrow keys turn it.'",
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'drag = null',
    '(pointercancel)': 'drag = null',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="-2 -2 104 104" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="none" stroke="currentColor" stroke-width="1.5" />
      @for (line of lines(); track $index) {
        <polyline [attr.points]="line" fill="none" stroke="currentColor" stroke-width="0.6" />
      }
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ heading() }}°</span>
    </div>
  `,
})
export class WireSphere {
  private readonly clock = inject(HudClock);
  readonly caption = input('ORB_00');

  private readonly yaw = signal(0);
  private readonly pitch = signal(0.35);
  protected drag: { x: number; y: number } | null = null;

  private readonly spin = computed(() => this.clock.seconds() * 0.35 + this.yaw());
  protected readonly lines = computed(() => sphereLines(this.spin(), this.pitch(), 7, 10, 100));
  protected readonly heading = computed(() =>
    String(Math.round((((this.spin() * 180) / Math.PI) % 360) + 360) % 360).padStart(3, '0'),
  );

  protected onDown(e: PointerEvent): void {
    this.drag = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  protected onMove(e: PointerEvent): void {
    if (!this.drag) return;
    this.yaw.update((v) => v + (e.clientX - this.drag!.x) * 0.012);
    this.pitch.update((v) => Math.max(-1.2, Math.min(1.2, v + (e.clientY - this.drag!.y) * 0.012)));
    this.drag = { x: e.clientX, y: e.clientY };
  }

  protected onKey(e: KeyboardEvent): void {
    const turns: Record<string, [number, number]> = {
      ArrowLeft: [-0.25, 0],
      ArrowRight: [0.25, 0],
      ArrowUp: [0, -0.2],
      ArrowDown: [0, 0.2],
    };
    const t = turns[e.key];
    if (!t) return;
    this.yaw.update((v) => v + t[0]);
    this.pitch.update((v) => Math.max(-1.2, Math.min(1.2, v + t[1])));
    e.preventDefault();
    e.stopPropagation();
  }
}
