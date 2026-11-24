import {
  directionTo,
  DEFAULT_STATE,
  STATES,
  hashFor,
  isStateId,
  stateFromHash,
  stepState,
  swipeDelta,
} from './states';

describe('states', () => {
  it('has work, play and sleep in that order, work first', () => {
    expect(STATES).toEqual(['work', 'play', 'sleep']);
    expect(DEFAULT_STATE).toBe('work');
  });

  it('reads a state from the hash, tolerating case, the # and a trailing slash', () => {
    expect(stateFromHash('#play')).toBe('play');
    expect(stateFromHash('sleep')).toBe('sleep');
    expect(stateFromHash('#SLEEP/')).toBe('sleep');
  });

  it('falls back to the default for an empty or unknown hash', () => {
    expect(stateFromHash('')).toBe('work');
    expect(stateFromHash('#')).toBe('work');
    expect(stateFromHash('#about')).toBe('work');
    expect(isStateId('about')).toBe(false);
  });

  it('round-trips every state through its hash', () => {
    for (const s of STATES) expect(stateFromHash(hashFor(s))).toBe(s);
  });

  it('steps forward and back, wrapping around', () => {
    expect(stepState('work', 1)).toBe('play');
    expect(stepState('sleep', 1)).toBe('work');
    expect(stepState('work', -1)).toBe('sleep');
    expect(stepState('play', 4)).toBe('sleep');
  });

  it('turns a clear horizontal swipe into a step and ignores short or vertical ones', () => {
    expect(swipeDelta(-120, 10)).toBe(1);
    expect(swipeDelta(120, 10)).toBe(-1);
    expect(swipeDelta(-30, 0)).toBe(0);
    expect(swipeDelta(-90, 100)).toBe(0);
  });

  it('directionTo says whether the target is the next or the previous state', () => {
    expect(directionTo('work', 'play')).toBe(1);
    expect(directionTo('play', 'work')).toBe(-1);
    expect(directionTo('sleep', 'work')).toBe(1);
    expect(directionTo('work', 'sleep')).toBe(-1);
    expect(directionTo('play', 'play')).toBe(0);
  });
});
