// The three states of the page (docs/DESIGN.md, "The idea"): their order, and how they map to the URL hash.

export const STATES = ['work', 'play', 'sleep'] as const;
export type StateId = (typeof STATES)[number];

export const DEFAULT_STATE: StateId = 'work';

export function isStateId(value: string): value is StateId {
  return (STATES as readonly string[]).includes(value);
}

/** The state a URL hash names (`#play`, `play`, `#PLAY/`), or the default for anything else. */
export function stateFromHash(hash: string): StateId {
  const id = hash.replace(/^#/, '').replace(/\/+$/, '').trim().toLowerCase();
  return isStateId(id) ? id : DEFAULT_STATE;
}

export function hashFor(state: StateId): string {
  return `#${state}`;
}

/** Which way a switch moves along the ring of states: 1 to the next one, -1 to the previous one, 0 for none. */
export function directionTo(from: StateId, to: StateId): -1 | 0 | 1 {
  if (from === to) return 0;
  return stepState(from, 1) === to ? 1 : -1;
}

/** The state `delta` steps away, wrapping around (work → play → sleep → work). */
export function stepState(current: StateId, delta: number): StateId {
  const n = STATES.length;
  const i = STATES.indexOf(current);
  return STATES[(((i + delta) % n) + n) % n];
}

/** The swipe a horizontal drag means: left (next), right (previous) or none. */
export function swipeDelta(dx: number, dy: number, threshold = 60): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
