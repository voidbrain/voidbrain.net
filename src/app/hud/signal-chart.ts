import { Component, computed, inject, input, signal } from '@angular/core';
import { signalSeries, toPolyline } from '../core/hud';
import { HudClock } from './clock';

/** An animated line chart of generated values (decorative). Hover or Space freezes it; drag or ← → scrubs. */
@Component({
  selector: 'vb-signal-chart',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': animated signal chart, decorative. Space freezes, arrow keys scrub.'",
    '(pointerenter)': 'freezeNow(); hovering.set(true)',
    '(pointerleave)': 'hovering.set(false); dragX = null',
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'dragX = null',
    '(pointercancel)': 'dragX = null',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="0 0 200 80" aria-hidden="true">
      <line x1="0" y1="40" x2="200" y2="40" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3" />
      @for (x of grid; track x) {
        <line [attr.x1]="x" y1="0" [attr.x2]="x" y2="80" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
      }
      <polyline [attr.points]="points()" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ frozen() ? 'HOLD' : 'LIVE_SIM' }}</span>
    </div>
  `,
})
export class SignalChart {
  private readonly clock = inject(HudClock);
  readonly seed = input(1);
  readonly caption = input('SIG_01');

  protected readonly grid = [40, 80, 120, 160];
  protected readonly hovering = signal(false);
  private readonly held = signal(false);
  private readonly offset = signal(0);
  private readonly frozenAt = signal<number | null>(null);
  protected dragX: number | null = null;

  protected readonly frozen = computed(() => this.hovering() || this.held());
  private readonly time = computed(() => {
    const now = this.clock.seconds();
    return (this.frozen() ? (this.frozenAt() ?? now) : now) + this.offset();
  });
  protected readonly points = computed(() =>
    toPolyline(signalSeries(this.seed(), this.time(), 64), 200, 80),
  );

  protected onDown(e: PointerEvent): void {
    this.dragX = e.clientX;
    this.freezeNow();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  protected onMove(e: PointerEvent): void {
    if (this.dragX === null) return;
    this.offset.update((o) => o + (e.clientX - this.dragX!) * 0.02);
    this.dragX = e.clientX;
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === ' ') {
      this.freezeNow();
      this.held.update((h) => !h);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      this.offset.update((o) => o + (e.key === 'ArrowLeft' ? -0.3 : 0.3));
    } else return;
    e.preventDefault();
    e.stopPropagation();
  }

  protected freezeNow(): void {
    if (!this.frozen()) this.frozenAt.set(this.clock.seconds());
  }
}
