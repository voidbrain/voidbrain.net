import { Component, computed, inject, input, signal } from '@angular/core';
import { heightLines } from '../core/hud';
import { HudClock } from './clock';

/** Ridge lines of a generated terrain flowing towards the viewer, like flying low over it (decorative). Hover or
 *  Space freezes it, drag or ← → steers, ↑ ↓ change the height of the peaks. */
@Component({
  selector: 'vb-height-map',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': terrain height map, decorative. Space freezes, arrow keys steer and change the peaks.'",
    '(pointerenter)': 'freezeNow(); hovering.set(true)',
    '(pointerleave)': 'hovering.set(false); dragX = null',
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'dragX = null',
    '(pointercancel)': 'dragX = null',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="0 0 200 110" aria-hidden="true">
      @for (line of lines(); track $index) {
        <polyline [attr.points]="line" fill="none" stroke="currentColor" [attr.stroke-width]="0.5 + $index * 0.12" stroke-linejoin="round" />
      }
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ frozen() ? 'HOLD' : 'ALT_' + peaks() }}</span>
    </div>
  `,
})
export class HeightMap {
  private readonly clock = inject(HudClock);
  readonly seed = input(1);
  readonly caption = input('DEM_01');

  protected readonly hovering = signal(false);
  private readonly held = signal(false);
  private readonly frozenAt = signal<number | null>(null);
  private readonly drift = signal(0);
  /** Peak height step 1–5. */
  protected readonly peaks = signal(3);
  protected dragX: number | null = null;

  protected readonly frozen = computed(() => this.hovering() || this.held());
  private readonly travel = computed(() => {
    const now = this.clock.seconds();
    return (this.frozen() ? (this.frozenAt() ?? now) : now) * 2.2;
  });
  protected readonly lines = computed(() =>
    heightLines(this.seed(), this.travel(), this.drift(), this.peaks() / 3, 14, 40, 200, 110),
  );

  protected onDown(e: PointerEvent): void {
    this.dragX = e.clientX;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  protected onMove(e: PointerEvent): void {
    if (this.dragX === null) return;
    this.drift.update((d) => d + (e.clientX - this.dragX!) * 0.02);
    this.dragX = e.clientX;
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === ' ') {
      this.freezeNow();
      this.held.update((h) => !h);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      this.drift.update((d) => d + (e.key === 'ArrowLeft' ? -0.4 : 0.4));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.peaks.update((p) => Math.max(1, Math.min(5, p + (e.key === 'ArrowUp' ? 1 : -1))));
    } else return;
    e.preventDefault();
    e.stopPropagation();
  }

  protected freezeNow(): void {
    if (!this.frozen()) this.frozenAt.set(this.clock.seconds());
  }
}
