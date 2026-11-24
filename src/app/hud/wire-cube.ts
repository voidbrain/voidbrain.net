import { Component, computed, inject, input, signal } from '@angular/core';
import { cubeEdges } from '../core/hud';
import { HudClock } from './clock';

/** Two nested wireframe cubes turning in opposite directions (decorative). Drag or arrow keys turn them, Enter
 *  swaps which one is drawn bold. */
@Component({
  selector: 'vb-wire-cube',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': rotating wireframe cube, decorative. Arrow keys turn it, Enter swaps the cubes.'",
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'release()',
    '(pointercancel)': 'release()',
    '(click)': 'onClick()',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      @for (e of outer(); track $index) {
        <line [attr.x1]="e[0]" [attr.y1]="e[1]" [attr.x2]="e[2]" [attr.y2]="e[3]" stroke="currentColor" [attr.stroke-width]="bold() ? 2 : 0.6" />
      }
      @for (e of inner(); track $index) {
        <line [attr.x1]="e[0]" [attr.y1]="e[1]" [attr.x2]="e[2]" [attr.y2]="e[3]" stroke="currentColor" [attr.stroke-width]="bold() ? 0.6 : 2" />
      }
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ heading() }}°</span>
    </div>
  `,
})
export class WireCube {
  private readonly clock = inject(HudClock);
  readonly caption = input('CUBE_00');

  private readonly yaw = signal(0.6);
  private readonly pitch = signal(0.5);
  protected readonly bold = signal(true);
  protected drag: { x: number; y: number; moved: boolean } | null = null;

  private readonly spin = computed(() => this.clock.seconds() * 0.5 + this.yaw());
  protected readonly outer = computed(() => cubeEdges(this.spin(), this.pitch(), 1, 100));
  protected readonly inner = computed(() =>
    cubeEdges(-this.spin() * 1.6, -this.pitch(), 0.45, 100),
  );
  protected readonly heading = computed(() =>
    String(Math.round((((this.spin() * 180) / Math.PI) % 360) + 360) % 360).padStart(3, '0'),
  );

  protected onDown(e: PointerEvent): void {
    this.drag = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  protected onMove(e: PointerEvent): void {
    if (!this.drag) return;
    this.yaw.update((v) => v + (e.clientX - this.drag!.x) * 0.012);
    this.pitch.update((v) => Math.max(-1.4, Math.min(1.4, v + (e.clientY - this.drag!.y) * 0.012)));
    this.drag = { x: e.clientX, y: e.clientY, moved: true };
  }

  private dragged = false;

  protected release(): void {
    this.dragged = !!this.drag?.moved;
    this.drag = null;
  }

  /** A click that ends a drag does not swap. */
  protected onClick(): void {
    if (!this.dragged) this.swap();
    this.dragged = false;
  }

  protected swap(): void {
    this.bold.update((b) => !b);
  }

  protected onKey(e: KeyboardEvent): void {
    const turns: Record<string, [number, number]> = {
      ArrowLeft: [-0.25, 0],
      ArrowRight: [0.25, 0],
      ArrowUp: [0, -0.2],
      ArrowDown: [0, 0.2],
    };
    if (e.key === 'Enter') this.swap();
    else if (turns[e.key]) {
      this.yaw.update((v) => v + turns[e.key][0]);
      this.pitch.update((v) => Math.max(-1.4, Math.min(1.4, v + turns[e.key][1])));
    } else return;
    e.preventDefault();
    e.stopPropagation();
  }
}
