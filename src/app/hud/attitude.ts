import { Component, computed, inject, input, signal } from '@angular/core';
import { attitude } from '../core/hud';
import { HudClock } from './clock';

/** An FPV artificial horizon: the ground banks and pitches behind a fixed crosshair, with a pitch ladder and a
 *  heading (decorative, generated flight). Space holds it, drag or arrow keys bank and pitch it by hand. */
@Component({
  selector: 'vb-attitude',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': artificial horizon, decorative. Space holds it, arrow keys bank and pitch it.'",
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'drag = null',
    '(pointercancel)': 'drag = null',
    '(keydown)': 'onKey($event)',
  },
  styles: `
    .ground {
      fill: currentColor;
    }
    .on-ground {
      stroke: var(--ground);
    }
    text {
      font: 700 6px var(--font-mono);
      fill: currentColor;
    }
  `,
  template: `
    <svg viewBox="-52 -52 104 104" aria-hidden="true">
      <!-- no clipPath: url(#id) breaks under a base href in some browsers; the ground is drawn as the exact
           segment of the circle below the horizon, and only ladder rungs inside the circle are drawn -->
      <g [attr.transform]="'rotate(' + -att().roll + ') translate(0 ' + att().shift + ')'">
        <path class="ground" [attr.d]="groundPath()" />
        <line [attr.x1]="-chord()" y1="0" [attr.x2]="chord()" y2="0" stroke="currentColor" stroke-width="1.2" />
        @for (p of rungs(); track p) {
          <line [attr.x1]="p % 20 ? -8 : -14" [attr.x2]="p % 20 ? 8 : 14" [attr.y1]="-p * 1.6" [attr.y2]="-p * 1.6"
            [class.on-ground]="p < 0" stroke="currentColor" stroke-width="0.8" />
        }
      </g>
      <circle r="48" fill="none" stroke="currentColor" stroke-width="1.5" />
      <!-- the fixed crosshair: the drone -->
      <path d="M-24 0h14l4 5 4-5h0l4 5 4-5h14" fill="none" stroke="currentColor" stroke-width="2.4" />
      <path d="M-24 0h14l4 5 4-5h0l4 5 4-5h14" fill="none" class="on-ground" stroke-width="0.9" />
      <text x="0" y="-38" text-anchor="middle">{{ att().heading }}</text>
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ held() ? 'HOLD' : 'R' + rollText() }}</span>
    </div>
  `,
})
export class Attitude {
  private readonly clock = inject(HudClock);
  readonly seed = input(1);
  readonly caption = input('ATT_01');

  private readonly ladder = [-30, -20, -10, 10, 20, 30];
  protected readonly held = signal(false);
  private readonly heldAt = signal(0);
  private readonly bank = signal(0);
  private readonly tilt = signal(0);
  protected drag: { x: number; y: number } | null = null;

  protected readonly att = computed(() => {
    const t = this.held() ? this.heldAt() : this.clock.seconds();
    const a = attitude(this.seed(), t);
    return {
      roll: clamp(a.roll + this.bank(), -60, 60),
      pitch: clamp(a.pitch + this.tilt(), -28, 28),
      heading: String(a.heading).padStart(3, '0'),
      get shift() {
        return this.pitch * 1.6;
      },
    };
  });
  /** In the horizon's own frame the dial (radius R) is centred at (0, -shift): the horizon y = 0 meets it at ±chord. */
  protected readonly chord = computed(() => Math.sqrt(Math.max(0, R * R - this.att().shift ** 2)));
  /** The ground: from one end of the chord to the other along the horizon, back along the dial's lower arc. */
  protected readonly groundPath = computed(() => {
    const x = this.chord();
    const large = this.att().shift < 0 ? 1 : 0; // the ground holds the dial's centre when the nose is down
    return `M${-x} 0L${x} 0A${R} ${R} 0 ${large} 1 ${-x} 0Z`;
  });
  /** Pitch ladder rungs whose ends stay inside the dial. */
  protected readonly rungs = computed(() => {
    const shift = this.att().shift;
    return this.ladder.filter((p) => {
      const half = p % 20 ? 8 : 14;
      const y = -p * 1.6 + shift; // distance from the dial centre along the frame's y
      return half * half + y * y < (R - 2) * (R - 2);
    });
  });
  protected readonly rollText = computed(() => {
    const r = Math.round(this.att().roll);
    return (r < 0 ? '-' : '+') + String(Math.abs(r)).padStart(2, '0');
  });

  protected onDown(e: PointerEvent): void {
    this.drag = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  protected onMove(e: PointerEvent): void {
    if (!this.drag) return;
    this.bank.update((b) => clamp(b + (e.clientX - this.drag!.x) * 0.4, -40, 40));
    this.tilt.update((p) => clamp(p + (e.clientY - this.drag!.y) * 0.3, -15, 15));
    this.drag = { x: e.clientX, y: e.clientY };
  }

  protected onKey(e: KeyboardEvent): void {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-5, 0],
      ArrowRight: [5, 0],
      ArrowUp: [0, -3],
      ArrowDown: [0, 3],
    };
    if (e.key === ' ') {
      if (!this.held()) this.heldAt.set(this.clock.seconds());
      this.held.update((h) => !h);
    } else if (steps[e.key]) {
      this.bank.update((b) => clamp(b + steps[e.key][0], -40, 40));
      this.tilt.update((p) => clamp(p + steps[e.key][1], -15, 15));
    } else return;
    e.preventDefault();
    e.stopPropagation();
  }
}

const R = 48;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
