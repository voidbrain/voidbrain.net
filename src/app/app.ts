import {
  Component,
  DOCUMENT,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { OWNER, POSTERS } from './core/content';
import {
  STATES,
  StateId,
  hashFor,
  isStateId,
  stateFromHash,
  stepState,
  swipeDelta,
} from './core/states';
import { SelfModel } from './figure/self-model';
import { Poster } from './poster/poster';

/** The page shell: the current state (kept in the URL hash), the state switcher, keyboard and swipe, and the
 *  persistent self-model behind the poster. */
@Component({
  selector: 'vb-root',
  imports: [Poster, SelfModel],
  host: {
    '(window:hashchange)': 'fromHash()',
    '(document:keydown)': 'onKey($event)',
  },
  templateUrl: './app.html',
})
export class App {
  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  protected readonly states = STATES;
  protected readonly owner = OWNER;
  protected readonly titles = Object.fromEntries(
    STATES.map((s) => [s, POSTERS[s].title]),
  ) as Record<StateId, string>;
  protected readonly state = signal<StateId>(stateFromHash(this.doc.location.hash));
  protected readonly posters = POSTERS;
  protected readonly poster = computed(() => POSTERS[this.state()]);
  /** The previous and the next state, shown at the sides on wide screens. */
  protected readonly neighbours = computed(
    () => [stepState(this.state(), -1), stepState(this.state(), 1)] as const,
  );
  protected readonly announcement = computed(() => `${this.poster().title} poster`);

  private swipeStart: { x: number; y: number } | null = null;

  constructor() {
    effect(() => {
      const state = this.state();
      this.doc.documentElement.dataset['state'] = state;
      this.doc.title = `${POSTERS[state].title} · voidbrain.net · ${OWNER.name}`;
    });
  }

  protected go(state: StateId): void {
    if (state === this.state()) return;
    // the poster is recreated: if focus was inside it, give it to the new heading instead of <body>
    const focusInPoster = !!this.doc.activeElement?.closest('vb-poster');
    this.state.set(state);
    if (focusInPoster) this.focusTitle();
    const hash = hashFor(state);
    if (this.doc.location.hash !== hash) this.doc.defaultView?.history.pushState(null, '', hash);
  }

  protected step(delta: number): void {
    this.go(stepState(this.state(), delta));
  }

  /** Only a state hash (or none) changes the state: an in-page anchor such as #poster-title must not. */
  protected fromHash(): void {
    const id = this.doc.location.hash.replace(/^#/, '').toLowerCase();
    if (id && !isStateId(id)) return;
    this.state.set(stateFromHash(this.doc.location.hash));
  }

  protected skipToContent(e: Event): void {
    e.preventDefault();
    this.focusTitle(true);
  }

  private focusTitle(now = false): void {
    const focus = () => this.doc.getElementById('poster-title')?.focus();
    if (now) focus();
    else afterNextRender(focus, { injector: this.injector });
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    // the target can be the document itself, which has no closest()
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      this.step(e.key === 'ArrowRight' ? 1 : -1);
      e.preventDefault();
    }
  }

  protected onPointerDown(e: PointerEvent): void {
    this.swipeStart = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
  }

  protected onPointerUp(e: PointerEvent): void {
    if (!this.swipeStart) return;
    const delta = swipeDelta(e.clientX - this.swipeStart.x, e.clientY - this.swipeStart.y);
    this.swipeStart = null;
    if (delta) this.step(delta);
  }
}
