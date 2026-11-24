import { DOCUMENT, DestroyRef, Service, computed, inject, signal } from '@angular/core';

/** One animation clock for every HUD piece: ~30 ticks a second, paused while the tab is hidden, and stopped
 *  (a single still frame) when the visitor asks for reduced motion. */
@Service()
export class HudClock {
  private readonly doc = inject(DOCUMENT);
  private readonly win = this.doc.defaultView;
  private readonly elapsed = signal(0);
  private readonly hidden = signal(this.doc.visibilityState === 'hidden');
  private readonly motionQuery = this.win?.matchMedia?.('(prefers-reduced-motion: reduce)');

  /** True when the visitor prefers reduced motion. */
  readonly reducedMotion = signal(this.motionQuery?.matches ?? false);
  /** Seconds since the page started animating; frozen while hidden or with reduced motion. */
  readonly seconds = this.elapsed.asReadonly();
  /** Whole ticks (30 a second), for pieces that change in steps. */
  readonly tick = computed(() => Math.floor(this.elapsed() * 30));

  private frame = 0;
  private last = 0;

  constructor() {
    const onVisibility = () => {
      this.hidden.set(this.doc.visibilityState === 'hidden');
      this.resume();
    };
    const onMotion = (e: MediaQueryListEvent) => {
      this.reducedMotion.set(e.matches);
      this.resume();
    };
    this.doc.addEventListener('visibilitychange', onVisibility);
    this.motionQuery?.addEventListener?.('change', onMotion);
    inject(DestroyRef).onDestroy(() => {
      this.doc.removeEventListener('visibilitychange', onVisibility);
      this.motionQuery?.removeEventListener?.('change', onMotion);
      if (this.frame) this.win?.cancelAnimationFrame(this.frame);
    });
    this.resume();
  }

  /** Starts the loop if the clock should run and is not running; a frozen clock schedules no frames. */
  private resume(): void {
    if (this.frame || this.hidden() || this.reducedMotion() || !this.win?.requestAnimationFrame)
      return;
    this.last = 0;
    this.frame = this.win.requestAnimationFrame((t) => this.loop(t));
  }

  private loop(now: number): void {
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    // 30 updates a second is enough for the HUD and halves the change detection work
    if (now - this.last >= 1000 / 30 || !this.last) {
      this.last = now;
      this.elapsed.update((s) => s + dt);
    }
    // keep going while it should run; otherwise stop, and resume() restarts it on the next change
    this.frame =
      this.hidden() || this.reducedMotion()
        ? 0
        : this.win!.requestAnimationFrame((t) => this.loop(t));
  }
}
