import { Component, computed, input, signal } from '@angular/core';
import { fakeQr } from '../core/hud';

/** A QR-shaped block that encodes nothing (decorative). A click or Enter redraws it. */
@Component({
  selector: 'vb-fake-qr',
  host: {
    class: 'hud',
    role: 'group',
    'aria-roledescription': 'decorative animation',
    tabindex: '0',
    '[attr.aria-label]':
      "caption() + ': decorative QR-like pattern, encodes nothing. Enter redraws it.'",
    '(click)': 'redraw()',
    '(keydown)': 'onKey($event)',
  },
  template: `
    <svg viewBox="0 0 21 21" shape-rendering="crispEdges" aria-hidden="true">
      @for (cell of cells(); track $index) {
        <rect [attr.x]="cell.x" [attr.y]="cell.y" width="1" height="1" fill="currentColor" />
      }
    </svg>
    <div class="hud__caption" aria-hidden="true">
      <span>{{ caption() }}</span><span>NULL_PAYLOAD</span>
    </div>
  `,
})
export class FakeQr {
  readonly seed = input(21);
  readonly caption = input('QR_∅');

  private readonly salt = signal(0);
  protected readonly cells = computed(() =>
    fakeQr(this.seed() + this.salt()).flatMap((row, y) =>
      row.flatMap((on, x) => (on ? [{ x, y }] : [])),
    ),
  );

  protected redraw(): void {
    this.salt.update((s) => s + 1);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    this.redraw();
    e.preventDefault();
    e.stopPropagation();
  }
}
