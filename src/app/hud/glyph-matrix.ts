import { Component, computed, inject, input, signal } from '@angular/core';
import { glyphGrid } from '../core/hud';
import { HudClock } from './clock';

/** A flickering block of glyphs (decorative). Hover or Space freezes it; Enter reshuffles. */
@Component({
  selector: 'vb-glyph-matrix',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': flickering glyph matrix, decorative. Space freezes, Enter reshuffles.'",
    '(pointerenter)': 'hold.set(clock.tick())',
    '(pointerleave)': 'hold.set(null)',
    '(click)': 'shuffle()',
    '(keydown)': 'onKey($event)',
  },
  styles: `
    pre {
      margin: 0;
      font: 700 0.8rem / 1.15 var(--font-mono);
      letter-spacing: 0.25em;
      white-space: pre;
      overflow: hidden;
    }
  `,
  template: `
    <pre aria-hidden="true">{{ grid().join('\\n') }}</pre>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>{{ hold() === null ? 'RX' : 'HOLD' }}</span>
    </div>
  `,
})
export class GlyphMatrix {
  protected readonly clock = inject(HudClock);
  readonly seed = input(3);
  readonly caption = input('MTX_03');
  readonly lines = input(6);
  readonly cols = input(12);

  protected readonly hold = signal<number | null>(null);
  private readonly salt = signal(0);
  protected readonly grid = computed(() =>
    glyphGrid(
      this.seed() + this.salt(),
      Math.floor((this.hold() ?? this.clock.tick()) / 4),
      this.lines(),
      this.cols(),
    ),
  );

  protected shuffle(): void {
    this.salt.update((s) => s + 101);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === ' ') this.hold.set(this.hold() === null ? this.clock.tick() : null);
    else if (e.key === 'Enter') this.shuffle();
    else return;
    e.preventDefault();
    e.stopPropagation();
  }
}
