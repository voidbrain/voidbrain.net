import { Component, computed, inject, input, signal } from '@angular/core';
import { logLine } from '../core/hud';
import { HudClock } from './clock';

/** A scrolling terminal of fake log lines (decorative). Hover pauses it; Enter or a click prints the next line. */
@Component({
  selector: 'vb-terminal-log',
  host: {
    class: 'hud hud--terminal',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': scrolling fake log, decorative. Enter prints the next line.'",
    '(pointerenter)': 'hold.set(index())',
    '(pointerleave)': 'hold.set(null)',
    '(click)': 'step()',
    '(keydown)': 'onKey($event)',
  },
  styles: `
    ol {
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 0.88em;
      line-height: 1.45;
    }
    li {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    li:last-child::after {
      content: '_';
      animation: blink 1s steps(2) infinite;
    }
    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      li:last-child::after {
        animation: none;
      }
    }
  `,
  template: `
    <ol aria-hidden="true">
      @for (line of lines(); track line.n) {
        <li>{{ line.text }}</li>
      }
    </ol>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ hold() === null ? 'TAIL -F' : 'PAUSED' }}</span>
    </div>
  `,
})
export class TerminalLog {
  private readonly clock = inject(HudClock);
  readonly seed = input(11);
  readonly caption = input('TTY_01');
  readonly size = input(7);

  protected readonly hold = signal<number | null>(null);
  private readonly extra = signal(0);
  protected readonly index = computed(
    () => Math.floor(this.clock.seconds() * 0.9) + this.extra() + this.size(),
  );
  protected readonly lines = computed(() => {
    const last = this.hold() ?? this.index();
    return Array.from({ length: this.size() }, (_, k) => {
      const n = last - this.size() + 1 + k;
      return { n, text: logLine(this.seed(), n) };
    });
  });

  protected step(): void {
    this.extra.update((x) => x + 1);
    if (this.hold() !== null) this.hold.update((h) => h! + 1);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    this.step();
    e.preventDefault();
    e.stopPropagation();
  }
}
