import { Component, computed, inject, input, signal } from '@angular/core';
import { topoContours } from '../core/hud';
import { HudClock } from './clock';

/** A topographic map seen from above whose ground breathes, so the contour lines drift and swell (decorative).
 *  Hover or Space freezes it, drag or ← → slides the map, ↑ ↓ change the number of contour levels. */
@Component({
  selector: 'vb-topo-map',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': topographic contour map, decorative. Space freezes, arrow keys slide it and change the levels.'",
    '(pointerenter)': 'freezeNow(); hovering.set(true)',
    '(pointerleave)': 'hovering.set(false); dragX = null',
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'dragX = null',
    '(pointercancel)': 'dragX = null',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="0 0 200 120" aria-hidden="true">
      @for (d of paths(); track $index) {
        <!-- every third line is an index contour, drawn heavier, as on a survey map -->
        <path [attr.d]="d" fill="none" stroke="currentColor" [attr.stroke-width]="($index + 1) % 3 === 0 ? 1.6 : 0.6" stroke-linecap="round" />
      }
      <path d="M96 60h8M100 56v8" stroke="currentColor" stroke-width="1" />
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ frozen() ? 'HOLD' : 'LVL_' + levels() }}</span>
    </div>
  `,
})
export class TopoMap {
  private readonly clock = inject(HudClock);
  readonly seed = input(1);
  readonly caption = input('TOPO_01');

  protected readonly hovering = signal(false);
  private readonly held = signal(false);
  private readonly frozenAt = signal<number | null>(null);
  private readonly drift = signal(0);
  /** Number of contour levels, 4–10. */
  protected readonly levels = signal(7);
  protected dragX: number | null = null;

  protected readonly frozen = computed(() => this.hovering() || this.held());
  private readonly time = computed(() => {
    const now = this.clock.seconds();
    return this.frozen() ? (this.frozenAt() ?? now) : now;
  });
  protected readonly paths = computed(() =>
    topoContours(this.seed(), this.time(), this.drift(), this.levels(), 40, 24, 200, 120),
  );

  protected onDown(e: PointerEvent): void {
    this.dragX = e.clientX;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  protected onMove(e: PointerEvent): void {
    if (this.dragX === null) return;
    this.drift.update((d) => d - (e.clientX - this.dragX!) * 0.004);
    this.dragX = e.clientX;
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === ' ') {
      this.freezeNow();
      this.held.update((h) => !h);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      this.drift.update((d) => d + (e.key === 'ArrowLeft' ? -0.05 : 0.05));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.levels.update((l) => Math.max(4, Math.min(10, l + (e.key === 'ArrowUp' ? 1 : -1))));
    } else return;
    e.preventDefault();
    e.stopPropagation();
  }

  protected freezeNow(): void {
    if (!this.frozen()) this.frozenAt.set(this.clock.seconds());
  }
}
