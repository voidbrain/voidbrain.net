import { Component, computed, inject, input, signal } from '@angular/core';
import { HudClock } from './clock';

/** Numbered day boxes around today, one lit at a time (decorative). Hover or ← → picks a box. */
@Component({
  selector: 'vb-calendar-strip',
  host: {
    class: 'hud hud--calendar',
    role: 'img',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': calendar strip around today, decorative. Arrow keys move the light.'",
    '(pointerleave)': 'picked.set(null)',
    '(keydown)': 'onKey($event)',
  },
  styles: `
    ol {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      border: 2px solid currentColor;
      padding: 2px 4px 10px;
      font-weight: 700;
      font-size: 0.75rem;
    }
    li.on {
      background: var(--ink);
      color: var(--ground);
    }
    small {
      display: block;
      font-size: 0.55rem;
      font-weight: 400;
    }
  `,
  template: `
    <ol aria-hidden="true">
      @for (day of days; track day.n; let i = $index) {
        <li [class.on]="i === lit()" (pointerenter)="picked.set(i)">
          {{ day.n }}<small>{{ day.d }}</small>
        </li>
      }
    </ol>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ month }}</span>
    </div>
  `,
})
export class CalendarStrip {
  private readonly clock = inject(HudClock);
  readonly caption = input('CAL_W');

  protected readonly days: { n: string; d: string }[];
  protected readonly month: string;
  protected readonly picked = signal<number | null>(null);
  protected readonly lit = computed(
    () => this.picked() ?? Math.floor(this.clock.seconds() / 1.4) % 5,
  );

  constructor() {
    const today = new Date();
    const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    this.days = [-2, -1, 0, 1, 2].map((k) => {
      const d = new Date(today);
      d.setDate(today.getDate() + k);
      return { n: String(d.getDate()).padStart(2, '0'), d: names[d.getDay()] };
    });
    this.month =
      today.toLocaleString('en', { month: 'short' }).toUpperCase() + ' ' + today.getFullYear();
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const step = e.key === 'ArrowLeft' ? -1 : 1;
    this.picked.set(((((this.picked() ?? this.lit()) + step) % 5) + 5) % 5);
    e.preventDefault();
    e.stopPropagation();
  }
}
