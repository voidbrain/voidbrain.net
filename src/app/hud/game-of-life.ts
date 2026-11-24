import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { lifeSeed, lifeStep } from '../core/hud';
import { HudClock } from './clock';

const ROWS = 12;
const COLS = 20;
/** Generations a second. */
const RATE = 6;

/** Conway's Game of Life on a small wrapping board (decorative). Hover or Space freezes it, a click on a cell
 *  flips it, Enter or a dead board starts a new one. */
@Component({
  selector: 'vb-game-of-life',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': Game of Life, decorative. Space freezes, Enter starts a new board.'",
    '(pointerenter)': 'hovering.set(true)',
    '(pointerleave)': 'hovering.set(false)',
    '(pointerdown)': '$event.stopPropagation()',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg [attr.viewBox]="'0 0 ' + cols + ' ' + rows" aria-hidden="true" (click)="flip($event)">
      <rect width="100%" height="100%" fill="none" />
      @for (c of cells(); track $index) {
        <rect [attr.x]="c.x + 0.08" [attr.y]="c.y + 0.08" width="0.84" height="0.84" fill="currentColor" />
      }
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ frozen() ? 'HOLD' : 'GEN_' + generation() }}</span>
    </div>
  `,
})
export class GameOfLife {
  private readonly clock = inject(HudClock);
  readonly seed = input(1);
  readonly caption = input('LIFE_SIM');

  protected readonly rows = ROWS;
  protected readonly cols = COLS;
  protected readonly hovering = signal(false);
  private readonly held = signal(false);
  private readonly board = signal<boolean[][]>(lifeSeed(1, ROWS, COLS));
  protected readonly generation = signal(0);
  private restarts = 0;
  private lastStep: number | null = null;

  protected readonly frozen = computed(() => this.hovering() || this.held());
  protected readonly cells = computed(() =>
    this.board().flatMap((row, y) => row.flatMap((alive, x) => (alive ? [{ x, y }] : []))),
  );

  constructor() {
    effect(() => this.board.set(lifeSeed(this.seed(), ROWS, COLS)));
    effect(() => {
      const step = Math.floor(this.clock.seconds() * RATE);
      if (this.frozen()) return;
      untracked(() => {
        if (this.lastStep === null || step < this.lastStep) this.lastStep = step;
        // catch up at most a few generations after a pause instead of jumping
        const due = Math.min(step - this.lastStep, 3);
        this.lastStep = step;
        for (let i = 0; i < due; i++) this.advance();
      });
    });
  }

  private advance(): void {
    const next = lifeStep(this.board());
    const alive = next.some((row) => row.some(Boolean));
    if (!alive || this.generation() > 400) this.restart();
    else {
      this.board.set(next);
      this.generation.update((g) => g + 1);
    }
  }

  private restart(): void {
    this.restarts++;
    this.board.set(lifeSeed(this.seed() * 977 + this.restarts, ROWS, COLS));
    this.generation.set(0);
  }

  protected flip(e: MouseEvent): void {
    const box = (e.currentTarget as Element).getBoundingClientRect();
    if (!box.width || !box.height) return;
    const x = Math.floor(((e.clientX - box.left) / box.width) * COLS);
    const y = Math.floor(((e.clientY - box.top) / box.height) * ROWS);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    this.board.update((b) => b.map((row, r) => row.map((v, c) => (r === y && c === x ? !v : v))));
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === ' ') this.held.update((h) => !h);
    else if (e.key === 'Enter') this.restart();
    else return;
    e.preventDefault();
    e.stopPropagation();
  }
}
