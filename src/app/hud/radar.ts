import { Component, computed, inject, input, signal } from '@angular/core';
import { radarBlips, sweepFade } from '../core/hud';
import { HudClock } from './clock';

/** A radar scope with a turning sweep and generated contacts (decorative). Hover or Space freezes it, ↑ ↓ change
 *  the range, Enter or a click finds new contacts. */
@Component({
  selector: 'vb-radar',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': radar sweep, decorative. Space freezes, up and down arrows change the range, Enter finds new contacts.'",
    '(pointerenter)': 'freezeNow(); hovering.set(true)',
    '(pointerleave)': 'hovering.set(false)',
    '(pointerdown)': '$event.stopPropagation()',
    '(click)': 'reshuffle()',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="-52 -52 104 104" aria-hidden="true">
      @for (r of rings; track r) {
        <circle [attr.r]="r" fill="none" stroke="currentColor" [attr.stroke-width]="r === 50 ? 1.5 : 0.5" />
      }
      <line x1="-50" y1="0" x2="50" y2="0" stroke="currentColor" stroke-width="0.4" />
      <line x1="0" y1="-50" x2="0" y2="50" stroke="currentColor" stroke-width="0.4" />
      <line x1="0" y1="0" [attr.x2]="tip().x" [attr.y2]="tip().y" stroke="currentColor" stroke-width="1.5" />
      @for (b of contacts(); track $index) {
        <rect [attr.x]="b.x - 2" [attr.y]="b.y - 2" width="4" height="4" fill="currentColor" [attr.opacity]="b.lit" />
      }
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ frozen() ? 'HOLD' : 'RNG_' + range() }}</span>
    </div>
  `,
})
export class Radar {
  private readonly clock = inject(HudClock);
  readonly seed = input(1);
  readonly caption = input('RDR_00');

  protected readonly rings = [12.5, 25, 37.5, 50];
  protected readonly hovering = signal(false);
  private readonly held = signal(false);
  private readonly frozenAt = signal<number | null>(null);
  private readonly shuffle = signal(0);
  /** Range step 1–4: a higher range pulls the contacts towards the centre. */
  protected readonly range = signal(2);

  protected readonly frozen = computed(() => this.hovering() || this.held());
  private readonly sweep = computed(() => {
    const now = this.clock.seconds();
    return (this.frozen() ? (this.frozenAt() ?? now) : now) * 1.6;
  });
  protected readonly tip = computed(() => ({
    x: round(Math.cos(this.sweep()) * 50),
    y: round(Math.sin(this.sweep()) * 50),
  }));
  protected readonly contacts = computed(() => {
    const scale = 1 - (this.range() - 1) * 0.18; // range 1 fills the scope, 4 keeps it under half
    return radarBlips(this.seed() * 31 + this.shuffle(), 9).map((b) => ({
      x: round(Math.cos(b.angle) * b.dist * 48 * scale),
      y: round(Math.sin(b.angle) * b.dist * 48 * scale),
      lit: round(0.15 + 0.85 * sweepFade(b.angle, this.sweep()) ** 3),
    }));
  });

  protected onKey(e: KeyboardEvent): void {
    if (e.key === ' ') {
      this.freezeNow();
      this.held.update((h) => !h);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.range.update((r) => Math.max(1, Math.min(4, r + (e.key === 'ArrowUp' ? 1 : -1))));
    } else if (e.key === 'Enter') {
      this.reshuffle();
    } else return;
    e.preventDefault();
    e.stopPropagation();
  }

  protected reshuffle(): void {
    this.shuffle.update((s) => s + 1);
  }

  protected freezeNow(): void {
    if (!this.frozen()) this.frozenAt.set(this.clock.seconds());
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
